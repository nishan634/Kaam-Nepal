from django.contrib import admin
from .models import Job, Application


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'employer', 'sector', 'job_type', 'district', 'status', 'created_at')
    list_filter = ('sector', 'job_type', 'district', 'status', 'is_verified_escrow')
    search_fields = ('title', 'description')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'job', 'stage', 'applied_at')
    list_filter = ('stage',)
