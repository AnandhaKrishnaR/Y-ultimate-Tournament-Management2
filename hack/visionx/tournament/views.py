from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes 
from rest_framework.response import Response
from django.db.models import Q
from .models import Tournament, Team, PlayerRegistration, Match, SpiritScore
from .serializers import (
    TournamentSerializer,
    TeamSerializer,
    TeamCreateSerializer,
    PlayerRegistrationSerializer,
    MatchSerializer,
    SpiritScoreSerializer,
    PlayerRegistrationCreateSerializer
)
from .permissions import IsAdminOrVolunteerOrReadOnly
from django.db.models import Q
import itertools


class TournamentListCreateView(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TournamentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TeamListCreateView(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TeamCreateSerializer
        return TeamSerializer

    def perform_create(self, serializer):
        serializer.save(captain=self.request.user)

class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class PlayerRegistrationListCreateView(generics.ListCreateAPIView):
    queryset = PlayerRegistration.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PlayerRegistrationCreateSerializer
        return PlayerRegistrationSerializer

    def get_serializer_context(self):
        return {'request': self.request}

class PlayerRegistrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PlayerRegistration.objects.all()
    serializer_class = PlayerRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]


class MatchListCreateView(generics.ListCreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsAdminOrVolunteerOrReadOnly]

class MatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsAdminOrVolunteerOrReadOnly]


class SpiritScoreListCreateView(generics.ListCreateAPIView):
    queryset = SpiritScore.objects.all()
    serializer_class = SpiritScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    
    def perform_create(self, serializer):
        serializer.save(submitting_user=self.request.user)
class SpiritScoreDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SpiritScore.objects.all()
    serializer_class = SpiritScoreSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def generate_schedule(request, pk):
    try:
        tournament = Tournament.objects.get(pk=pk)
    except Tournament.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    registrations = PlayerRegistration.objects.filter(tournament=tournament)
    team_ids = registrations.values_list('team', flat=True).distinct()
    teams = list(Team.objects.filter(id__in=team_ids))

    if len(teams) < 2:
        return Response(
            {'error': 'You need at least 2 teams to generate a schedule.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    Match.objects.filter(tournament=tournament).delete()
    all_pairings = list(itertools.combinations(teams, 2))
    
    field_num = 1
    for team_a, team_b in all_pairings:
        Match.objects.create(
            tournament=tournament,
            team_a=team_a,
            team_b=team_b,
            start_time="2025-11-05 09:00:00", 
            field_number=field_num
        )
        field_num = (field_num % 4) + 1

    return Response(
        {'message': f'Successfully generated {len(all_pairings)} matches.'},
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly]) 
def tournament_matches(request, pk):
    """
    Get all matches for a specific tournament.
    """
    try:
        tournament = Tournament.objects.get(pk=pk)
    except Tournament.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    matches = Match.objects.filter(tournament=tournament)
    serializer = MatchSerializer(matches, many=True)
    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly]) 
def tournament_teams(request, pk):
  
    try:
        tournament = Tournament.objects.get(pk=pk)
    except Tournament.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    
    registrations = PlayerRegistration.objects.filter(tournament=tournament)
    
    team_ids = registrations.values_list('team', flat=True).distinct()
    
    teams = Team.objects.filter(id__in=team_ids)
    
    serializer = TeamSerializer(teams, many=True)
    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated]) # Must be logged in
def team_roster(request, pk):
  
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    
    if request.user != team.captain:
       return Response({"error": "You are not the captain of this team."}, status=status.HTTP_403_FORBIDDEN)

   
    registrations = PlayerRegistration.objects.filter(team=team)
    serializer = PlayerRegistrationSerializer(registrations, many=True)
    return Response(serializer.data)