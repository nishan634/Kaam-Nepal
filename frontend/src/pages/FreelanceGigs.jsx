import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGigs } from '../api/endpoints'
import GigCard from '../components/GigCard'
import { useAuth } from '../context/AuthContext'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'design', label: 'Design & Creative' },
  { value: 'dev', label: 'Programming & Tech' },
  { value: 'writing', label: 'Writing & Translation' },
  { value: 'trades', label: 'Home & Trade Services' },
  { value: 'tutoring', label: 'Tutoring & Lessons' },
]

export default function FreelanceGigs() {
  const { user } = useAuth()
  const [gigs, setGigs] = useState([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = { category, search }
    Object.keys(params).forEach((k) => !params[k] && delete params[k])
    fetchGigs(params)
      .then(({ data }) => setGigs(data.results || data))
      .finally(() => setLoading(false))
  }, [category, search])

  return (
    <div className="max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display text-headline-md text-primary">Freelance & Trade Services</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Hire vetted freelancers, artisans &amp; tradespeople directly — no middlemen.
          </p>
        </div>
        {user?.role === 'jobseeker' && (
          <Link
            to="/freelance/new"
            className="inline-flex items-center gap-1 bg-primary-container text-on-primary px-space-md py-2.5 rounded-lg font-display text-label-lg shadow-sm hover:bg-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Post a Gig
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-space-sm mb-space-lg">
        <div className="relative flex-1">
          <span className="material-symbols-outlined text-outline absolute left-space-sm top-1/2 -translate-y-1/2 text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gigs, e.g. 'React website', 'wiring repair'..."
            className="w-full h-12 pl-10 pr-4 bg-surface-container-low rounded-lg font-body-md text-body-md outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-12 px-space-md bg-surface-container-low rounded-lg font-display text-label-md outline-none cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="font-body-md text-on-surface-variant">Loading gigs...</p>
      ) : gigs.length === 0 ? (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-lg p-space-xl text-center font-body-md text-on-surface-variant">
          No gigs found. Try a different search, or seed demo data with{' '}
          <code>python manage.py seed_demo</code>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      )}
    </div>
  )
}
