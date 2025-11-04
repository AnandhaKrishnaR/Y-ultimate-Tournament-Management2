from django.db import models
from users.models import CustomUser 

class DiscussionThread(models.Model):
   
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="threads")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at'] 

    def __str__(self):
        return self.title

class ThreadReply(models.Model):
    
    thread = models.ForeignKey(DiscussionThread, on_delete=models.CASCADE, related_name="replies")
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="replies")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at'] 

    def __str__(self):
        return f"Reply by {self.author.username} on {self.thread.title}"

class Resource(models.Model):
   
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    file = models.FileField(upload_to='resources/') 
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title