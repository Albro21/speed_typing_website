from django.contrib.auth.models import User
from django.db import models
from django.utils.timezone import now


class Story(models.Model):
    title = models.CharField(max_length=200)
    text = models.TextField()
    
    class Meta:
        verbose_name_plural = "stories"
    
    @property
    def word_count(self):
        return len(self.text.split())
    
    @property
    def character_count(self):
        return len(self.text)
    
    def __str__(self):
        return self.title

  
class TypingTestResult(models.Model):
    TEST_TYPE_CHOICES = [
        ('timed', 'Timed'),
        ('page', 'Page'),
        # ('quote', 'Quote'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='typing_results', blank=True, null=True)
    test_type = models.CharField(max_length=10, choices=TEST_TYPE_CHOICES, blank=True, null=True)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='test_results', blank=True, null=True)
    
    wpm = models.FloatField(help_text="Words per minute", blank=True, null=True)
    duration = models.FloatField(help_text="Duration in seconds", blank=True, null=True)
    accuracy = models.FloatField(help_text="Accuracy in percentage", blank=True, null=True)
    correct_count = models.PositiveIntegerField(help_text="Total number of correct words", blank=True, null=True)
    mistake_count = models.PositiveIntegerField(help_text="Total number of mistakes", blank=True, null=True)

    mistyped_letters = models.JSONField(
        help_text="JSON mapping of mistyped letters and their counts", default=dict, blank=True, null=True
    )
    letter_timings = models.JSONField(
        help_text="JSON mapping of letters and average delays", default=dict, blank=True, null=True
    )
    speed_curve = models.JSONField(
        help_text="JSON mapping of second-by-second WPM (for charting)", default=dict, blank=True, null=True
    )

    created_at = models.DateTimeField(default=now)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Typing Test Result'
        verbose_name_plural = 'Typing Test Results'

    def __str__(self):
        return f"{self.test_type.capitalize()} | {self.user.username} | {self.story.title} | {self.wpm:.1f} WPM | {self.accuracy:.1f}%"
