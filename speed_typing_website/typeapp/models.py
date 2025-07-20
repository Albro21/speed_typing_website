from django.db import models
from django.utils.timezone import now


LENGTH_CHOICES = [
    ('short', 'Short'),
    ('medium', 'Medium'),
    ('long', 'Long'),
]

TEST_TYPE_CHOICES = [
    ('timed', 'Timed'),
    ('fixed', 'Fixed-Length'),
]

class TextBase(models.Model):
    title = models.CharField(max_length=200)
    text = models.TextField()
    length = models.CharField(max_length=10, choices=LENGTH_CHOICES, default='medium')

    more_numbers = models.BooleanField(default=False)
    more_punctuation = models.BooleanField(default=False)
    more_capitals = models.BooleanField(default=False)

    class Meta:
        abstract = True

    @property
    def word_count(self):
        return len(self.text.split())

    @property
    def character_count(self):
        return len(self.text)

    def __str__(self):
        return self.title


class Story(TextBase):
    class Meta:
        verbose_name_plural = "stories"


class Article(TextBase):
    class Meta:
        verbose_name_plural = "articles"


class TypingTestResult(models.Model):
    user = models.ForeignKey("users.CustomUser", on_delete=models.CASCADE, related_name='typing_results', blank=True, null=True)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='test_results', blank=True, null=True)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='test_results', blank=True, null=True)
    test_type = models.CharField(max_length=10, choices=TEST_TYPE_CHOICES, blank=True, null=True)
    length = models.CharField(max_length=10, choices=LENGTH_CHOICES, blank=True, null=True)

    wpm = models.FloatField(help_text="Words per minute", blank=True, null=True)
    duration = models.PositiveIntegerField(help_text="Duration in seconds", blank=True, null=True)
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
        user_str = self.user.username if self.user else "Anonymous"
        if self.story:
            title = self.story.title
        elif self.article:
            title = self.article.title
        else:
            title = "Random Words"
        return f"{self.test_type.capitalize()} | {title} | {user_str} | {self.wpm:.1f} WPM | {self.accuracy:.1f}%"
