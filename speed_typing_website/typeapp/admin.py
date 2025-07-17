from django.contrib import admin
from .models import Article, Story, TypingTestResult


admin.site.register(Article)
admin.site.register(Story)
admin.site.register(TypingTestResult)
