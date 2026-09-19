import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '',
    role: 'jobseeker', district: 'kathmandu', skills: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await register(form)
      navigate(user.role === 'employer' ? '/employer/hub' : '/find-jobs')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-margin py-space-xl">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl p-space-lg card-elevated">
        <h1 className="font-display text-headline-md text-primary mb-1">Join KAAM Nepal</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
          Create an account as a job seeker/freelancer or as an employer.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div className="flex gap-space-sm">
            {[
              { value: 'jobseeker', label: 'Job Seeker / Freelancer', icon: 'person' },
              { value: 'employer', label: 'Employer', icon: 'apartment' },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg font-display text-label-md transition-colors ${
                  form.role === r.value
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-space-md">
            <Field label="First Name">
              <input required value={form.first_name} onChange={update('first_name')} className="input" />
            </Field>
            <Field label="Last Name">
              <input required value={form.last_name} onChange={update('last_name')} className="input" />
            </Field>
          </div>
          <Field label="Username">
            <input required value={form.username} onChange={update('username')} className="input" />
          </Field>
          <Field label="Email">
            <input required type="email" value={form.email} onChange={update('email')} className="input" />
          </Field>
          <Field label="Password">
            <input required type="password" value={form.password} onChange={update('password')} className="input" />
          </Field>
          <Field label="District">
            <select value={form.district} onChange={update('district')} className="input">
              <option value="kathmandu">Kathmandu</option>
              <option value="pokhara">Pokhara</option>
              <option value="lalitpur">Lalitpur</option>
              <option value="biratnagar">Biratnagar</option>
              <option value="remote">Remote / Overseas</option>
            </select>
          </Field>
          {form.role === 'jobseeker' && (
            <Field label="Skills (comma-separated)">
              <input value={form.skills} onChange={update('skills')} className="input" placeholder="Electrician, React, Cooking..." />
            </Field>
          )}

          {error && <p className="font-body-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-primary-container text-on-primary rounded-lg font-display text-label-lg hover:bg-primary transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-container font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
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
