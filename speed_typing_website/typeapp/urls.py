from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('timedtests', views.timedtests, name='timedtests'),
    path('pagetests', views.pagetests, name='pagetests'),
]
