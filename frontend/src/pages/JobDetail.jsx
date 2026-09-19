import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchJob, applyToJob } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
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
      await applyToJob(id, { cover_letter: coverLetter })
      setStatus('applied')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.detail || 'Could not submit application.')
    }
  }

  if (!job) {
    return <div className="pt-32 text-center font-body-md text-on-surface-variant">Loading job...</div>
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

          <h2 className="font-display text-title-md text-primary mt-space-lg mb-space-sm">Job Description</h2>
          <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">{job.description}</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-lg card-elevated h-fit sticky top-28">
          <p className="font-display text-label-md text-on-surface-variant uppercase tracking-wider">Pay</p>
          <p className="font-display text-headline-sm text-primary mb-space-md">
            {job.salary_min || job.salary_max
              ? `NPR ${(job.salary_min || 0).toLocaleString()}–${(job.salary_max || 0).toLocaleString()}`
              : 'Negotiable'}{' '}
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
              Log in to Apply
            </Link>
          )}

          {user?.role === 'jobseeker' && status !== 'applied' && (
            <form onSubmit={handleApply} className="flex flex-col gap-space-sm">
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                placeholder="Short cover note (optional)"
                className="w-full p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary"
              />
              {status === 'error' && <p className="font-body-sm text-error">{errorMsg}</p>}
              <button
                type="submit"
                disabled={status === 'applying'}
                className="w-full inline-flex items-center justify-center bg-secondary text-on-secondary py-3 rounded-lg font-display text-label-lg shadow-[0_2px_8px_-2px_rgba(183,16,42,0.4)] hover:bg-secondary-container transition-colors disabled:opacity-60"
              >
                {status === 'applying' ? 'Submitting...' : 'Apply Now'}
              </button>
            </form>
          )}

          {status === 'applied' && (
            <div className="flex items-center gap-1 text-[#059669] font-display text-label-lg">
              <span className="material-symbols-outlined">check_circle</span>
              Application submitted!
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
