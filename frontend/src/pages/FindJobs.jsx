import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchJobs } from '../api/endpoints'
import JobCard from '../components/JobCard'

const sectors = [
  { value: '', label: 'All Sectors' },
  { value: 'trade', label: 'Skilled Trades & Construction' },
  { value: 'tech', label: 'Tech, Remote & IT' },
  { value: 'hospitality', label: 'Hospitality & Culinary' },
  { value: 'logistics', label: 'Transport & Logistics' },
  { value: 'health', label: 'Healthcare & Diagnostics' },
]

const jobTypes = [
  { value: '', label: 'All Types' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'daily_wage', label: 'Daily Wage' },
  { value: 'contract', label: 'Contract' },
  { value: 'remote', label: 'Remote' },
]

export default function FindJobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sector, setSector] = useState(searchParams.get('sector') || '')
  const [jobType, setJobType] = useState(searchParams.get('job_type') || '')
  const [ordering, setOrdering] = useState('-created_at')

  useEffect(() => {
    setLoading(true)
    const params = { search, sector, job_type: jobType, ordering }
    Object.keys(params).forEach((k) => !params[k] && delete params[k])
    fetchJobs(params)
      .then(({ data }) => {
        setJobs(data.results || data)
        setCount(data.count ?? (data.results || data).length)
      })
      .finally(() => setLoading(false))
  }, [search, sector, jobType, ordering])

  const runSearch = (e) => {
    e.preventDefault()
    setSearchParams({ search, sector, job_type: jobType })
  }

  return (
    <div className="w-full">
      <section className="w-full bg-surface-container-lowest px-margin md:px-margin-md lg:px-margin-lg py-space-md shadow-sm sticky top-20 z-30">
        <form onSubmit={runSearch} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-sm items-center">
          <div className="lg:col-span-5 relative flex items-center">
            <span className="material-symbols-outlined text-outline absolute left-space-md pointer-events-none text-[22px]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-surface-container-low rounded-lg font-body-md text-body-md outline-none"
              placeholder="Role, trade skill, or keyword (e.g. Electrician, React, Chef)..."
            />
          </div>
          <div className="lg:col-span-3">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full h-12 px-space-md bg-surface-container-low rounded-lg font-display text-label-md outline-none cursor-pointer"
            >
              {sectors.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full h-12 px-space-md bg-surface-container-low rounded-lg font-display text-label-md outline-none cursor-pointer"
            >
              {jobTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="lg:col-span-2 h-12 px-space-md bg-primary-container hover:bg-primary text-on-primary rounded-lg font-display text-label-lg flex items-center justify-center gap-1 shadow-sm transition-all"
          >
            Search
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>
      </section>

      <main className="max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg py-space-lg">
        <div className="flex items-center justify-between bg-surface-container-lowest p-space-md rounded-xl shadow-sm mb-space-md">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-headline-sm text-primary">Job Openings</h1>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-display text-label-sm">
                {count} Openings
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Verified local employers, daily gigs &amp; remote contracts
            </p>
          </div>
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="bg-surface-container-low font-display text-label-md py-1.5 px-2.5 rounded-md outline-none cursor-pointer"
          >
            <option value="-created_at">Newest First</option>
            <option value="-salary_max">Highest Pay</option>
          </select>
        </div>

        {loading ? (
          <p className="font-body-md text-on-surface-variant">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-lg p-space-xl text-center font-body-md text-on-surface-variant">
            No jobs match your filters yet. Try clearing filters, or seed demo data on the backend
            with <code>python manage.py seed_demo</code>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-lg">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
