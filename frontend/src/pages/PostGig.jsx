import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGig } from '../api/endpoints'
import { useLanguage } from '../context/LanguageContext'

export default function PostGig() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [form, setForm] = useState({
    title: '', description: '', category: 'other', rate: '', rate_type: 'fixed',
    delivery_days: 3, skills: '',
  })
  const [error, setError] = useState('')

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await createGig({ ...form, rate: Number(form.rate), delivery_days: Number(form.delivery_days) })
      navigate(`/gigs/${data.id}`)
    } catch (err) {
      setError('Could not post gig. Check the fields and try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-margin py-space-xl">
      <h1 className="font-display text-headline-md text-primary mb-space-md">{t('postGig')}</h1>
      <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl p-space-lg card-elevated flex flex-col gap-space-md">
        <Field label={t('gigTitle')}>
          <input required value={form.title} onChange={update('title')} className="input" placeholder="I will build a responsive React website" />
        </Field>
        <Field label={t('description')}>
          <textarea required rows={5} value={form.description} onChange={update('description')} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-space-md">
          <Field label={t('category')}>
            <select value={form.category} onChange={update('category')} className="input">
              <option value="design">Design & Creative</option>
              <option value="dev">Programming & Tech</option>
              <option value="writing">Writing & Translation</option>
              <option value="trades">Home & Trade Services</option>
              <option value="tutoring">Tutoring & Lessons</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label={t('rateType')}>
            <select value={form.rate_type} onChange={update('rate_type')} className="input">
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <Field label={t('rate')}>
            <input required type="number" value={form.rate} onChange={update('rate')} className="input" />
          </Field>
          <Field label={t('deliveryDays')}>
            <input required type="number" value={form.delivery_days} onChange={update('delivery_days')} className="input" />
          </Field>
        </div>
        <Field label={t('skills')}>
          <input value={form.skills} onChange={update('skills')} className="input" placeholder="React, Tailwind, API Integration" />
        </Field>
        {error && <p className="font-body-sm text-error">{error}</p>}
        <button type="submit" className="bg-primary-container text-on-primary py-3 rounded-lg font-display text-label-lg hover:bg-primary transition-colors">
          {t('publishGig')}
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
