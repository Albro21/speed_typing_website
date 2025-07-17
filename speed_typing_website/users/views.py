# Standart Libs
import json

# Django
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods


# Local
from .forms import CustomUserCreationForm, CustomLoginForm
from .models import Achievement
from typeapp.models import TypingTestResult


def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('users:login')
    else:
        form = CustomUserCreationForm()
    return render(request, 'users/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = CustomLoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('index')
    else:
        form = CustomLoginForm()
    return render(request, 'users/login.html', {'form': form})

@login_required
def logout_view(request):
    logout(request)
    return redirect('users:login')

@require_http_methods(["PATCH"])
@login_required
def edit_daily_goal(request):
    data = json.loads(request.body)
    daily_goal = int(data.get('daily_goal'))
    if daily_goal:
        request.user.daily_goal = int(daily_goal)
        request.user.save()
    return JsonResponse({'success': True, 'message': 'Daily goal updated successfully.'}, status=200)

@login_required
def profile(request):
    user = request.user
    
    achievements = Achievement.objects.filter(userachievement__user=request.user).select_related('group').order_by('-level')

    durations = [30, 60, 180, 300]

    max_wpm = {}
    max_accuracy = {}

    for dur in durations:
        results = TypingTestResult.objects.filter(user=user, duration=dur)
        max_wpm_result = results.order_by('-wpm').first()

        if max_wpm_result:
            max_wpm[dur] = round(max_wpm_result.wpm, 2)
            max_accuracy[dur] = round(max_wpm_result.accuracy, 2) if max_wpm_result.accuracy is not None else 0
        else:
            max_wpm[dur] = 0
            max_accuracy[dur] = 0

    context = {
        'max_wpm_30s': max_wpm[30],
        'max_accuracy_30s': f"{max_accuracy[30]}%",
        'max_wpm_1m': max_wpm[60],
        'max_accuracy_1m': f"{max_accuracy[60]}%",
        'max_wpm_3m': max_wpm[180],
        'max_accuracy_3m': f"{max_accuracy[180]}%",
        'max_wpm_5m': max_wpm[300],
        'max_accuracy_5m': f"{max_accuracy[300]}%",
        "achievements": achievements,
    }
    return render(request, 'users/profile.html', context)

@require_http_methods(["POST"])
@login_required
def edit_profile(request):
    nickname = request.POST.get('nickname')
    bio = request.POST.get('bio')
    profile_picture = request.FILES.get('profile_picture')

    if nickname:
        request.user.nickname = nickname
    if bio:
        request.user.bio = bio
    if profile_picture:
        request.user.profile_picture = profile_picture

    request.user.save()
    return JsonResponse({'success': True, 'message': 'Profile updated successfully.'})

@require_http_methods(["POST"])
@login_required
def toggle_theme(request):
    request.user.toggle_theme()
    return JsonResponse({'success': True, 'theme': request.user.theme})
