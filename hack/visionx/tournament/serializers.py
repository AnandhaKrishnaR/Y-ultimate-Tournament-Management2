from rest_framework import serializers
from .models import Tournament, Team, PlayerRegistration, Match, SpiritScore
from users.serializers import CustomUserSerializer 
from users.models import CustomUser

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'title', 'description', 'rules', 'start_date', 'end_date', 'location']
class TeamCreateSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = Team
        fields = ['name']
class TeamSerializer(serializers.ModelSerializer):
    
    captain = CustomUserSerializer(read_only=True) 
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'captain']
class PlayerRegistrationSerializer(serializers.ModelSerializer):
    player = CustomUserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
   
    tournament = TournamentSerializer(read_only=True) 
    
    class Meta:
        model = PlayerRegistration
     
        fields = ['id', 'player', 'team', 'tournament']


class PlayerRegistrationCreateSerializer(serializers.ModelSerializer):
   
    
    username = serializers.CharField(write_only=True, required=False, allow_blank=True) 

    class Meta:
        model = PlayerRegistration
        fields = ['team', 'tournament', 'username'] 

    def save(self, **kwargs):
        captain = self.context['request'].user
        team = self.validated_data['team']
        tournament = self.validated_data['tournament']
        username_to_add = self.validated_data.get('username') 
        if username_to_add:
            
            try:
                player_to_add = CustomUser.objects.get(username=username_to_add)
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError(f"User with username '{username_to_add}' does not exist.")
        else:
            
            player_to_add = captain

        
        if team.captain != captain:
            raise serializers.ValidationError("You are not the captain of this team.")
            
        
        if PlayerRegistration.objects.filter(player=player_to_add, tournament=tournament).exists():
            raise serializers.ValidationError(f"{player_to_add.username} is already registered for this tournament.")

       
        registration = PlayerRegistration.objects.create(
            player=player_to_add,
            team=team,
            tournament=tournament
        )
        return registration
class MatchSerializer(serializers.ModelSerializer):
    team_a = serializers.StringRelatedField()
    team_b = serializers.StringRelatedField()
    
    class Meta:
        model = Match
        
        fields = ['id', 'tournament', 'team_a', 'team_b', 'start_time', 
                  'field_number', 'team_a_score', 'team_b_score', 'is_final', 'status']
class SpiritScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpiritScore
        
        fields = '__all__'
        read_only_fields = ['submitting_user']
