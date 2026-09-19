from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from jobs.models import Job, Application
from jobs.serializers import JobSerializer, ApplicationSerializer
from .models import CompanyProfile
from .serializers import CompanyProfileSerializer


class CompanyProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CompanyProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HiringDashboardView(APIView):
    """Aggregated ATS pipeline view for the logged-in employer."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'employer':
            return Response({'detail': 'Employer access only.'}, status=403)

        jobs = Job.objects.filter(employer=request.user)
        stages = [choice[0] for choice in Application.Stage.choices]
        pipeline = {stage: [] for stage in stages}

        applications = Application.objects.filter(job__employer=request.user).select_related('job', 'applicant')
        for app in applications:
            pipeline[app.stage].append(ApplicationSerializer(app).data)

        return Response({
            'jobs_posted': jobs.count(),
            'open_jobs': jobs.filter(status='open').count(),
            'total_applicants': applications.count(),
            'jobs': JobSerializer(jobs, many=True).data,
            'pipeline': pipeline,
        }) 

        
 