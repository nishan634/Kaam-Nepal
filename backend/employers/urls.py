from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CompanyProfileViewSet, HiringDashboardView

router = DefaultRouter()
router.register('profile', CompanyProfileViewSet, basename='company-profile')

urlpatterns = [
    path('dashboard/', HiringDashboardView.as_view(), name='hiring-dashboard'),
    path('', include(router.urls)),
]
