import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const categoryLabels = {
  design: 'Design & Creative',
  dev: 'Programming & Tech',
  writing: 'Writing & Translation',
  trades: 'Home & Trade Services',
  tutoring: 'Tutoring & Lessons',
  other: 'Other',
}

export default function GigCard({ gig }) {
  const { t } = useLanguage()
  return (
    <Link
      to={`/gigs/${gig.id}`}
      className="block bg-surface-container-lowest border border-primary/[0.08] rounded-lg p-space-md card-elevated transition-all"
    >
      <div className="flex items-center gap-space-sm mb-space-sm">
        <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center font-display font-bold text-on-secondary-fixed">
          {(gig.freelancer_detail?.first_name || gig.freelancer_detail?.username || '?')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-display text-label-lg text-on-surface">
            {gig.freelancer_detail?.first_name || gig.freelancer_detail?.username}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t(gig.category) || categoryLabels[gig.category]}</p>
        </div>
        {gig.is_verified && (
          <span className="ml-auto material-symbols-outlined text-verified text-[18px]" title="Verified">
            verified
          </span>
        )}
      </div>

      <h3 className="font-display text-title-md font-bold text-on-surface leading-snug mb-space-sm line-clamp-2">
        {gig.title}
      </h3>

      <div className="flex flex-wrap gap-1.5 mb-space-md">
        {gig.skills_list?.slice(0, 3).map((s) => (
          <span key={s} className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface font-display text-label-sm">
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-space-sm border-t border-outline-variant/40">
        <span className="inline-flex items-center gap-1 bg-marigold/15 text-[#b45309] px-2 py-0.5 rounded-full font-display text-label-sm font-bold">
          <span className="material-symbols-outlined text-[14px]">star</span>
          {Number(gig.rating).toFixed(1)} ({gig.review_count})
        </span>
        <span className="font-display text-label-lg text-primary font-bold">
          NPR {gig.rate.toLocaleString()}
          {gig.rate_type === 'hourly' ? '/hr' : ''}
        </span>
      </div>
    </Link>
  )
}
