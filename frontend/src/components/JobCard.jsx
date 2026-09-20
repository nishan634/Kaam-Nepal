import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const sectorLabels = {
  trade: 'Skilled Trades & Construction',
  tech: 'Tech, Remote & IT',
  hospitality: 'Hospitality & Culinary',
  logistics: 'Transport & Logistics',
  health: 'Healthcare & Diagnostics',
  other: 'Other',
}

const jobTypeLabels = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  daily_wage: 'Daily Wage',
  contract: 'Contract',
  remote: 'Remote',
}

function formatSalary(job) {
  if (!job.salary_min && !job.salary_max) return 'Negotiable'
  const period = { hourly: '/hr', daily: '/day', monthly: '/mo', fixed: ' fixed' }[job.salary_period] || ''
  if (job.salary_min && job.salary_max) {
    return `NPR ${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()}${period}`
  }
  return `NPR ${(job.salary_min || job.salary_max).toLocaleString()}${period}`
}

export default function JobCard({ job }) {
  const { t } = useLanguage()
  const translatedSectors = { trade: 'skilledTrades', tech: 'techRemote', hospitality: 'hospitality', logistics: 'logistics', health: 'healthcare', other: 'other' }
  const translatedTypes = { full_time: 'fullTime', part_time: 'partTime', daily_wage: 'dailyWage', contract: 'contract', remote: 'remote' }
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-surface-container-lowest border border-primary/[0.08] rounded-lg p-space-md md:p-space-lg card-elevated transition-all"
    >
      <div className="flex items-start justify-between gap-space-md">
        <div className="flex items-start gap-space-sm">
          <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-display font-bold text-lg shrink-0">
            {(job.company_name || job.employer_detail?.username || 'K')[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-title-md font-bold text-on-surface leading-tight">{job.title}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {job.company_name || job.employer_detail?.first_name || 'KAAM Employer'}
            </p>
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-marigold/15 text-[#b45309] font-display text-label-sm font-bold whitespace-nowrap">
          {formatSalary(job)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-space-md">
        {job.skills_list?.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="px-2.5 py-1 rounded bg-surface-container-low text-on-surface font-display text-label-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-space-md pt-space-md border-t border-outline-variant/40">
        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
            {job.is_remote ? 'Remote' : job.district}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-display text-label-sm">
            {t(translatedTypes[job.job_type] || job.job_type)}
          </span>
          {job.is_verified_escrow && (
            <span className="inline-flex items-center gap-1 bg-verified/10 text-[#059669] px-2 py-0.5 rounded-full font-display text-label-sm font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Verified Escrow
            </span>
          )}
        </div>
        <span className="font-display text-label-sm text-on-surface-variant hidden sm:inline">
          {t(translatedSectors[job.sector] || job.sector)}
        </span>
      </div>
    </Link>
  )
}
