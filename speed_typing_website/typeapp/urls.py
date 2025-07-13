from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('leaderboards/', views.leaderboards, name='leaderboards'),
    path('get-leaderboard/', views.get_leaderboard, name='get_leaderboard'),
    path('practice/', views.practice, name='practice'),
    path('test/', views.test, name='test'),
    
    path('results/create/', views.create_result, name='create_result'),
    path('results/<int:result_id>/', views.result_detail, name='result_detail'),
]
