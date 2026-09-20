from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Job, Application, JobSeekerRating, ApplicationMessage
from .serializers import JobSerializer, ApplicationSerializer, JobSeekerRatingSerializer, ApplicationMessageSerializer


class IsEmployerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'employer'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.employer_id == request.user.id


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsEmployerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sector', 'job_type', 'district', 'is_remote', 'is_verified_escrow', 'status']
    search_fields = ['title', 'description', 'skills_required', 'company_name']
    ordering_fields = ['created_at', 'salary_min', 'salary_max']

    def get_queryset(self):
        qs = super().get_queryset()
        mine = self.request.query_params.get('mine')
        if mine and self.request.user.is_authenticated:
            return qs.filter(employer=self.request.user)
        return qs.filter(status=Job.Status.OPEN)

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def apply(self, request, pk=None):
        job = self.get_object()
        if request.user.role != 'jobseeker':
            return Response({'detail': 'Only job seekers can apply.'}, status=status.HTTP_403_FORBIDDEN)
        if Application.objects.filter(job=job, applicant=request.user).exists():
            return Response({'detail': 'You already applied to this job.'}, status=status.HTTP_400_BAD_REQUEST)
        application = Application.objects.create(
            job=job,
            applicant=request.user,
            cover_letter=request.data.get('cover_letter', ''),
            resume_url=request.data.get('resume_url', ''),
            portfolio_url=request.data.get('portfolio_url', ''),
        )
        return Response(ApplicationSerializer(application).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def applications(self, request, pk=None):
        job = self.get_object()
        if job.employer_id != request.user.id:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        apps = job.applications.all()
        return Response(ApplicationSerializer(apps, many=True).data)


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'employer':
            return Application.objects.filter(job__employer=user)
        return Application.objects.filter(applicant=user)

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        # Employers move applicants through ATS stages
        instance = self.get_object()
        if instance.job.employer_id != request.user.id:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        application = self.get_object()
        if request.user.role != 'employer' or application.job.employer_id != request.user.id:
            return Response({'detail': 'Only the job employer can rate this applicant.'}, status=status.HTTP_403_FORBIDDEN)
        if application.stage != Application.Stage.HIRED:
            return Response({'detail': 'You can rate a job seeker after marking the application as hired.'}, status=status.HTTP_400_BAD_REQUEST)
        if hasattr(application, 'rating'):
            return Response({'detail': 'This job seeker has already been rated for this application.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = JobSeekerRatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rating = serializer.save(
            application=application,
            employer=request.user,
            jobseeker=application.applicant,
        )
        return Response(JobSeekerRatingSerializer(rating).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def messages(self, request, pk=None):
        application = self.get_object()
        is_employer = application.job.employer_id == request.user.id and request.user.role == 'employer'
        is_applicant = application.applicant_id == request.user.id and request.user.role == 'jobseeker'
        if not (is_employer or is_applicant):
            return Response({'detail': 'You are not a participant in this application.'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            messages = application.messages.select_related('sender').all()
            return Response(ApplicationMessageSerializer(messages, many=True).data)

        serializer = ApplicationMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save(application=application, sender=request.user)
        return Response(ApplicationMessageSerializer(message).data, status=status.HTTP_201_CREATED)
