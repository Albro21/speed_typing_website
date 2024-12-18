from django.shortcuts import render


def index(request):
    return render(request, 'typeapp/index.html')

def timedtests(request):
    return render(request, 'typeapp/timedtests.html')

def pagetests(request):
    return render(request, 'typeapp/pagetests.html')