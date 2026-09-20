import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchGig, proposeToGig } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function GigDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [gig, setGig] = useState(null)
  const [message, setMessage] = useState('')
  const [budget, setBudget] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    fetchGig(id).then(({ data }) => setGig(data))
  }, [id])

  const handlePropose = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await proposeToGig(id, { message, budget: budget || undefined })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (!gig) return <div className="pt-32 text-center font-body-md text-on-surface-variant">{t('loadingGigs')}</div>

  return (
    <div className="max-w-5xl mx-auto px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
      <Link to="/freelance" className="font-display text-label-md text-primary-container hover:underline">
        &larr; Back to gigs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-lg mt-space-md">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-space-lg card-elevated">
          <div className="flex items-center gap-space-sm mb-space-md">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center font-display font-bold text-on-secondary-fixed">
              {(gig.freelancer_detail?.first_name || gig.freelancer_detail?.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-display text-title-md text-on-surface">
                {gig.freelancer_detail?.first_name} {gig.freelancer_detail?.last_name}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {gig.freelancer_detail?.district}
              </p>
            </div>
            {gig.is_verified && (
              <span className="ml-auto inline-flex items-center gap-1 bg-verified/10 text-[#059669] px-2 py-1 rounded-full font-display text-label-sm font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Verified
              </span>
            )}
          </div>

          <h1 className="font-display text-headline-md text-on-surface mb-space-sm">{gig.title}</h1>
          <div className="flex flex-wrap gap-1.5 mb-space-md">
            {gig.skills_list?.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded bg-surface-container-low text-on-surface font-display text-label-sm">
                {s}
              </span>
            ))}
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">{gig.description}</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-lg card-elevated h-fit sticky top-28">
          <p className="font-display text-headline-sm text-primary mb-1">
            NPR {gig.rate.toLocaleString()}
            {gig.rate_type === 'hourly' ? '/hr' : ' fixed'}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            Delivery in ~{gig.delivery_days} day{gig.delivery_days > 1 ? 's' : ''}
          </p>

          {!user && (
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center bg-secondary text-on-secondary py-3 rounded-lg font-display text-label-lg shadow-sm hover:bg-secondary-container transition-colors"
            >
                {t('loginToApply')}
            </Link>
          )}

          {user && status !== 'sent' && (
            <form onSubmit={handlePropose} className="flex flex-col gap-space-sm">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={t('proposalMessage')}
                className="w-full p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                type="number"
                placeholder={t('budget')}
                className="w-full p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full inline-flex items-center justify-center bg-secondary text-on-secondary py-3 rounded-lg font-display text-label-lg shadow-sm hover:bg-secondary-container transition-colors disabled:opacity-60"
              >
                {status === 'sending' ? t('sending') : t('sendProposal')}
              </button>
              {status === 'error' && <p className="font-body-sm text-error">Could not send proposal.</p>}
            </form>
          )}

          {status === 'sent' && (
            <div className="flex items-center gap-1 text-[#059669] font-display text-label-lg">
              <span className="material-symbols-outlined">check_circle</span>
              {t('proposalSent')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
