import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJob } from '../api/endpoints'

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', company_name: '', description: '', sector: 'trade', job_type: 'full_time',
    district: 'kathmandu', is_remote: false, salary_min: '', salary_max: '',
    salary_period: 'monthly', skills_required: '', is_verified_escrow: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [k]: value })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
      }
      const { data } = await createJob(payload)
      navigate(`/jobs/${data.id}`)
    } catch (err) {
      setError('Could not post job. Please check the fields.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-margin py-space-xl">
      <h1 className="font-display text-headline-md text-primary mb-space-md">Post a Job Vacancy</h1>
      <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl p-space-lg card-elevated flex flex-col gap-space-md">
        <Field label="Job Title">
          <input required value={form.title} onChange={update('title')} className="input" placeholder="Site Electrician" />
        </Field>
        <Field label="Company Name">
          <input value={form.company_name} onChange={update('company_name')} className="input" placeholder="Himalayan Treks Pvt. Ltd." />
        </Field>
        <Field label="Description">
          <textarea required rows={5} value={form.description} onChange={update('description')} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-space-md">
          <Field label="Sector">
            <select value={form.sector} onChange={update('sector')} className="input">
              <option value="trade">Skilled Trades & Construction</option>
              <option value="tech">Tech, Remote & IT</option>
              <option value="hospitality">Hospitality & Culinary</option>
              <option value="logistics">Transport & Logistics</option>
              <option value="health">Healthcare & Diagnostics</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Job Type">
            <select value={form.job_type} onChange={update('job_type')} className="input">
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="daily_wage">Daily Wage</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <Field label="District">
            <select value={form.district} onChange={update('district')} className="input">
              <option value="kathmandu">Kathmandu</option>
              <option value="pokhara">Pokhara</option>
              <option value="lalitpur">Lalitpur</option>
              <option value="biratnagar">Biratnagar</option>
              <option value="remote">Remote / Overseas</option>
            </select>
          </Field>
          <Field label="Salary Period">
            <select value={form.salary_period} onChange={update('salary_period')} className="input">
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="fixed">Fixed / Project</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <Field label="Salary Min (NPR)">
            <input type="number" value={form.salary_min} onChange={update('salary_min')} className="input" />
          </Field>
          <Field label="Salary Max (NPR)">
            <input type="number" value={form.salary_max} onChange={update('salary_max')} className="input" />
          </Field>
        </div>
        <Field label="Skills Required (comma-separated)">
          <input value={form.skills_required} onChange={update('skills_required')} className="input" placeholder="Electrician, Wiring, Safety Certified" />
        </Field>
        <div className="flex items-center gap-space-lg">
          <label className="flex items-center gap-2 font-display text-label-md text-on-surface-variant">
            <input type="checkbox" checked={form.is_remote} onChange={update('is_remote')} />
            Remote position
          </label>
          <label className="flex items-center gap-2 font-display text-label-md text-on-surface-variant">
            <input type="checkbox" checked={form.is_verified_escrow} onChange={update('is_verified_escrow')} />
            Verified escrow payout
          </label>
        </div>
        {error && <p className="font-body-sm text-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-secondary text-on-secondary py-3 rounded-lg font-display text-label-lg shadow-[0_2px_8px_-2px_rgba(183,16,42,0.4)] hover:bg-secondary-container transition-colors disabled:opacity-60"
        >
          {loading ? 'Publishing...' : 'Publish Job'}
        </button>
      </form>
      <style>{`.input { width:100%; padding: 0.75rem 1rem; border-radius: 0.5rem; background:#eff4ff; outline:none; font-family:Inter,sans-serif; } .input:focus { box-shadow: 0 0 0 2px #0f2942; }`}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-display text-label-md text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}
