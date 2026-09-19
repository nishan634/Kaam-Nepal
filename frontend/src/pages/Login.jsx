import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      const redirectTo = location.state?.from || (user.role === 'employer' ? '/employer/hub' : '/find-jobs')
      navigate(redirectTo)
    } catch (err) {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-margin py-space-xl">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-space-lg card-elevated">
        <h1 className="font-display text-headline-md text-primary mb-1">Welcome back</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
          Log in to KAAM Nepal to apply, hire, or manage your gigs.
        </p>

        <div className="bg-surface-container-low rounded-lg p-space-sm mb-space-md font-body-sm text-body-sm text-on-surface-variant">
          Demo accounts (after <code>seed_demo</code>): <br />
          Employer — <strong>himalayan_treks</strong> / demo1234 <br />
          Jobseeker — <strong>sita_gurung</strong> / demo1234
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <label className="flex flex-col gap-1">
            <span className="font-display text-label-md text-on-surface-variant">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full h-12 px-space-md rounded-lg bg-surface-container-low outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-display text-label-md text-on-surface-variant">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 px-space-md rounded-lg bg-surface-container-low outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          {error && <p className="font-body-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-primary-container text-on-primary rounded-lg font-display text-label-lg hover:bg-primary transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md text-center">
          New to KAAM Nepal?{' '}
          <Link to="/register" className="text-primary-container font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
