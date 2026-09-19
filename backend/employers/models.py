from django.conf import settings
from django.db import models


class CompanyProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company_profile')
    company_name = models.CharField(max_length=200)
    logo_url = models.URLField(blank=True)
    industry = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    district = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name
