import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchHiringDashboard, updateApplicationStage } from '../api/endpoints'

const stages = [
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offered', label: 'Offered' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
]

export default function EmployerHub() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetchHiringDashboard()
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const moveStage = async (appId, newStage) => {
    // optimistic UI update
    setData((prev) => {
      const next = { ...prev, pipeline: { ...prev.pipeline } }
      for (const s of Object.keys(next.pipeline)) {
        const idx = next.pipeline[s].findIndex((a) => a.id === appId)
        if (idx !== -1) {
          const [item] = next.pipeline[s].splice(idx, 1)
          item.stage = newStage
          next.pipeline[newStage] = [...(next.pipeline[newStage] || []), item]
          break
        }
      }
      return next
    })
    try {
      await updateApplicationStage(appId, newStage)
    } catch {
      load() // revert on failure
    }
  }

  if (loading || !data) {
    return <div className="pt-32 text-center font-body-md text-on-surface-variant">Loading hiring hub...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display text-headline-md text-primary">Employer Hiring Hub</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage your job posts and move applicants through your pipeline.
          </p>
        </div>
        <Link
          to="/employer/post-job"
          className="inline-flex items-center gap-1 bg-secondary text-on-secondary px-space-md py-2.5 rounded-lg font-display text-label-lg shadow-[0_2px_8px_-2px_rgba(183,16,42,0.4)] hover:bg-secondary-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Post a Job
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter mb-space-lg">
        <StatCard label="Jobs Posted" value={data.jobs_posted} icon="work" />
        <StatCard label="Open Jobs" value={data.open_jobs} icon="business_center" />
        <StatCard label="Total Applicants" value={data.total_applicants} icon="groups" />
      </div>

      <h2 className="font-display text-title-md text-primary mb-space-sm">Applicant Pipeline (ATS)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-gutter">
        {stages.map((stage) => (
          <div key={stage.key} className="bg-surface-container-low rounded-xl p-space-sm min-h-[200px]">
            <div className="flex items-center justify-between mb-space-sm px-space-xs">
              <h3 className="font-display text-label-lg text-on-surface">{stage.label}</h3>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-display text-label-sm">
                {data.pipeline[stage.key]?.length || 0}
              </span>
            </div>
            <div className="flex flex-col gap-space-sm">
              {(data.pipeline[stage.key] || []).map((app) => (
                <div key={app.id} className="bg-surface-container-lowest rounded-lg p-space-sm shadow-sm">
                  <p className="font-display text-label-md text-on-surface">
                    {app.applicant_detail?.first_name || app.applicant_detail?.username}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm line-clamp-1">
                    {app.job_detail?.title}
                  </p>
                  <select
                    value={app.stage}
                    onChange={(e) => moveStage(app.id, e.target.value)}
                    className="w-full text-xs bg-surface-container-low rounded-md py-1 px-1.5 font-display outline-none cursor-pointer"
                  >
                    {stages.map((s) => (
                      <option key={s.key} value={s.key}>
                        Move to {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-title-md text-primary mt-space-xl mb-space-sm">Your Job Posts</h2>
      <div className="flex flex-col gap-space-sm">
        {data.jobs.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You haven't posted any jobs yet.
          </p>
        )}
        {data.jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between bg-surface-container-lowest rounded-lg p-space-md shadow-sm"
          >
            <div>
              <Link to={`/jobs/${job.id}`} className="font-display text-label-lg text-on-surface hover:underline">
                {job.title}
              </Link>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {job.district} &middot; {job.applicant_count} applicant(s)
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-display text-label-sm font-bold ${
                job.status === 'open' ? 'bg-verified/10 text-[#059669]' : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {job.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center gap-space-sm">
      <span className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
        <span className="material-symbols-outlined text-primary-container text-[20px]">{icon}</span>
      </span>
      <div>
        <p className="font-display text-headline-sm text-on-surface">{value}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{label}</p>
      </div>
    </div>
  )
}
