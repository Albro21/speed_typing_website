from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('speedtests', views.speedtests, name='speedtests'),
]
