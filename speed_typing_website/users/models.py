# Standart Libs
from datetime import date
import math

# Django
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

# Local
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

    nickname = models.CharField(max_length=30)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    level = models.ForeignKey(Level, on_delete=models.SET_NULL, null=True, blank=True)
    exp = models.IntegerField(default=0)
    daily_goal = models.IntegerField(choices=DAILY_GOAL_CHOICES, default=10)

    def __str__(self):
        return f"{self.nickname} ({self.email})"

    @property
    def avg_wpm(self):
        valid_wpms = [r.wpm for r in self.typing_results.all() if r.wpm is not None]
        return round(sum(valid_wpms) / len(valid_wpms), 2) if valid_wpms else 0

    @property
    def avg_accuracy(self):
        valid_accuracies = [r.accuracy for r in self.typing_results.all() if r.accuracy is not None]
        return round(sum(valid_accuracies) / len(valid_accuracies), 2) if valid_accuracies else 0

    @property
    def total_time(self):
        return int(sum(result.duration for result in self.typing_results.all() if result.duration is not None))

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
        return sum(result.duration for result in self.typing_results.filter(created_at__date=date.today()) if result.duration is not None)

    @property
    def today_total_time_formatted(self):
        minutes, secs = divmod(self.today_total_time, 60)
        return f"{minutes}:{secs:02d}"

    @property
    def daily_goal_progress(self):
        CIRCUMFERENCE = 2 * math.pi * 54
        if self.daily_goal == 0:
            return CIRCUMFERENCE
        progress = self.today_total_time / (self.daily_goal * 60)
        progress = min(progress, 1)
        return CIRCUMFERENCE * (1 - progress)  # dashoffset length

    @property
    def exp_progress(self):
        if not self.level or not self.level.exp_to_next:
            return 0
        return round(self.exp / self.level.exp_to_next * 100)

    @property
    def test_count(self):
        return self.typing_results.count()
    
    def check_achievements(self, recent_result=None):
        unlocked_ids = set(self.unlocked_achievements.values_list('achievement_id', flat=True))
        newly_unlocked = []

        for achievement in Achievement.objects.select_related('group').order_by('-level'):
            if achievement.id in unlocked_ids:
                continue

            group_name = achievement.group.name
            value = None

            if group_name == AchievementGroupType.WPM and recent_result:
                value = recent_result.wpm
            elif group_name == AchievementGroupType.ACCURACY and recent_result:
                value = recent_result.accuracy
            elif group_name == AchievementGroupType.TEST_COUNT:
                value = self.test_count
            elif group_name == AchievementGroupType.TYPING_TIME:
                value = self.total_time
            elif group_name == AchievementGroupType.LEVEL:
                value = self.level.level if self.level else 0

            if value is not None and value >= achievement.requirement_value:
                # Check if user already has a higher or equal level achievement in this group
                current_highest = self.unlocked_achievements.filter(
                    achievement__group=achievement.group
                ).order_by('-achievement__level').first()

                if current_highest and current_highest.achievement.level >= achievement.level:
                    # User already has higher or equal achievement, skip
                    continue

                # Remove lower level achievements in this group
                self.unlocked_achievements.filter(
                    achievement__group=achievement.group,
                    achievement__level__lt=achievement.level
                ).delete()

                # Unlock this achievement
                UserAchievement.objects.create(user=self, achievement=achievement)
                newly_unlocked.append(achievement)

        return newly_unlocked

    def add_exp(self, amount):
        self.exp += amount
        while self.level and self.exp >= self.level.exp_to_next:
            next_level = Level.objects.filter(level=self.level.level + 1).first()
            if not next_level:
                break
            self.exp -= self.level.exp_to_next
            self.level = next_level
        self.save()


class AchievementGroupType(models.TextChoices):
    WPM = "WPM", "Words Per Minute"
    TEST_COUNT = "TEST_COUNT", "Test Count"
    TYPING_TIME = "TYPING_TIME", "Typing Time"
    ACCURACY = "ACCURACY", "Accuracy"
    LEVEL = "LEVEL", "Level"


class AchievementGroup(models.Model):
    name = models.CharField(max_length=50, unique=True, choices=AchievementGroupType.choices)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.get_name_display()


class Achievement(models.Model):
    group = models.ForeignKey(AchievementGroup, on_delete=models.CASCADE, related_name='achievements')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    requirement_value = models.FloatField()
    level = models.IntegerField(default=1)
    icon = models.ImageField(upload_to="achievements/", blank=True, null=True)

    class Meta:
        unique_together = ('group', 'requirement_value')
        ordering = ['group__name', 'level']

    def __str__(self):
        return f"{self.name}"


class UserAchievement(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='unlocked_achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f"{self.user.email} unlocked {self.achievement.name}"
