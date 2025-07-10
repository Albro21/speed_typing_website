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
