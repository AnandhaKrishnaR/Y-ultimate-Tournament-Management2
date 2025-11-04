from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    
    
    ROLE_CHOICES = (
        ('ADMIN', 'Admin / Director'),
        ('MANAGER', 'Team Manager / Captain'),
        ('COACH', 'Coach / Facilitator'),
        ('VOLUNTEER', 'Volunteer / Field Official'),
        ('PLAYER', 'Player / Child Profile'),
        ('SPECTATOR', 'Spectator / Fan'),
    )

    
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)

    def __str__(self):
        return self.username