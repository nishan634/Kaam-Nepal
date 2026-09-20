from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Job, Application, JobSeekerRating, ApplicationMessage


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
    applicant_detail = serializers.SerializerMethodField()
    job_detail = JobSerializer(source='job', read_only=True)
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_detail', 'applicant', 'applicant_detail',
            'cover_letter', 'resume_url', 'portfolio_url', 'stage', 'rating', 'applied_at', 'updated_at',
        ]
        read_only_fields = ['id', 'applicant', 'applied_at', 'updated_at']

    def get_applicant_detail(self, obj):
        applicant = obj.applicant
        return {
            'id': applicant.id,
            'username': applicant.username,
            'first_name': applicant.first_name,
            'last_name': applicant.last_name,
            'role': applicant.role,
            'district': applicant.district,
            'avatar_url': applicant.avatar_url,
            'bio': applicant.bio,
            'skills': applicant.skills,
            'skills_list': applicant.skills_list(),
            'is_verified': applicant.is_verified,
        }

    def get_rating(self, obj):
        rating = getattr(obj, 'rating', None)
        if not rating:
            return None
        return JobSeekerRatingSerializer(rating).data


class JobSeekerRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSeekerRating
        fields = ['id', 'application', 'employer', 'jobseeker', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['id', 'application', 'employer', 'jobseeker', 'created_at', 'updated_at']


class ApplicationMessageSerializer(serializers.ModelSerializer):
    sender_detail = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationMessage
        fields = ['id', 'application', 'sender', 'sender_detail', 'body', 'created_at']
        read_only_fields = ['id', 'application', 'sender', 'sender_detail', 'created_at']

    def get_sender_detail(self, obj):
        sender = obj.sender
        return {
            'id': sender.id,
            'username': sender.username,
            'first_name': sender.first_name,
            'last_name': sender.last_name,
            'role': sender.role,
        }
