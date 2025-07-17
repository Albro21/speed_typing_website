from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('daily-goal/edit/', views.edit_daily_goal, name='edit_daily_goal'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('register/', views.register_view, name='register'),
    path('toggle-theme/', views.toggle_theme, name='toggle_theme'),
]
