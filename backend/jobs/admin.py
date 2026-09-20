from django.contrib import admin
from .models import Job, Application, JobSeekerRating, ApplicationMessage, JobNotification


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'employer', 'sector', 'job_type', 'district', 'status', 'created_at')
    list_filter = ('sector', 'job_type', 'district', 'status', 'is_verified_escrow')
    search_fields = ('title', 'description')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'job', 'stage', 'applied_at')
    list_filter = ('stage',)


@admin.register(JobSeekerRating)
class JobSeekerRatingAdmin(admin.ModelAdmin):
    list_display = ('jobseeker', 'employer', 'rating', 'application', 'created_at')
    list_filter = ('rating',)


@admin.register(ApplicationMessage)
class ApplicationMessageAdmin(admin.ModelAdmin):
    list_display = ('application', 'sender', 'created_at')
    search_fields = ('body', 'sender__username')


@admin.register(JobNotification)
class JobNotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'job', 'title', 'is_read', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('recipient__username', 'job__title', 'message')
