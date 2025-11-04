from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import CustomUser  
from .models import ChildProfile, Session, Attendance, HomeVisit, LSASAssessment, CoachActivity

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']





class ChildProfileSerializer(serializers.ModelSerializer):
 

    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), 
        source='user',
        write_only=True
    )
    username = serializers.CharField(source='user.username', read_only=True) 
    email = serializers.EmailField(source='user.email', read_only=True)   
    
    
    assigned_coach = UserSerializer(read_only=True)
    assigned_coach_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='COACH'),
        source='assigned_coach',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = ChildProfile
        fields = [
            'id', 'user', 'user_id', 'username', 'email',
            'assigned_coach', 'assigned_coach_id', 
            'date_of_birth', 'gender', 'participation_history',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SessionSerializer(serializers.ModelSerializer):
    
    created_by = UserSerializer(read_only=True)
    
    
    assigned_coach = UserSerializer(read_only=True)
    assigned_coach_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='COACH'), 
        source='assigned_coach',
        write_only=True,
        required=False,
        allow_null=True
    )
  
    
    class Meta:
        model = Session
        fields = [
            'id', 'date', 'time', 'location',
            'created_by', 
            'assigned_coach', 'assigned_coach_id', 
            'status', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by'] 
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class AttendanceSerializer(serializers.ModelSerializer):
    
    child = ChildProfileSerializer(read_only=True)
    child_id = serializers.PrimaryKeyRelatedField(
        queryset=ChildProfile.objects.all(),
        source='child',
        write_only=True
    )
    session = SessionSerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(),
        source='session',
        write_only=True
    )
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'child', 'child_id', 'session', 'session_id',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class HomeVisitSerializer(serializers.ModelSerializer):
    
    coach = UserSerializer(read_only=True)


    child = ChildProfileSerializer(read_only=True)
    child_id = serializers.PrimaryKeyRelatedField(
        queryset=ChildProfile.objects.all(),
        source='child',
        write_only=True
    )
    
    class Meta:
        model = HomeVisit
       
        fields = [
            'id', 'child', 'child_id', 'coach',
            'date', 'notes', 'created_at', 'updated_at'
        ]
        
        read_only_fields = ['created_at', 'updated_at', 'coach']

class LSASAssessmentSerializer(serializers.ModelSerializer):
   
    child = ChildProfileSerializer(read_only=True)
    child_id = serializers.PrimaryKeyRelatedField(
        queryset=ChildProfile.objects.all(),
        source='child',
        write_only=True
    )
    
    class Meta:
        model = LSASAssessment
        fields = [
            'id', 'child', 'child_id', 'date', 'score',
            'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CoachActivitySerializer(serializers.ModelSerializer):
    
    coach = UserSerializer(read_only=True)
    coach_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='coach',
        write_only=True
    )
    
    class Meta:
        model = CoachActivity
        fields = [
            'id', 'coach', 'coach_id', 'activity_type',
            'duration_hours', 'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

