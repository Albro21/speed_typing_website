from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('timedtests', views.timedtests, name='timedtests'),
    path('timedtest/<int:time>m-test', views.timedtest, name='timedtest'),
    path('result/create/', views.create_result, name='create_result'),
    path('result/<int:result_id>/', views.result_detail, name='result_detail'),
    path('pagetests', views.pagetests, name='pagetests'),
]
