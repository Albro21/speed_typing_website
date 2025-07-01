from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, Level

@receiver(post_save, sender=CustomUser)
def set_default_level(sender, instance, created, **kwargs):
    if created and not instance.level:
        level_one = Level.objects.filter(level=1).first()
        if level_one:
            instance.level = level_one
            instance.save()
