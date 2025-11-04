from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'threads', views.DiscussionThreadViewSet, basename='thread')
router.register(r'replies', views.ThreadReplyViewSet, basename='reply')
router.register(r'resources', views.ResourceViewSet, basename='resource')


urlpatterns = [
    path('', include(router.urls)),
]