from django.db import models
from django.contrib.auth import get_user_model
from users.models import CustomUser 

User = get_user_model()


class ChildProfile(models.Model):
   
   
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True)
    
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=[('M', 'Male'), ('F', 'Female'), ('Other', 'Other')],
        null=True,
        blank=True
    )
    participation_history = models.JSONField(
        default=dict,
        null=True,
        blank=True,
        help_text="JSON field for transfer/dropout records"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    assigned_coach = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_children',
        limit_choices_to={'role': 'COACH'} 
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        
        return f"Child Profile for {self.user.username}"


class Session(models.Model):
   
    
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('LIVE', 'Live'),
        ('COMPLETED', 'Completed'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='SCHEDULED')
    
    
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=200)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_sessions'
    )
    
    
    assigned_coach = models.ForeignKey(
        User,
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name='assigned_sessions',
        limit_choices_to={'role': 'COACH'} 
    )
    

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"Session on {self.date} at {self.time} - {self.location}"
    
class Attendance(models.Model):
    
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
    ]

    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='Absent'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['child', 'session']]
        ordering = ['-session__date', '-session__time']

    def __str__(self):
        return f"{self.child} - {self.session} - {self.status}"


class HomeVisit(models.Model):
    
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='home_visits'
    )
    coach = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='home_visits'
    )
    date = models.DateField()
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Home Visit for {self.child} on {self.date}"


class LSASAssessment(models.Model):
   
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='lsas_assessments'
    )
    date = models.DateField()
    score = models.IntegerField()
    remarks = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"LSAS Assessment for {self.child} on {self.date} - Score: {self.score}"


class CoachActivity(models.Model):
    
    ACTIVITY_TYPE_CHOICES = [
        ('Travel', 'Travel'),
        ('Community Visit', 'Community Visit'),
        ('Session Planning', 'Session Planning'),
        ('Training', 'Training'),
        ('Administrative', 'Administrative'),
        ('Other', 'Other'),
    ]

    coach = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='coach_activities'
    )
    activity_type = models.CharField(
        max_length=50,
        choices=ACTIVITY_TYPE_CHOICES,
        default='Other'
    )
    duration_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0
    )
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.coach} - {self.activity_type} on {self.date}"