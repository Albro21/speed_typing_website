from datetime import date
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    DAILY_GOAL_CHOICES = [
        (5, '5:00'),
        (10, '10:00'),
        (15, '15:00'),
        (20, '20:00'),
        (30, '30:00'),
    ]
    
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    daily_goal = models.IntegerField(choices=DAILY_GOAL_CHOICES, default=10)
    
    @property
    def avg_wpm(self):
        return round(sum(result.wpm for result in self.typing_results.all()) / len(self.typing_results.all()), 2)
    
    @property
    def avg_accuracy(self):
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