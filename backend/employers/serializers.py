from rest_framework import serializers
from .models import CompanyProfile


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = [
            'id', 'user', 'company_name', 'logo_url', 'industry', 'website',
            'district', 'description', 'is_verified', 'created_at',
        ]
        read_only_fields = ['id', 'user', 'is_verified', 'created_at']
