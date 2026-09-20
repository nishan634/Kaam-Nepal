from django.conf import settings
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class Job(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full-time'
        PART_TIME = 'part_time', 'Part-time'
        DAILY_WAGE = 'daily_wage', 'Daily Wage'
        CONTRACT = 'contract', 'Contract'
        REMOTE = 'remote', 'Remote'

    class Sector(models.TextChoices):
        TRADE = 'trade', 'Skilled Trades & Construction'
        TECH = 'tech', 'Tech, Remote & IT'
        HOSPITALITY = 'hospitality', 'Hospitality & Culinary'
        LOGISTICS = 'logistics', 'Transport & Logistics'
        HEALTH = 'health', 'Healthcare & Diagnostics'
        OTHER = 'other', 'Other'

    class District(models.TextChoices):
        KATHMANDU = 'kathmandu', 'Kathmandu'
        POKHARA = 'pokhara', 'Pokhara'
        LALITPUR = 'lalitpur', 'Lalitpur'
        BIRATNAGAR = 'biratnagar', 'Biratnagar'
        NEPALGUNJ = 'nepalgunj', 'Nepalgunj'
        REMOTE = 'remote', 'Remote / Overseas'
        OTHER = 'other', 'Other'

    class SalaryPeriod(models.TextChoices):
        HOURLY = 'hourly', 'Hourly'
        DAILY = 'daily', 'Daily'
        MONTHLY = 'monthly', 'Monthly'
        FIXED = 'fixed', 'Fixed / Project'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        CLOSED = 'closed', 'Closed'
        DRAFT = 'draft', 'Draft'

    employer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    location_address = models.CharField(max_length=300, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    sector = models.CharField(max_length=20, choices=Sector.choices, default=Sector.OTHER)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    district = models.CharField(max_length=20, choices=District.choices, default=District.KATHMANDU)
    is_remote = models.BooleanField(default=False)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    salary_period = models.CharField(max_length=20, choices=SalaryPeriod.choices, default=SalaryPeriod.MONTHLY)
    skills_required = models.CharField(max_length=500, blank=True, help_text='Comma-separated')
    is_verified_escrow = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def skills_list(self):
        return [s.strip() for s in self.skills_required.split(',') if s.strip()]

    def __str__(self):
        return self.title


class Application(models.Model):
    class Stage(models.TextChoices):
        APPLIED = 'applied', 'Applied'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        INTERVIEW = 'interview', 'Interview'
        OFFERED = 'offered', 'Offered'
        HIRED = 'hired', 'Hired'
        REJECTED = 'rejected', 'Rejected'

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField(blank=True)
    resume_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    stage = models.CharField(max_length=20, choices=Stage.choices, default=Stage.APPLIED)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f'{self.applicant} -> {self.job} [{self.stage}]'


class JobSeekerRating(models.Model):
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='rating')
    employer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobseeker_ratings_given')
    jobseeker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobseeker_ratings_received')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['employer', 'application'], name='unique_employer_application_rating'),
        ]

    def __str__(self):
        return f'{self.jobseeker} rated {self.rating}/5 by {self.employer}'


class ApplicationMessage(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='application_messages')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Message from {self.sender} on application {self.application_id}'
