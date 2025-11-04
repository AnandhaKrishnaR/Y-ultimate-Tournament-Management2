from django.contrib import admin
from .models import ChildProfile, Session, Attendance, HomeVisit, LSASAssessment, CoachActivity


@admin.register(ChildProfile)
class ChildProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'date_of_birth', 'gender', 'created_at', 'assigned_coach'] # Added coach
   
    search_fields = ['user__username', 'user__email'] 
    list_filter = ['gender', 'created_at', 'assigned_coach'] 
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['date', 'time', 'location', 'created_by']
    list_filter = ['location', 'date', 'created_by']
    search_fields = ['location', 'created_by__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['child', 'session', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    
    search_fields = ['child__user__username', 'session__location']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(HomeVisit)
class HomeVisitAdmin(admin.ModelAdmin):
    list_display = ['child', 'coach', 'date', 'created_at']
    list_filter = ['date', 'coach']
    
    search_fields = ['child__user__username', 'coach__username', 'notes']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(LSASAssessment)
class LSASAssessmentAdmin(admin.ModelAdmin):
    list_display = ['child', 'date', 'score', 'created_at']
    list_filter = ['date', 'score']
    
    search_fields = ['child__user__username', 'remarks']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CoachActivity)
class CoachActivityAdmin(admin.ModelAdmin):
    list_display = ['coach', 'activity_type', 'date', 'duration_hours', 'created_at']
    list_filter = ['activity_type', 'date', 'coach']
    search_fields = ['coach__username']
    readonly_fields = ['created_at', 'updated_at']