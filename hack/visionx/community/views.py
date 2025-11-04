from rest_framework import viewsets, permissions
from .models import DiscussionThread, ThreadReply, Resource
from .serializers import DiscussionThreadSerializer, ThreadReplySerializer, ResourceSerializer

class DiscussionThreadViewSet(viewsets.ModelViewSet):
    
    queryset = DiscussionThread.objects.all()
    serializer_class = DiscussionThreadSerializer
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

    def perform_create(self, serializer):
        
        serializer.save(author=self.request.user)

class ThreadReplyViewSet(viewsets.ModelViewSet):
    
    queryset = ThreadReply.objects.all()
    serializer_class = ThreadReplySerializer
    
    permission_classes = [permissions.IsAuthenticated] 

    def perform_create(self, serializer):
        
        serializer.save(author=self.request.user)

class ResourceViewSet(viewsets.ModelViewSet):
    
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
   
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        
        serializer.save(uploaded_by=self.request.user)