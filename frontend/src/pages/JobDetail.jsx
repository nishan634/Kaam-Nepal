import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchJob, applyToJob } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [job, setJob] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | applying | applied | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchJob(id).then(({ data }) => setJob(data))
  }, [id])

  const handleApply = async (e) => {
    e.preventDefault()
    setStatus('applying')
    setErrorMsg('')
    try {
      await applyToJob(id, { cover_letter: coverLetter, resume_url: resumeUrl, portfolio_url: portfolioUrl })
      setStatus('applied')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.detail || 'Could not submit application.')
    }
  }

  if (!job) {
    return <div className="pt-32 text-center font-body-md text-on-surface-variant">{t('loadingJobs')}</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
      <Link to="/find-jobs" className="font-display text-label-md text-primary-container hover:underline">
        &larr; Back to jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-lg mt-space-md">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-space-lg card-elevated">
          <div className="flex items-start gap-space-md">
            <div className="w-14 h-14 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-display font-bold text-xl shrink-0">
              {(job.company_name || 'K')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-headline-md text-on-surface">{job.title}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {job.company_name || 'KAAM Employer'} &middot; {job.is_remote ? 'Remote' : job.district}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-space-md">
            {job.skills_list?.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded bg-surface-container-low text-on-surface font-display text-label-sm">
                {s}
              </span>
            ))}
          </div>

          <h2 className="font-display text-title-md text-primary mt-space-lg mb-space-sm">{t('jobDescription')}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">{job.description}</p>

          <h2 className="font-display text-title-md text-primary mt-space-lg mb-space-sm">{t('jobLocation')}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
            {job.location_address || (job.is_remote ? 'Remote / Overseas' : job.district)}
          </p>
          {job.latitude && job.longitude ? (
            <>
              <div className="overflow-hidden rounded-lg border border-outline-variant aspect-[16/9]">
                <iframe
                  title="Google Maps job location"
                  className="w-full h-full border-0"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${job.latitude},${job.longitude}&z=15&output=embed`}
                />
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center mt-space-sm text-primary-container font-display text-label-md hover:underline"
              >
                {t('getDirections')}
                <span className="material-symbols-outlined text-[16px] ml-1">directions</span>
              </a>
            </>
          ) : (
            <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low rounded-lg p-space-sm">
              Map coordinates are not available for this job yet.
            </p>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-lg card-elevated h-fit sticky top-28">
          <p className="font-display text-label-md text-on-surface-variant uppercase tracking-wider">{t('pay')}</p>
          <p className="font-display text-headline-sm text-primary mb-space-md">
            {job.salary_min || job.salary_max
              ? `NPR ${(job.salary_min || 0).toLocaleString()}–${(job.salary_max || 0).toLocaleString()}`
              : t('negotiable')}{' '}
            <span className="font-body-sm text-body-sm text-on-surface-variant">/ {job.salary_period}</span>
          </p>

          {job.is_verified_escrow && (
            <span className="inline-flex items-center gap-1 bg-verified/10 text-[#059669] px-2 py-1 rounded-full font-display text-label-sm font-bold mb-space-md">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Verified Escrow Payout
            </span>
          )}

          {!user && (
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center bg-secondary text-on-secondary py-3 rounded-lg font-display text-label-lg shadow-[0_2px_8px_-2px_rgba(183,16,42,0.4)] hover:bg-secondary-container transition-colors"
            >
              {t('loginToApply')}
            </Link>
          )}

          {user?.role === 'jobseeker' && status !== 'applied' && (
            <form onSubmit={handleApply} className="flex flex-col gap-space-sm">
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                placeholder={t('coverNote')}
                className="w-full p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder={t('cvLink')}
                className="w-full p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder={t('portfolioLink')}
                className="w-full p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary"
              />
              {status === 'error' && <p className="font-body-sm text-error">{errorMsg}</p>}
              <button
                type="submit"
                disabled={status === 'applying'}
                className="w-full inline-flex items-center justify-center bg-secondary text-on-secondary py-3 rounded-lg font-display text-label-lg shadow-[0_2px_8px_-2px_rgba(183,16,42,0.4)] hover:bg-secondary-container transition-colors disabled:opacity-60"
              >
                {status === 'applying' ? t('submitting') : t('applyNow')}
              </button>
            </form>
          )}

          {status === 'applied' && (
            <div className="flex items-center gap-1 text-[#059669] font-display text-label-lg">
              <span className="material-symbols-outlined">check_circle</span>
              {t('applicationSubmitted')}
            </div>
          )}

          {user?.role === 'employer' && (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              You're signed in as an employer — switch to a jobseeker account to apply.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
