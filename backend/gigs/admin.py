from django.contrib import admin
from .models import Gig, Proposal


@admin.register(Gig)
class GigAdmin(admin.ModelAdmin):
    list_display = ('title', 'freelancer', 'category', 'rate', 'rate_type', 'rating', 'is_active')
    list_filter = ('category', 'rate_type', 'is_verified', 'is_active')
    search_fields = ('title', 'description')


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('client', 'gig', 'status', 'created_at')
    list_filter = ('status',)
