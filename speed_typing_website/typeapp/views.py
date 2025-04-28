from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods

import json

from .models import Story, TypingTestResult


def index(request):
    return render(request, 'typeapp/index.html')

def timedtests(request):
    return render(request, 'typeapp/timedtests.html')

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
