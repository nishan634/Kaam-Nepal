from django.conf import settings
from django.db import models


class Gig(models.Model):
    class RateType(models.TextChoices):
        HOURLY = 'hourly', 'Hourly'
        FIXED = 'fixed', 'Fixed Price'

    class Category(models.TextChoices):
        DESIGN = 'design', 'Design & Creative'
        DEV = 'dev', 'Programming & Tech'
        WRITING = 'writing', 'Writing & Translation'
        TRADES = 'trades', 'Home & Trade Services'
        TUTORING = 'tutoring', 'Tutoring & Lessons'
        OTHER = 'other', 'Other'

    freelancer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='gigs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    rate = models.PositiveIntegerField(help_text='Rate in NPR')
    rate_type = models.CharField(max_length=10, choices=RateType.choices, default=RateType.FIXED)
    delivery_days = models.PositiveIntegerField(default=3)
    skills = models.CharField(max_length=500, blank=True, help_text='Comma-separated')
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def skills_list(self):
        return [s.strip() for s in self.skills.split(',') if s.strip()]

    def __str__(self):
        return self.title


class Proposal(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'
        COMPLETED = 'completed', 'Completed'

    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='proposals')
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='gig_proposals')
    message = models.TextField(blank=True)
    budget = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.client} -> {self.gig} [{self.status}]'
