from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChildProfileViewSet,
    SessionViewSet,
    AttendanceViewSet,
    HomeVisitViewSet,
    LSASAssessmentViewSet,
    CoachActivityViewSet,
    CoachDashboardView,
    ParticipationReportView,
    GenderDistributionView,
    CoachWorkloadView,
    MyCoachingProfileView
)

router = DefaultRouter()
router.register(r'children', ChildProfileViewSet, basename='child')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'home-visits', HomeVisitViewSet, basename='homevisit')
router.register(r'lsas-assessments', LSASAssessmentViewSet, basename='lsasassessment')
router.register(r'coach-activities', CoachActivityViewSet, basename='coachactivity')

urlpatterns = [
    path('', include(router.urls)),
    
    path('dashboard/', CoachDashboardView.as_view(), name='coach-dashboard'),
    path('reports/participation/', ParticipationReportView.as_view(), name='participation-report'),
    path('reports/gender/', GenderDistributionView.as_view(), name='gender-distribution'),
    path('reports/workload/', CoachWorkloadView.as_view(), name='coach-workload'),
    path('my-profile/', MyCoachingProfileView.as_view(), name='my-coaching-profile'),
]
