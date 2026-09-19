from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Gig, Proposal


class GigSerializer(serializers.ModelSerializer):
    freelancer_detail = UserSerializer(source='freelancer', read_only=True)
    skills_list = serializers.SerializerMethodField()

    class Meta:
        model = Gig
        fields = [
            'id', 'freelancer', 'freelancer_detail', 'title', 'description', 'category',
            'rate', 'rate_type', 'delivery_days', 'skills', 'skills_list', 'is_verified',
            'rating', 'review_count', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'freelancer', 'rating', 'review_count', 'created_at']

    def get_skills_list(self, obj):
        return obj.skills_list()


class ProposalSerializer(serializers.ModelSerializer):
    client_detail = UserSerializer(source='client', read_only=True)
    gig_detail = GigSerializer(source='gig', read_only=True)

    class Meta:
        model = Proposal
        fields = ['id', 'gig', 'gig_detail', 'client', 'client_detail', 'message', 'budget', 'status', 'created_at']
        read_only_fields = ['id', 'client', 'created_at']
