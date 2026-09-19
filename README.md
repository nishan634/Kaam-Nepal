# KAAM Nepal — Marketplace Platform

A full-stack implementation of the **KAAM Nepal** hackathon design (Stitch export): a jobs,
skilled-trades, and freelance marketplace for Nepal, with an employer hiring hub (ATS).

- **Frontend:** React 18 + Vite + Tailwind CSS (design tokens match the Himalayan Marketplace
  design system — colors, type scale, spacing, radii)
- **Backend:** Django 5 + Django REST Framework + SimpleJWT
- **Database:** MySQL

## Features implemented

- JWT auth with two roles: **Job Seeker / Freelancer** and **Employer**
- Job marketplace: search, filter by sector/type, apply with a cover note
- Freelance gig marketplace: browse, filter, send proposals, post your own gig
- Employer Hiring Hub: post jobs, see applicants grouped into an ATS pipeline
  (Applied → Shortlisted → Interview → Offered → Hired/Rejected), move applicants between stages
- Seed script with realistic demo data (jobs, gigs, two demo accounts)

## Project structure

```
kaam-nepal/
├── backend/            Django REST API
│   ├── kaam_backend/   settings, urls
│   ├── accounts/       custom User model + JWT auth
│   ├── jobs/           Job + Application models/views
│   ├── gigs/           Gig + Proposal models/views
│   ├── employers/      CompanyProfile + hiring dashboard endpoint
│   └── requirements.txt
└── frontend/           React (Vite) app
    ├── src/
    │   ├── api/        axios client + endpoint helpers
    │   ├── context/    AuthContext (JWT storage, login/register/logout)
    │   ├── components/ Navbar, Footer, JobCard, GigCard, ProtectedRoute
    │   └── pages/       Home, FindJobs, JobDetail, FreelanceGigs, GigDetail,
    │                     PostJob, PostGig, EmployerHub, Login, Register
    └── tailwind.config.js
```

## 1. Backend setup (Django + MySQL)

### Prerequisites
- Python 3.10+
- MySQL Server 8.x running locally (or update `.env` to point elsewhere)
- On Ubuntu/Debian you may need system headers for `mysqlclient`:
  `sudo apt-get install default-libmysqlclient-dev build-essential pkg-config`

### Steps

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create the MySQL database
mysql -u root -p -e "CREATE DATABASE kaam_nepal CHARACTER SET utf8mb4;"

# Configure environment
cp .env.example .env
# edit .env and set DB_USER / DB_PASSWORD to match your MySQL setup

# Run migrations
python manage.py makemigrations
python manage.py migrate

# (Optional but recommended) seed demo data
python manage.py seed_demo

# Create an admin user for the Django admin panel
python manage.py createsuperuser

# Run the API
python manage.py runserver
```

The API will be live at `http://localhost:8000/api/`. Admin panel at `/admin/`.

### Demo accounts (created by `seed_demo`)
| Role     | Username         | Password  |
|----------|------------------|-----------|
| Employer | `himalayan_treks`| `demo1234`|
| Jobseeker| `sita_gurung`    | `demo1234`|

### Key API endpoints
```
POST   /api/auth/register/
POST   /api/auth/login/            -> { access, refresh, user }
POST   /api/auth/refresh/
GET    /api/auth/me/               (auth)
PATCH  /api/auth/me/               (auth)

GET    /api/jobs/                  ?search=&sector=&job_type=&district=&ordering=
POST   /api/jobs/                  (employer only)
GET    /api/jobs/{id}/
POST   /api/jobs/{id}/apply/       (jobseeker only)
GET    /api/jobs/{id}/applications/ (job owner only)
GET    /api/jobs/applications/     (my applications, or applications to my jobs)
PATCH  /api/jobs/applications/{id}/  { "stage": "shortlisted" }  (employer, ATS move)

GET    /api/gigs/                  ?search=&category=&ordering=
POST   /api/gigs/                  (auth)
GET    /api/gigs/{id}/
POST   /api/gigs/{id}/propose/     (auth)

GET    /api/employers/dashboard/   (employer only — aggregated ATS pipeline)
GET    /api/employers/profile/
POST   /api/employers/profile/
```

## 2. Frontend setup (React + Vite)

### Prerequisites
- Node.js 18+

### Steps

```bash
cd frontend
npm install
cp .env.example .env       # defaults to http://localhost:8000/api
npm run dev
```

Open `http://localhost:5173`. Make sure the Django backend is running first (CORS is
pre-configured to allow `http://localhost:5173`).

### Build for production

```bash
npm run build
```

Outputs static files to `frontend/dist/` — serve with any static host, or configure Django's
`STATICFILES` / a reverse proxy (Nginx) to serve them alongside the API.

## 3. Suggested demo flow for judges

1. `python manage.py seed_demo` on the backend.
2. Log in as `himalayan_treks` / `demo1234` → go to **Hiring Hub** → see the posted jobs and
   the seeded applicant in the "Applied" column → move them to "Shortlisted" or "Interview".
3. Log out, log in as `sita_gurung` / `demo1234` (or register a new job seeker) → browse
   **Find Jobs**, apply to a job, browse **Freelance Services**, send a proposal on a gig.
4. Register a brand-new **Employer** account → **Post a Job** → see it appear instantly in
   **Find Jobs** and in that employer's own **Hiring Hub**.

## Notes & next steps

- Passwords are hashed via Django's built-in `set_password` / `AbstractUser`.
- Resume/file uploads currently accept a URL (`resume_url`) rather than binary uploads — wiring
  up `django-storages`/S3 or local `MEDIA` file uploads is a natural next step.
- The "map view" and bilingual (Nepali) UI from the original Stitch mockups are represented at
  the visual/copy level (bilingual labels, district selector) but a live map and full i18n
  layer were out of scope for this hackathon build — good stretch goals.
- CORS/JWT settings in `backend/kaam_backend/settings.py` are dev-friendly; tighten
  `ALLOWED_HOSTS`, `DEBUG`, and `SECRET_KEY` before any real deployment.
