import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Login() {
  const { login } = useAuth()
  const { t } = useLanguage()
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
      const data = err.response?.data
      if (data?.detail) {
        setError(data.detail)
      } else if (err.request && !err.response) {
        setError('Could not connect to the server. Make sure the backend is running.')
      } else {
        setError('Login failed. Please check your username and password.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-margin py-space-xl">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-space-lg card-elevated">
        <h1 className="font-display text-headline-md text-primary mb-1">{t('welcomeBack')}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
          {t('loginIntro')}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <label className="flex flex-col gap-1">
            <span className="font-display text-label-md text-on-surface-variant">{t('username')}</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full h-12 px-space-md rounded-lg bg-surface-container-low outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-display text-label-md text-on-surface-variant">{t('password')}</span>
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
            {loading ? t('loggingIn') : t('logIn')}
          </button>
        </form>

        <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md text-center">
          {t('newToKaam')}{' '}
          <Link to="/register" className="text-primary-container font-semibold hover:underline">
            {t('createAccount')}
          </Link>
        </p>
      </div>
    </div>
  )
}
