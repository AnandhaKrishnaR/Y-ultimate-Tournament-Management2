from rest_framework import serializers
from .models import DiscussionThread, ThreadReply, Resource
from users.models import CustomUser


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'role']

class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by = AuthorSerializer(read_only=True)

    class Meta:
        model = Resource
        fields = ['id', 'title', 'description', 'file', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at'] 

class ThreadReplySerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = ThreadReply
        fields = ['id', 'thread', 'author', 'content', 'created_at']
        read_only_fields = ['author', 'created_at'] 

class DiscussionThreadSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
   
    replies = ThreadReplySerializer(many=True, read_only=True) 

    class Meta:
        model = DiscussionThread
        fields = ['id', 'title', 'content', 'author', 'created_at', 'updated_at', 'replies']
        read_only_fields = ['author', 'created_at', 'updated_at'] 