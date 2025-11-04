from django.db import models
from users.models import CustomUser 
class Tournament(models.Model):
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    rules = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class Team(models.Model):
    
    name = models.CharField(max_length=100, unique=True)
   
    captain = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name="captained_teams")

    def __str__(self):
        return self.name

class PlayerRegistration(models.Model):
   
    player = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="registrations")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="players")
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="all_players")

    class Meta:
        
        unique_together = ('player', 'tournament') 

    def __str__(self):
        return f"{self.player.username} on {self.team.name} for {self.tournament.title}"

class Match(models.Model):
    
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('LIVE', 'Live'),
        ('FINAL', 'Final'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='SCHEDULED')
  
    
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="matches")
    team_a = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="matches_as_team_a")
    team_b = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="matches_as_team_b")
    start_time = models.DateTimeField()
    field_number = models.PositiveIntegerField()
    

    team_a_score = models.PositiveIntegerField(null=True, blank=True)
    team_b_score = models.PositiveIntegerField(null=True, blank=True)
  
    
    is_final = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.team_a} vs {self.team_b} at {self.start_time}"



class SpiritScore(models.Model):
 
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="spirit_scores")
  
    submitting_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="spirit_submissions")
    
    target_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="spirit_received")

  
    rules_knowledge = models.PositiveIntegerField(default=2)
    fouls_contact = models.PositiveIntegerField(default=2)
    fair_mindedness = models.PositiveIntegerField(default=2)
    positive_attitude = models.PositiveIntegerField(default=2)
    communication = models.PositiveIntegerField(default=2)
    
    comments = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Spirit score for {self.target_team} in match {self.match.id}"