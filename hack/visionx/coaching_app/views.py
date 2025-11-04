from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import ChildProfile, Session, Attendance, HomeVisit, LSASAssessment, CoachActivity
from .serializers import (
    ChildProfileSerializer,
    SessionSerializer,
    AttendanceSerializer,
    HomeVisitSerializer,
    LSASAssessmentSerializer,
    CoachActivitySerializer,
    UserSerializer
)
from rest_framework.views import APIView # Make sure this is imported



class ChildProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing child profiles.
    Admins see ALL children.
    Coaches ONLY see children assigned to them.
    """
    serializer_class = ChildProfileSerializer
    permission_classes = [IsAuthenticated]

    # --- THIS IS THE NEW FUNCTION ---
    def get_queryset(self):
        user = self.request.user
        
        # Admins see everyone
        if user.role == 'ADMIN':
            return ChildProfile.objects.all()
        
        # Coaches see only their assigned children
        if user.role == 'COACH':
            return ChildProfile.objects.filter(assigned_coach=user)
            
        # Other roles (Manager, Volunteer, etc.) see no children
        return ChildProfile.objects.none()
    @action(detail=True, methods=['get'])
    def unified_history(self, request, pk=None):
        """Get unified history for a child (sessions, home visits, LSAS assessments)"""
        child = self.get_object()
        
        sessions = Session.objects.filter(
            attendances__child=child
        ).distinct().order_by('-date', '-time')
        
        home_visits = HomeVisit.objects.filter(child=child).order_by('-date')
        assessments = LSASAssessment.objects.filter(child=child).order_by('-date')
        
        return Response({
            'child': ChildProfileSerializer(child).data,
            'sessions': SessionSerializer(sessions, many=True).data,
            'home_visits': HomeVisitSerializer(home_visits, many=True).data,
            'assessments': LSASAssessmentSerializer(assessments, many=True).data,
        })


class SessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing sessions.
    Admins see all. Coaches see sessions ASSIGNED to them.
    """
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # --- LOGIC CHANGE (Request 2.2, 2.6) ---
        if user.role == 'ADMIN':
            # Admins can see all sessions
            return Session.objects.all()
        if user.role == 'COACH':
            # Coaches ONLY see sessions ASSIGNED to them
            return Session.objects.filter(assigned_coach=user)
        # -------------------------------
            
        return Session.objects.none() # Other roles see nothing

    def perform_create(self, serializer):
        # Admin who creates it is set as created_by
        serializer.save(created_by=self.request.user)

    def get_serializer_context(self):
        # Need to pass context for the create() method in serializer
        return {'request': self.request}


    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming sessions (next 30 days)"""
        today = timezone.now().date()
        thirty_days_later = today + timedelta(days=30)
        
        upcoming_sessions = Session.objects.filter(
            date__gte=today,
            date__lte=thirty_days_later,
            created_by=request.user
        ).order_by('date', 'time')
        
        serializer = self.get_serializer(upcoming_sessions, many=True)
        return Response(serializer.data)


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance records.
    Admins see all. Coaches see records for their assigned children.
    """
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # --- LOGIC CHANGE (Request 2.7) ---
        if user.role == 'ADMIN':
            return Attendance.objects.all()
        if user.role == 'COACH':
            return Attendance.objects.filter(session__assigned_coach=user)
        # ---------------------------------
        return Attendance.objects.none()
    @action(detail=True, methods=['patch', 'put'])
    def mark_attendance(self, request, pk=None):
        """Mark attendance for a specific record"""
        attendance = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Present', 'Absent']:
            return Response(
                {'error': 'Status must be either "Present" or "Absent"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendance.status = new_status
        attendance.save()
        
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_for_session(self, request):
        """Mark attendance for multiple children in a session"""
        session_id = request.data.get('session_id')
        attendance_data = request.data.get('attendance', [])
        
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        results = []
        for item in attendance_data:
            child_id = item.get('child_id')
            status_value = item.get('status', 'Absent')
            
            if not child_id:
                continue
            
            attendance, created = Attendance.objects.get_or_create(
                session=session,
                child_id=child_id,
                defaults={'status': status_value}
            )
            
            if not created:
                attendance.status = status_value
                attendance.save()
            
            results.append({
                'child_id': child_id,
                'status': attendance.status,
                'created': created
            })
        
        return Response({'results': results})


class HomeVisitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing home visits.
    Admins see all. Coaches see their own.
    """
    serializer_class = HomeVisitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # --- LOGIC CHANGE (Request 2.6) ---
        if user.role == 'ADMIN':
            return HomeVisit.objects.all().order_by('-date')
        # --------------------------------
        
        # Coaches see only home visits they conducted
        return HomeVisit.objects.filter(coach=user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(coach=self.request.user)


class LSASAssessmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing LSAS assessments.
    Admins see all. Coaches see assessments for their assigned children.
    """
    serializer_class = LSASAssessmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # --- LOGIC CHANGE (Request 2.6) ---
        if user.role == 'ADMIN':
            return LSASAssessment.objects.all().order_by('-date')
        if user.role == 'COACH':
            # Coaches see assessments for children assigned to them
            return LSASAssessment.objects.filter(child__assigned_coach=user).order_by('-date')
        # --------------------------------
        
        return LSASAssessment.objects.none()

    @action(detail=False, methods=['get'])
    def by_child(self, request):
        """Get all assessments for a specific child"""
        child_id = request.query_params.get('child_id')
        
        if not child_id:
            return Response(
                {'error': 'child_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assessments = LSASAssessment.objects.filter(
            child_id=child_id
        ).order_by('-date')
        
        serializer = self.get_serializer(assessments, many=True)
        return Response(serializer.data)


class CoachActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing coach activities.
    Coaches only see their own activities.
    """
    serializer_class = CoachActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filter to show only activities for the current coach
        return CoachActivity.objects.filter(coach=user).order_by('-date')

    def perform_create(self, serializer):
        # Automatically set coach to the current user
        serializer.save(coach=self.request.user)


# Reporting Views
from rest_framework.views import APIView


class CoachDashboardView(APIView):
    """Dashboard view for coaches - sessions summary"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        
        # --- NEW, CORRECTED LOGIC ---
        
        # Upcoming sessions are ALL sessions that are SCHEDULED or LIVE
        upcoming_sessions = Session.objects.filter(
            assigned_coach=request.user,
            status__in=['SCHEDULED', 'LIVE']
        ).order_by('date', 'time')[:10]
        
        # Past sessions are ONLY sessions marked COMPLETED
        past_sessions = Session.objects.filter(
            assigned_coach=request.user,
            status='COMPLETED'
        ).order_by('-date', '-time')[:10]
        # ---------------------------------------
        
        start_of_month = today.replace(day=1)
        # Count sessions this month that are COMPLETED
        sessions_this_month = Session.objects.filter(
            assigned_coach=request.user,
            date__gte=start_of_month,
            status='COMPLETED' # This is still correct
        ).count()
        
        return Response({
            'upcoming_sessions': SessionSerializer(upcoming_sessions, many=True).data,
            'past_sessions': SessionSerializer(past_sessions, many=True).data,
            'sessions_this_month': sessions_this_month,
        })
    
class ParticipationReportView(APIView):
    """Participation report - overall participation statistics"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get total children
        total_children = ChildProfile.objects.count()
        
        # Get attendance statistics
        total_attendance_records = Attendance.objects.count()
        present_count = Attendance.objects.filter(status='Present').count()
        absent_count = Attendance.objects.filter(status='Absent').count()
        
        # Calculate participation rate
        participation_rate = 0
        if total_attendance_records > 0:
            participation_rate = (present_count / total_attendance_records) * 100
        
        return Response({
            'total_children': total_children,
            'total_attendance_records': total_attendance_records,
            'present_count': present_count,
            'absent_count': absent_count,
            'participation_rate': round(participation_rate, 2),
        })


class GenderDistributionView(APIView):
    """Gender distribution report"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gender_stats = ChildProfile.objects.values('gender').annotate(
            count=Count('id')
        )
        
        distribution = {}
        for stat in gender_stats:
            gender = stat['gender'] or 'Unknown'
            distribution[gender] = stat['count']
        
        return Response({
            'distribution': distribution,
            'total': ChildProfile.objects.count(),
        })


class CoachWorkloadView(APIView):
    """Coach workload distribution"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get workload by coach (sessions created, home visits, activities)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        coaches = User.objects.filter(role='COACH')
        
        workload_data = []
        for coach in coaches:
            sessions_count = Session.objects.filter(created_by=coach).count()
            home_visits_count = HomeVisit.objects.filter(coach=coach).count()
            activities_count = CoachActivity.objects.filter(coach=coach).count()
            total_hours = CoachActivity.objects.filter(coach=coach).aggregate(
                total=Sum('duration_hours')
            )['total'] or 0
            
            workload_data.append({
                'coach_id': coach.id,
                'coach_name': coach.username,
                'sessions_count': sessions_count,
                'home_visits_count': home_visits_count,
                'activities_count': activities_count,
                'total_hours': float(total_hours),
            })
        
        return Response({
            'workload': workload_data,
        })
class MyCoachingProfileView(APIView):
    """
    An endpoint for a player/spectator to view their
    own coaching profile, if one exists.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Find the ChildProfile linked to the logged-in user
            child_profile = ChildProfile.objects.get(user=request.user)
        except ChildProfile.DoesNotExist:
            # If no profile, they are not registered
            return Response(
                {"detail": "You are not registered in the coaching program."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # If profile exists, get their data
        coach = child_profile.assigned_coach
        
        # Get sessions where they have an attendance record
        sessions = Session.objects.filter(attendances__child=child_profile).distinct()
        attendance = Attendance.objects.filter(child=child_profile)

        return Response({
            "is_registered": True,
            "coach_details": UserSerializer(coach).data if coach else None,
            "session_details": SessionSerializer(sessions, many=True).data,
            "attendance_details": AttendanceSerializer(attendance, many=True).data
        })