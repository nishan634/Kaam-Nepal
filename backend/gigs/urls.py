from rest_framework.routers import DefaultRouter
from .views import GigViewSet, ProposalViewSet

router = DefaultRouter()
router.register('proposals', ProposalViewSet, basename='proposal')
router.register('', GigViewSet, basename='gig')

urlpatterns = router.urls
