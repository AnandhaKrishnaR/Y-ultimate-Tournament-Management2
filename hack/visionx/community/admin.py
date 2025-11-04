from django.contrib import admin
from .models import DiscussionThread, ThreadReply, Resource

@admin.register(DiscussionThread)
class DiscussionThreadAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'updated_at')
    search_fields = ('title', 'author__username')
    list_filter = ('created_at', 'updated_at')

@admin.register(ThreadReply)
class ThreadReplyAdmin(admin.ModelAdmin):
    list_display = ('thread', 'author', 'created_at')
    search_fields = ('thread__title', 'author__username')
    list_filter = ('created_at',)

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'uploaded_by', 'uploaded_at')
    search_fields = ('title', 'description')
    list_filter = ('uploaded_at', 'uploaded_by')