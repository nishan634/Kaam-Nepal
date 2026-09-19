from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user for KAAM Nepal — a jobseeker, employer, or admin."""

    class Role(models.TextChoices):
        JOBSEEKER = 'jobseeker', 'Job Seeker'
        EMPLOYER = 'employer', 'Employer'
        ADMIN = 'admin', 'Admin'

    class District(models.TextChoices):
        KATHMANDU = 'kathmandu', 'Kathmandu'
        POKHARA = 'pokhara', 'Pokhara'
        LALITPUR = 'lalitpur', 'Lalitpur'
        BIRATNAGAR = 'biratnagar', 'Biratnagar'
        NEPALGUNJ = 'nepalgunj', 'Nepalgunj'
        REMOTE = 'remote', 'Remote / Overseas'
        OTHER = 'other', 'Other'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.JOBSEEKER)
    phone = models.CharField(max_length=20, blank=True)
    district = models.CharField(max_length=20, choices=District.choices, default=District.KATHMANDU)
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    skills = models.CharField(max_length=500, blank=True, help_text='Comma-separated skills/trades')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def skills_list(self):
        return [s.strip() for s in self.skills.split(',') if s.strip()]

    def __str__(self):
        return f'{self.username} ({self.role})'
