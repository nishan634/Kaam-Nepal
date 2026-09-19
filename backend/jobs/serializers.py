from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Job, Application


class JobSerializer(serializers.ModelSerializer):
    employer_detail = UserSerializer(source='employer', read_only=True)
    skills_list = serializers.SerializerMethodField()
    applicant_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'employer', 'employer_detail', 'title', 'company_name', 'description',
            'sector', 'job_type', 'district', 'is_remote', 'salary_min', 'salary_max',
            'salary_period', 'skills_required', 'skills_list', 'is_verified_escrow',
            'status', 'applicant_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'employer', 'created_at', 'updated_at']

    def get_skills_list(self, obj):
        return obj.skills_list()

    def get_applicant_count(self, obj):
        return obj.applications.count()


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_detail = UserSerializer(source='applicant', read_only=True)
    job_detail = JobSerializer(source='job', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_detail', 'applicant', 'applicant_detail',
            'cover_letter', 'resume_url', 'stage', 'applied_at', 'updated_at',
        ]
        read_only_fields = ['id', 'applicant', 'applied_at', 'updated_at']
