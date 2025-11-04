# visionx/tournament/permissions.py

from rest_framework import permissions

class IsAdminOrVolunteerOrReadOnly(permissions.BasePermission):
  
    def has_permission(self, request, view):
        
        if request.method in permissions.SAFE_METHODS:
            return True

        
        if not request.user or not request.user.is_authenticated:
            return False

        return request.user.role == 'ADMIN' or request.user.role == 'VOLUNTEER'