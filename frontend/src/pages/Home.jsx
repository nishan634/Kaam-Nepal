import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJobs, fetchGigs } from '../api/endpoints'
import JobCard from '../components/JobCard'
import GigCard from '../components/GigCard'
import { useLanguage } from '../context/LanguageContext'
import { useMode } from '../context/ModeContext'
import { useAuth } from '../context/AuthContext'

const categories = [
  { key: 'trade', label: 'Skilled Trades', icon: 'construction' },
  { key: 'tech', label: 'Tech & Remote', icon: 'computer' },
  { key: 'hospitality', label: 'Hospitality', icon: 'restaurant' },
  { key: 'logistics', label: 'Logistics', icon: 'local_shipping' },
  { key: 'health', label: 'Healthcare', icon: 'medical_services' },
]

export default function Home() {
  const [jobs, setJobs] = useState([])
  const [gigs, setGigs] = useState([])
  const [query, setQuery] = useState('')
  const { t } = useLanguage()
  const { mode } = useMode()
  const { user } = useAuth()

  useEffect(() => {
    fetchJobs({ ordering: '-created_at' })
      .then(({ data }) => setJobs((data.results || data).slice(0, 4)))
      .catch(() => {})
    fetchGigs({ ordering: '-created_at' })
      .then(({ data }) => setGigs((data.results || data).slice(0, 4)))
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col w-full">
      {/* Announcement strip */}
      <section className="w-full bg-primary-container text-surface-container-highest py-2.5 px-margin md:px-margin-md lg:px-margin-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-space-sm font-display text-label-sm text-center">
          <span className="inline-flex items-center gap-1 bg-secondary text-on-secondary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
            New
          </span>
          <span className="text-surface-container-lowest font-medium">
            Daily Wage Guarantee &amp; SMS Apply — live across 77 districts of Nepal.
          </span>
        </div>
      </section>

      {/* Hero */}
      <section
        className="relative w-full min-h-[680px] overflow-hidden py-space-xl lg:py-28 px-margin md:px-margin-md lg:px-margin-lg flex items-center"
        style={{ backgroundImage: "url('/kaam-nepal-heritage.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#071b2e]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071b2e]/20 via-transparent to-[#071b2e]/70" />
        <div className="relative max-w-7xl mx-auto text-center text-white">
          <h1 className="font-display text-display-hero-mobile lg:text-display-hero text-white max-w-4xl mx-auto">
            Every skill deserves a fair shot.
            <span className="block text-[#f7c873]">काम पाउनुहोस्।</span>
          </h1>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-space-lg max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-space-sm bg-white/95 p-space-sm rounded-xl shadow-lg"
          >
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined text-outline absolute left-space-sm top-1/2 -translate-y-1/2 text-[20px]">
                search
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Role, trade skill, or keyword..."
                className="w-full h-12 pl-10 pr-4 bg-surface-container-low rounded-lg font-body-md text-body-md outline-none"
              />
            </div>
            <Link
              to={user && mode === 'employer' ? '/employer/post-job' : `/find-jobs?search=${encodeURIComponent(query)}`}
              className="h-12 px-space-lg w-full sm:w-auto flex items-center justify-center gap-1 bg-primary-container text-on-primary rounded-lg font-display text-label-lg shadow-sm hover:bg-primary transition-colors"
            >
              {user && mode === 'employer' ? t('postJob') : t('searchJobs')}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-space-sm mt-space-lg">
            {categories.map((c) => (
              <Link
                key={c.key}
                to={`/find-jobs?sector=${c.key}`}
                className="flex items-center gap-1.5 bg-surface-container-lowest px-space-md py-2 rounded-full font-display text-label-md text-on-surface shadow-sm hover:shadow-md hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-primary-container">{c.icon}</span>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="max-w-7xl mx-auto w-full px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
        <div className="flex items-center justify-between mb-space-md">
          <div>
            <h2 className="font-display text-headline-md text-primary">{t('jobsNearYou')}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Verified local employers, daily gigs &amp; remote contracts
            </p>
          </div>
          <Link to="/find-jobs" className="font-display text-label-lg text-primary-container hover:underline">
            {t('viewAll')} &rarr;
          </Link>
        </div>
        {jobs.length === 0 ? (
          <EmptyState label="No jobs yet — run the seed_demo command or post one from the employer hub." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-lg">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Featured gigs */}
      <section className="w-full bg-surface-container-low py-space-xl px-margin md:px-margin-md lg:px-margin-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-display text-headline-md text-primary">{t('popularGigs')}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Hire trusted freelancers &amp; tradespeople directly
              </p>
            </div>
            <Link to="/freelance" className="font-display text-label-lg text-primary-container hover:underline">
              {t('browseAll')} &rarr;
            </Link>
          </div>
          {gigs.length === 0 ? (
            <EmptyState label="No gigs yet — run the seed_demo command or post one." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {gigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Employer CTA */}
      <section className="max-w-7xl mx-auto w-full px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
        <div className="bg-primary-container rounded-xl px-space-lg py-space-xl text-center">
          <h2 className="font-display text-headline-md text-on-primary mb-space-sm">{t('hiringNepal')}</h2>
          <p className="font-body-md text-body-md text-primary-fixed-dim max-w-xl mx-auto mb-space-md">
            Post a vacancy, screen applicants through our built-in ATS pipeline, and hire with
            verified-escrow confidence.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-1 bg-secondary text-on-secondary px-space-lg py-3 rounded-lg font-display text-label-lg shadow-[0_2px_8px_-2px_rgba(183,16,42,0.4)] hover:bg-secondary-container transition-colors"
          >
            Post a Job for Free
          </Link>
        </div>
      </section>
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-lg p-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
      {label}
    </div>
  )
}
