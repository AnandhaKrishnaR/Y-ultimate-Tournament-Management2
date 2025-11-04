from django.urls import path
from . import views

urlpatterns = [
   
    path('', views.TournamentListCreateView.as_view(), name='tournament-list'),
    
   
    path('<int:pk>/', views.TournamentDetailView.as_view(), name='tournament-detail'),
   
    path('<int:pk>/generate_schedule/', views.generate_schedule, name='tournament-generate-schedule'),
    

    path('<int:pk>/matches/', views.tournament_matches, name='tournament-matches'),
    

    path('teams/', views.TeamListCreateView.as_view(), name='team-list'),
    

    path('teams/<int:pk>/', views.TeamDetailView.as_view(), name='team-detail'),
    

    path('registrations/', views.PlayerRegistrationListCreateView.as_view(), name='registration-list'),
    
    
    path('registrations/<int:pk>/', views.PlayerRegistrationDetailView.as_view(), name='registration-detail'),
    
    
    path('matches/', views.MatchListCreateView.as_view(), name='match-list'),
    
 
    path('matches/<int:pk>/', views.MatchDetailView.as_view(), name='match-detail'),
    
    path('spirit-scores/', views.SpiritScoreListCreateView.as_view(), name='spirit-score-list'),
    
  
    path('spirit-scores/<int:pk>/', views.SpiritScoreDetailView.as_view(), name='spirit-score-detail'),

    path('<int:pk>/teams/', views.tournament_teams, name='tournament-teams'),
    path('teams/<int:pk>/roster/', views.team_roster, name='team-roster'),
]