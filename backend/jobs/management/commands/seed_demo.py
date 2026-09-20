from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from jobs.models import Job, Application
from gigs.models import Gig
from employers.models import CompanyProfile


class Command(BaseCommand):
    help = 'Seed the database with demo data for KAAM Nepal (hackathon demo).'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')

        employer, _ = User.objects.get_or_create(
            username='himalayan_treks',
            defaults=dict(
                email='hr@himalayantreks.com', role=User.Role.EMPLOYER,
                district=User.District.KATHMANDU, is_verified=True,
                first_name='Himalayan', last_name='Treks Pvt. Ltd.',
            ),
        )
        employer.set_password('demo1234')
        employer.save()

        CompanyProfile.objects.get_or_create(
            user=employer,
            defaults=dict(
                company_name='Himalayan Treks Pvt. Ltd.',
                industry='Hospitality & Tourism',
                district='Kathmandu',
                description='Leading trekking & hospitality company in Nepal.',
                is_verified=True,
            ),
        )

        jobseeker, _ = User.objects.get_or_create(
            username='sita_gurung',
            defaults=dict(
                email='sita.gurung@example.com', role=User.Role.JOBSEEKER,
                district=User.District.POKHARA, first_name='Sita', last_name='Gurung',
                skills='Electrician, Wiring, Solar Installation',
            ),
        )
        jobseeker.set_password('demo1234')
        jobseeker.save()

        jobs_data = [
            dict(title='Site Electrician (Daily Wage)', sector=Job.Sector.TRADE, job_type=Job.JobType.DAILY_WAGE,
                 district=Job.District.KATHMANDU, salary_min=1200, salary_max=1800, salary_period=Job.SalaryPeriod.DAILY,
                 skills_required='Electrician, Wiring, Safety Certified', is_verified_escrow=True,
                  location_address='Balaju Industrial District, Kathmandu', latitude=27.7351, longitude=85.2916,
                 description='Immediate opening for a certified electrician for a 3-week commercial wiring project in Kathmandu.'),
            dict(title='React Frontend Engineer (Remote)', sector=Job.Sector.TECH, job_type=Job.JobType.REMOTE,
                 district=Job.District.REMOTE, is_remote=True, salary_min=80000, salary_max=150000,
                 salary_period=Job.SalaryPeriod.MONTHLY, skills_required='React, JavaScript, Tailwind CSS',
                  location_address='Remote / Overseas',
                 is_verified_escrow=True, description='Join our distributed team building fintech products for South Asia.'),
            dict(title='Head Chef - Newari Cuisine', sector=Job.Sector.HOSPITALITY, job_type=Job.JobType.FULL_TIME,
                 district=Job.District.LALITPUR, salary_min=45000, salary_max=60000, salary_period=Job.SalaryPeriod.MONTHLY,
                 skills_required='Newari Cuisine, Kitchen Management',
                  location_address='Patan Durbar Square, Lalitpur', latitude=27.6724, longitude=85.3258,
                 description='Boutique restaurant in Patan seeking an experienced Newari cuisine head chef.'),
            dict(title='Delivery Rider', sector=Job.Sector.LOGISTICS, job_type=Job.JobType.PART_TIME,
                 district=Job.District.KATHMANDU, salary_min=800, salary_max=1500, salary_period=Job.SalaryPeriod.DAILY,
                 skills_required='Two-wheeler License, Smartphone',
                  location_address='Thamel, Kathmandu', latitude=27.7152, longitude=85.3123,
                 description='Flexible part-time delivery rider positions across the Kathmandu valley.'),
        ]
        for jd in jobs_data:
            Job.objects.get_or_create(title=jd['title'], employer=employer, defaults=jd)

        gigs_data = [
            dict(title='I will build a responsive React website', category=Gig.Category.DEV, rate=15000,
                 rate_type=Gig.RateType.FIXED, delivery_days=7, skills='React, Tailwind, API Integration',
                 is_verified=True, rating=4.8, review_count=32),
            dict(title='Home electrical wiring & repair', category=Gig.Category.TRADES, rate=1500,
                 rate_type=Gig.RateType.HOURLY, delivery_days=1, skills='Electrician, Home Repair',
                 is_verified=True, rating=4.6, review_count=18),
            dict(title='Nepali to English document translation', category=Gig.Category.WRITING, rate=500,
                 rate_type=Gig.RateType.FIXED, delivery_days=2, skills='Translation, Nepali, English',
                 rating=4.9, review_count=54),
            dict(title='Math & Science tutoring (Grades 6-10)', category=Gig.Category.TUTORING, rate=800,
                 rate_type=Gig.RateType.HOURLY, delivery_days=1, skills='Mathematics, Science, SEE Prep',
                 rating=4.7, review_count=21),
        ]
        for gd in gigs_data:
            Gig.objects.get_or_create(title=gd['title'], freelancer=jobseeker, defaults=gd)

        first_job = Job.objects.first()
        if first_job:
            Application.objects.get_or_create(
                job=first_job, applicant=jobseeker,
                defaults=dict(cover_letter='I have 5 years of experience as a certified electrician.'),
            )

        self.stdout.write(self.style.SUCCESS(
            'Done! Demo accounts -> employer: himalayan_treks / demo1234, '
            'jobseeker: sita_gurung / demo1234'
        ))
