from django.db import models


class Note(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    attachment = models.FileField(upload_to='attachments/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
