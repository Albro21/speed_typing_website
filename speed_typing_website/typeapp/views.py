# Standart Libs
from collections import defaultdict
import json

# Django
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods

# Third-party
from wonderwords import RandomWord

# Local
from .models import Article, Story, TypingTestResult
from users.models import Achievement


# Returns a dict with data for the history chart
def get_history_chart_data(typing_results):
    labels = []
    wpm_data = []
    accuracy_data = []

    for result in typing_results:
        if result.wpm == 0:
            continue  # Skip results with 0 WPM

        labels.append(result.created_at.isoformat())
        wpm_data.append(result.wpm)
        accuracy_data.append(result.accuracy)

    return {
        "labels": labels,
        "wpm_data": wpm_data,
        "accuracy_data": accuracy_data
    }

# Returns a dict with data for the mistakes chart
def get_mistakes_chart_data(typing_results):
    letter_mistake_totals = defaultdict(int)

    for result in typing_results:
        if result.mistyped_letters:
            for letter, count in result.mistyped_letters.items():
                if letter != ' ':
                    letter_mistake_totals[letter] += count

    sorted_mistakes = sorted(letter_mistake_totals.items(), key=lambda x: x[1], reverse=True)[:15]

    labels = [item[0] for item in sorted_mistakes]
    data = [item[1] for item in sorted_mistakes]

    return {
        "labels": labels,
        "data": data
    }

# Formats daily goal from seconds to HH:MM:SS
def format_daily_goal(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours:02}:{minutes:02}:{secs:02}"
    else:
        return f"{minutes:02}:{secs:02}"

# Formats total time from seconds to HHh MMm SSs
def format_total_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}h {minutes}m {secs}s"
    else:
        return f"{minutes}m {secs}s"

@login_required
def index(request):
    typing_results = request.user.typing_results.order_by("created_at")
    history_chart_data = get_history_chart_data(typing_results)
    mistakes_chart_data = get_mistakes_chart_data(typing_results)
    achievements = Achievement.objects.filter(userachievement__user=request.user).select_related('group').order_by('-level')

    context = {
        "history_chart_data": history_chart_data,
        "mistakes_chart_data": mistakes_chart_data,
        "achievements": achievements,
    }
    return render(request, 'typeapp/index.html', context)

# Gets a random text based on the model, length, and difficulty
def get_random_text(model, length, difficulty, extras_list):
    qs = model.objects.all()

    if length:
        qs = qs.filter(length=length)
    if difficulty:
        qs = qs.filter(difficulty=difficulty)

    if 'numbers' in extras_list:
        qs = qs.filter(more_numbers=True)
    if 'punctuation' in extras_list:
        qs = qs.filter(more_punctuation=True)
    if 'capitals' in extras_list:
        qs = qs.filter(more_capitals=True)

    return qs.order_by('?').first()

# Converts a value to an int or returns the default if it can't be converted
def to_int(value, default):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

# Gets an object from the database based on the model and obj_id, or None if it can't be found
def get_object_or_none(model, obj_id):
    try:
        if obj_id and int(obj_id) != 0:
            return model.objects.get(id=obj_id)
    except (model.DoesNotExist, TypeError, ValueError):
        pass
    return None

@login_required
def practice(request):
    return render(request, 'typeapp/practice.html')

@require_http_methods(["GET"])
@login_required
def test(request):
    # Get the test type and duration from the request
    test_type = request.GET.get('test_type', 'timed')
    duration = to_int(request.GET.get('duration'), None)
    word_count = to_int(request.GET.get('word_count'), 500)
    text_type = request.GET.get('text_type', 'story')
    difficulty = request.GET.get('difficulty', 'medium')
    length = request.GET.get('length', 'long')
    extras = request.GET.get('extras', '')
    extras_list = [e.strip() for e in extras.split(',')] if extras else []

    # Get a random text based on the model, length, and difficulty
    story = None
    article = None
    text_to_display = ''

    if text_type == 'story':
        story = get_random_text(Story, length, difficulty, extras_list)
        text_to_display = story.text if story else ''

    elif text_type == 'article':
        article = get_random_text(Article, length, difficulty, extras_list)
        text_to_display = article.text if article else ''

    elif text_type == 'random':
        # Get a random text from the wonderwords library
        rw = RandomWord()

        word_min_length = word_max_length = None
        if difficulty == 'easy':
            word_min_length, word_max_length = 3, 6
        elif difficulty == 'medium':
            word_min_length, word_max_length = 6, 10
        elif difficulty == 'hard':
            word_min_length, word_max_length = 10, 50

        words = rw.random_words(
            word_count,
            word_min_length=word_min_length,
            word_max_length=word_max_length
        )
        text_to_display = ' '.join(words)

    # Fallback to story
    else:
        story = get_random_text(Story, length, difficulty)
        text_to_display = story.text if story else ''

    context = {
        'test_type': test_type,
        'duration': duration,
        'text_type': text_type,
        'difficulty': difficulty,
        'length': length,
        'extras': extras_list,
        'story_id': story.id if story else 0,
        'article_id': article.id if article else 0,
        'text_to_display': text_to_display,
    }

    return render(request, 'typeapp/test.html', context)

@require_http_methods(["POST"])
@login_required
def create_result(request):
    # Get the data from the request
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")

    story = get_object_or_none(Story, data.get('story_id'))
    article = get_object_or_none(Article, data.get('article_id'))

    # Basic required fields validation (optional, add more as needed)
    required_fields = ['test_type', 'wpm', 'duration', 'accuracy', 'correct_count', 'mistake_count']
    if not all(field in data for field in required_fields):
        return HttpResponseBadRequest("Missing required fields")

    # Save the result to the database
    result = TypingTestResult.objects.create(
        user=request.user,
        test_type=data.get('test_type'),
        difficulty=data.get('difficulty'),
        length=data.get('length'),
        story=story,
        article=article,
        wpm=data.get('wpm'),
        duration=data.get('duration'),
        accuracy=data.get('accuracy'),
        correct_count=data.get('correct_count'),
        mistake_count=data.get('mistake_count'),
        mistyped_letters=data.get('mistyped_letters') or {},
        letter_timings=data.get('letter_timings') or {},
        speed_curve=data.get('speed_curve') or {},
    )

    # Add experience points (if any)
    try:
        exp_to_add = int(data.get('duration'))
        request.user.add_exp(exp_to_add)
    except (TypeError, ValueError, AttributeError):
        pass

    return JsonResponse({'status': 'success', 'result_id': result.id}, status=201)

@login_required
def result_detail(request, result_id):
    user = request.user
    result = get_object_or_404(TypingTestResult, id=result_id, user=user)
    unlocked_achievements = user.check_achievements(recent_result=result)

    context = {
        'result': result,
        'unlocked_achievements': unlocked_achievements,
    }

    return render(request, 'typeapp/result_detail.html', context)

from django.utils.timezone import now, timedelta
from django.db.models import Count, Avg, Sum, Max

@require_http_methods(["GET"])
@login_required
def get_leaderboard(request):
    metric = request.GET.get("metric", "wpm")
    timeframe = request.GET.get("timeframe", "daily")

    now_ = now()
    if timeframe == "daily":
        since = now_ - timedelta(days=1)
    elif timeframe == "weekly":
        since = now_ - timedelta(weeks=1)
    elif timeframe == "monthly":
        since = now_ - timedelta(days=30)
    else:
        since = None

    queryset = TypingTestResult.objects.filter(user__isnull=False)
    if since:
        queryset = queryset.filter(created_at__gte=since)

    if metric == "wpm":
        # Step 1: Aggregate average WPM per user
        aggregated = queryset.values("user__id", "user__nickname").annotate(
            value=Avg("wpm"),
            latest_test_id=Max("id")  # used to grab latest result for that user
        ).order_by("-value")[:50]

        # Step 2: Map latest accuracy and created_at using subquery
        test_ids = [entry["latest_test_id"] for entry in aggregated]
        latest_tests = TypingTestResult.objects.filter(id__in=test_ids).values("id", "accuracy", "created_at")

        # Build lookup dict for enrichment
        accuracy_lookup = {t["id"]: {"accuracy": t["accuracy"], "created_at": t["created_at"]} for t in latest_tests}

        leaderboard = []
        for entry in aggregated:
            extra = accuracy_lookup.get(entry["latest_test_id"], {})
            leaderboard.append({
                "user_id": entry["user__id"],
                "nickname": entry["user__nickname"],
                "value": round(entry["value"], 2),
                "accuracy": extra.get("accuracy"),
                "created_at": extra.get("created_at"),
            })

    elif metric == "completed":
        leaderboard = list(
            queryset.values("user__id", "user__nickname")
            .annotate(value=Count("id"))
            .order_by("-value")[:50]
        )

    elif metric == "time":
        leaderboard = list(
            queryset.values("user__id", "user__nickname")
            .annotate(value=Sum("duration"))
            .order_by("-value")[:50]
        )

    else:
        return JsonResponse({"status": "error", "message": "Invalid metric"}, status=400)

    return JsonResponse(leaderboard, safe=False)

@require_http_methods(["GET"])
@login_required
def leaderboards(request):
    return render(request, 'typeapp/leaderboards.html')
