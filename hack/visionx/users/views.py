from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser # <-- 1. IMPORT IsAdminUser
from rest_framework.response import Response
from .models import CustomUser
from .serializers import CustomUserSerializer, UserRegistrationSerializer, AdminUserCreateSerializer 
from tournament.serializers import PlayerRegistrationSerializer
from tournament.models import PlayerRegistration
from rest_framework.decorators import api_view, permission_classes

class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CustomUserSerializer

    def get_object(self):
        
        return self.request.user

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny] 

    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User registered successfully!",
                    "user_id": user.id,
                    "username": user.username
                },
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminUserCreateView(generics.CreateAPIView):
   
    serializer_class = AdminUserCreateSerializer
    permission_classes = [IsAdminUser] 
    
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Admin created user successfully!",
                    "user_id": user.id,
                    "username": user.username
                },
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_my_registrations(request):
    
    user = request.user
    registrations = PlayerRegistration.objects.filter(player=user)
    serializer = PlayerRegistrationSerializer(registrations, many=True)
    return Response(serializer.data)
class UserListView(generics.ListAPIView):
   
    serializer_class = CustomUserSerializer
   
    permission_classes = [IsAuthenticated]

   
    def get_queryset(self):
        
        if self.request.user.role == 'ADMIN':
            return CustomUser.objects.all()
        
        
        return CustomUser.objects.none()