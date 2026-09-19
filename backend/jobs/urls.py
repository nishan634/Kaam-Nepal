from rest_framework.routers import DefaultRouter
from .views import JobViewSet, ApplicationViewSet

router = DefaultRouter()
router.register('applications', ApplicationViewSet, basename='application')
router.register('', JobViewSet, basename='job')

urlpatterns = router.urls
