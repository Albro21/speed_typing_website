from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods

from datetime import date
import json

from .models import Story, TypingTestResult


def get_results_history(typing_results):
    if typing_results:
        labels = []
        wpm_data = []
        accuracy_data = []
        
        for result in typing_results:
            labels.append(result.created_at.strftime('%d/%m/%y'))
            wpm_data.append(result.wpm)
            accuracy_data.append(result.accuracy)
        
        return {
            "labels": labels,
            "wpm_data": wpm_data,
            "accuracy_data": accuracy_data
        }
    return None

def format_daily_goal(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours:02}:{minutes:02}:{secs:02}"
    else:
        return f"{minutes:02}:{secs:02}"

def format_total_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}h {minutes}m {secs}s"
    else:
        return f"{minutes}m {secs}s"

def index(request):
    all_results = request.user.typing_results.all()
    
    today_results = all_results.filter(created_at__date=date.today())
    total_seconds = int(sum(result.duration for result in today_results))
    formatted_duration = format_daily_goal(total_seconds)
    
    avg_wpm = round(sum(result.wpm for result in all_results) / len(all_results), 2)
    avg_accuracy = round(sum(result.accuracy for result in all_results) / len(all_results), 2)
    total_time = format_total_time(int(sum(result.duration for result in all_results)))
    
    context = {
        "daily_goal": f"{formatted_duration} / 15:00",
        "avg_wpm": avg_wpm,
        "avg_accuracy": avg_accuracy,
        "total_time": total_time,
    }
    
    return render(request, 'typeapp/index.html', context)

@login_required
def timedtests(request):
    typing_results = request.user.typing_results.filter(test_type='timed').order_by("created_at")
    
    results_1m = typing_results.filter(duration=60)
    chart_data_1m = get_results_history(results_1m)
    
    results_3m = typing_results.filter(duration=180)
    chart_data_3m = get_results_history(results_3m)
    
    results_5m = typing_results.filter(duration=300)
    chart_data_5m= get_results_history(results_5m)
    
    context = {
        "chart_data_1m": chart_data_1m,
        "chart_data_3m": chart_data_3m,
        "chart_data_5m": chart_data_5m,
    }
    
    return render(request, 'typeapp/timedtests.html', context)

def timedtest(request, time):
    valid_durations = [1, 3, 5]
    
    random_story = Story.objects.order_by('?').first()
    
    context = {
        'story': random_story
    }
    
    if time in valid_durations:
        context['duration'] = time
        return render(request, 'typeapp/timedtest.html', context)
    else:
        return redirect('index')

@require_http_methods(["POST"])
@login_required
def create_result(request):
    data = json.loads(request.body)
    story = Story.objects.get(id=data.get('story_id'))

    result = TypingTestResult.objects.create(
        user = request.user,
        test_type=data.get('test_type'),
        story=story,
        wpm=data.get('wpm'),
        duration=data.get('duration'),
        accuracy=data.get('accuracy'),
        correct_count=data.get('correct_count'),
        mistake_count=data.get('mistake_count'),
        mistyped_letters=data.get('mistyped_letters'),
        letter_timings=data.get('letter_timings'),
        speed_curve=data.get('speed_curve'),
    )

    return JsonResponse({'status': 'success', 'result_id': result.id})

def result_detail(request, result_id):  
    result = TypingTestResult.objects.get(id=result_id)
    return render(request, 'typeapp/result_detail.html', {'result': result})

def pagetests(request):
    return render(request, 'typeapp/pagetests.html')
