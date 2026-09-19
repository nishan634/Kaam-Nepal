from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'district', 'is_verified', 'is_staff')
    list_filter = ('role', 'district', 'is_verified', 'is_staff')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('KAAM Nepal Profile', {'fields': ('role', 'phone', 'district', 'avatar_url', 'bio', 'skills', 'is_verified')}),
    )


admin.site.register(User, UserAdmin)
