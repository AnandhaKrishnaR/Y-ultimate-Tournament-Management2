from django.urls import path
from .views import (
    CurrentUserView, 
    UserRegistrationView, 
    AdminUserCreateView,
    get_my_registrations,
    UserListView
    
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='user_registration'),

 
    path('admin/create-user/', AdminUserCreateView.as_view(), name='admin_create_user'),
    path('my-registrations/', get_my_registrations, name='my-registrations'),
    path('admin/list-users/', UserListView.as_view(), name='admin_list_users'),
]