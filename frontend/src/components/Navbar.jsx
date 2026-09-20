import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) =>
  `font-display text-label-lg py-1.5 px-2 transition-colors ${
    isActive
      ? 'bg-surface-container-high text-on-surface font-bold rounded-lg px-3'
      : 'text-on-surface-variant hover:text-on-surface'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [lang, setLang] = useState('EN')

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
              <option>All Nepal (नेपाल भर)</option>
              <option>Kathmandu (काठमाडौं)</option>
              <option>Pokhara (पोखरा)</option>
              <option>Lalitpur (ललितपुर)</option>
              <option>Remote / Overseas</option>
            </select>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-space-md">
          <NavLink to="/find-jobs" className={navLinkClass}>
            Find Jobs
          </NavLink>
          <NavLink to="/freelance" className={navLinkClass}>
            Freelance Services
          </NavLink>
          {user?.role === 'employer' && (
            <NavLink to="/employer/hub" className={navLinkClass}>
              Hiring Hub
            </NavLink>
          )}
          {user?.role === 'jobseeker' && (
            <NavLink to="/my-applications" className={navLinkClass}>
              My Applications
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-space-md">
          <div className="hidden md:inline-flex items-center bg-surface-container-low p-1 rounded-full">
            {['EN', 'नेपाली'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                type="button"
                className={`px-2.5 py-1 rounded-full font-display text-label-sm ${
                  lang === l
                    ? 'bg-primary-container text-on-primary font-bold shadow-[0_1px_4px_rgba(15,41,66,0.1)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {user?.role === 'employer' && (
            <Link
              to="/employer/post-job"
              className="hidden sm:inline-flex items-center justify-center font-display text-label-lg bg-secondary text-on-secondary px-space-md py-2.5 rounded-lg shadow-[0_2px_8px_-2px_rgba(183,16,42,0.4)] hover:bg-secondary-container transition-colors"
            >
              Post a Job
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
                title="Log out"
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
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center font-display text-label-lg bg-primary-container text-on-primary px-space-md py-2.5 rounded-lg shadow-sm hover:bg-primary transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
