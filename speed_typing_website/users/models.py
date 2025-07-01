from datetime import date
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager


class Level(models.Model):
    level = models.IntegerField(unique=True)
    title = models.CharField(max_length=20)
    description = models.CharField(max_length=100)
    exp_to_next = models.IntegerField()

    class Meta:
        ordering = ['level']

    def __str__(self):
        return f'Level {self.level} - {self.title}'


class CustomUser(AbstractUser):
    DAILY_GOAL_CHOICES = [
        (5, '5:00'),
        (10, '10:00'),
        (15, '15:00'),
        (20, '20:00'),
        (30, '30:00'),
    ]
    
    username = None 
    email = models.EmailField(_('email address'), unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = CustomUserManager()
    
    level = models.ForeignKey(Level, on_delete=models.SET_NULL, null=True, blank=True)
    exp = models.IntegerField(default=0)
    daily_goal = models.IntegerField(choices=DAILY_GOAL_CHOICES, default=10)
    
    @property
    def avg_wpm(self):
        if not self.typing_results.all():
            return 0
        return round(sum(result.wpm for result in self.typing_results.all()) / len(self.typing_results.all()), 2)
    
    @property
    def avg_accuracy(self):
        if not self.typing_results.all():
            return 0
        return round(sum(result.accuracy for result in self.typing_results.all()) / len(self.typing_results.all()), 2)
    
    @property
    def total_time(self):
        return int(sum(result.duration for result in self.typing_results.all()))
    
    @property
    def total_time_formatted(self):
        hours, remainder = divmod(self.total_time, 3600)
        minutes, secs = divmod(remainder, 60)
        if hours:
            return f"{hours}h {minutes}m {secs}s"
        else:
            return f"{minutes}m {secs}s"
        
    @property
    def today_total_time(self):
        return sum(result.duration for result in self.typing_results.filter(created_at__date=date.today()))

    @property
    def today_total_time_formatted(self):
        minutes, secs = divmod(self.today_total_time, 60)
        return f"{minutes}:{secs:02d}"
    
    @property
    def exp_progress(self):
        return round(self.exp / self.level.exp_to_next * 100)
    
    def add_exp(self, amount):
        self.exp += amount
        while self.level and self.exp >= self.level.exp_to_next:
            next_level = Level.objects.filter(level=self.level.level + 1).first()
            if not next_level:
                break
            self.exp -= self.level.exp_to_next
            self.level = next_level
        self.save()
