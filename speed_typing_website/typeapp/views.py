from django.shortcuts import render, redirect
from .models import Story
import re


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

def pagetests(request):
    return render(request, 'typeapp/pagetests.html')
