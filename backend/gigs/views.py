from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Gig, Proposal
from .serializers import GigSerializer, ProposalSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.freelancer_id == request.user.id


class GigViewSet(viewsets.ModelViewSet):
    queryset = Gig.objects.filter(is_active=True)
    serializer_class = GigSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'rate_type', 'is_verified']
    search_fields = ['title', 'description', 'skills']
    ordering_fields = ['created_at', 'rate', 'rating']

    def get_queryset(self):
        qs = super().get_queryset()
        mine = self.request.query_params.get('mine')
        if mine and self.request.user.is_authenticated:
            qs = Gig.objects.filter(freelancer=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def propose(self, request, pk=None):
        gig = self.get_object()
        proposal = Proposal.objects.create(
            gig=gig,
            client=request.user,
            message=request.data.get('message', ''),
            budget=request.data.get('budget') or None,
        )
        return Response(ProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)


class ProposalViewSet(viewsets.ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Proposal.objects.filter(client=user) | Proposal.objects.filter(gig__freelancer=user)
