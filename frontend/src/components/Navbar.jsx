import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useMode } from '../context/ModeContext'
import { fetchJobNotifications, markJobNotificationRead } from '../api/endpoints'

const navLinkClass = ({ isActive }) =>
  `font-display text-label-lg py-1.5 px-2 transition-colors ${
    isActive
      ? 'bg-surface-container-high text-on-surface font-bold rounded-lg px-3'
      : 'text-on-surface-variant hover:text-on-surface'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { mode, setMode } = useMode()
  const navigate = useNavigate()
  const [lang, setLang] = useState('EN')
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    if (user?.role !== 'jobseeker') {
      setNotifications([])
      return undefined
    }
    const loadNotifications = () => {
      fetchJobNotifications()
        .then(({ data }) => setNotifications(data.results || data))
        .catch(() => {})
    }
    loadNotifications()
    const interval = window.setInterval(loadNotifications, 30000)
    return () => window.clearInterval(interval)
  }, [user?.role])

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      await markJobNotificationRead(notification.id).catch(() => {})
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item))
    }
    setNotificationsOpen(false)
    navigate(`/jobs/${notification.job}`)
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,41,66,0.06)]">
      <div className="h-20 max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="flex items-center gap-space-sm">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-container text-on-primary font-display font-bold text-sm">
              क
            </span>
            <span className="font-display text-headline-sm font-bold text-primary tracking-tight">
              KAAM <span className="text-secondary font-display text-title-md font-normal">नेपाल</span>
            </span>
          </Link>
          <div className="hidden xl:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-lg text-on-surface-variant">
            <span className="material-symbols-outlined text-primary-container text-[18px]">location_on</span>
            <select className="bg-transparent font-display text-label-md text-on-surface outline-none cursor-pointer pr-space-xs">
              <option>{t('allNepal')}</option>
              <option>{t('kathmandu')}</option>
              <option>{t('pokhara')}</option>
              <option>{t('lalitpur')}</option>
              <option>{t('remote')}</option>
            </select>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-space-md">
          <NavLink to="/find-jobs" className={navLinkClass}>
            {t('findJobs')}
          </NavLink>
          <NavLink to="/freelance" className={navLinkClass}>
            {t('freelance')}
          </NavLink>
          {user && mode === 'employer' && (
            <NavLink to="/employer/hub" className={navLinkClass}>
              {t('hiringHub')}
            </NavLink>
          )}
          {user && mode === 'jobseeker' && (
            <NavLink to="/my-applications" className={navLinkClass}>
              {t('myApplications')}
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-space-md">
          {user && (
            <div className="hidden md:inline-flex items-center bg-surface-container-low p-1 rounded-lg">
              {[
                ['jobseeker', t('jobSeekerMode'), 'person'],
                ['employer', t('employerMode'), 'business_center'],
              ].map(([value, label, icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-display text-label-sm transition-colors ${
                    mode === value
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="hidden md:inline-flex items-center bg-surface-container-low p-1 rounded-full">
            {[['en', 'EN'], ['ne', 'नेपाली']].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setLanguage(value)}
                type="button"
                className={`px-2.5 py-1 rounded-full font-display text-label-sm ${
                  language === value
                    ? 'bg-primary-container text-on-primary font-bold shadow-[0_1px_4px_rgba(15,41,66,0.1)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {user?.role === 'jobseeker' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label={t('notifications')}
                title={t('notifications')}
                className="relative p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {notifications.some((item) => !item.is_read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant overflow-hidden">
                  <div className="px-space-md py-space-sm border-b border-outline-variant">
                    <p className="font-display text-label-lg text-primary">{t('notifications')}</p>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-space-md font-body-sm text-body-sm text-on-surface-variant">{t('noNotifications')}</p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => openNotification(notification)}
                          className={`w-full text-left px-space-md py-space-sm border-b border-outline-variant/60 hover:bg-surface-container-low ${notification.is_read ? '' : 'bg-emerald-50'}`}
                        >
                          <p className="font-display text-label-md text-on-surface">{notification.title}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{notification.message}</p>
                          <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {user && mode === 'employer' && (
            <Link
              to="/employer/post-job"
              className="hidden sm:inline-flex items-center justify-center font-display text-label-lg bg-secondary text-on-secondary px-space-md py-2.5 rounded-lg shadow-[0_2px_8px_-2px_rgba(183,16,42,0.4)] hover:bg-secondary-container transition-colors"
            >
              {t('postJob')}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-space-sm">
              <span className="hidden md:inline font-display text-label-md text-on-surface-variant">
                Hi, {user.first_name || user.username}
              </span>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                title={t('logout')}
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </button>
              <span className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-display font-bold text-primary shadow-[0_0_0_2px_rgba(15,41,66,0.12)]">
                {(user.first_name || user.username || '?')[0].toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-space-sm">
              <Link
                to="/login"
                className="font-display text-label-lg text-on-surface-variant hover:text-on-surface px-2"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center font-display text-label-lg bg-primary-container text-on-primary px-space-md py-2.5 rounded-lg shadow-sm hover:bg-primary transition-colors"
              >
                {t('signup')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
