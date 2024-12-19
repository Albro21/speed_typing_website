from django.db import models


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