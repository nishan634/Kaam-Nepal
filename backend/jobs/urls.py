from rest_framework.routers import DefaultRouter
from .views import JobViewSet, ApplicationViewSet, JobNotificationViewSet

router = DefaultRouter()
router.register('applications', ApplicationViewSet, basename='application')
router.register('notifications', JobNotificationViewSet, basename='notification')
router.register('', JobViewSet, basename='job')

urlpatterns = router.urls
