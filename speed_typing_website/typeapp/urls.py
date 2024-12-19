from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('timedtests', views.timedtests, name='timedtests'),
    path('timedtest/<int:time>m-test', views.timedtest, name='timedtest'),
    path('pagetests', views.pagetests, name='pagetests'),
]
