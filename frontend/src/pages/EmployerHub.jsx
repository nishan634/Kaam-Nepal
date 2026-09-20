import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchHiringDashboard, updateApplicationStage, rateJobSeeker, fetchApplicationMessages, sendApplicationMessage } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

const stages = [
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offered', label: 'Offered' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
]

export default function EmployerHub() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ratingApp, setRatingApp] = useState(null)
  const [ratingValue, setRatingValue] = useState('5')
  const [ratingReview, setRatingReview] = useState('')
  const [ratingError, setRatingError] = useState('')
  const [detailApp, setDetailApp] = useState(null)
  const [chatApp, setChatApp] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatText, setChatText] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSending, setChatSending] = useState(false)
  const [chatError, setChatError] = useState('')

  const load = () => {
    setLoading(true)
    fetchHiringDashboard()
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const moveStage = async (appId, newStage) => {
    // optimistic UI update
    setData((prev) => {
      const next = { ...prev, pipeline: { ...prev.pipeline } }
      for (const s of Object.keys(next.pipeline)) {
        const idx = next.pipeline[s].findIndex((a) => a.id === appId)
        if (idx !== -1) {
          const [item] = next.pipeline[s].splice(idx, 1)
          item.stage = newStage
          next.pipeline[newStage] = [...(next.pipeline[newStage] || []), item]
          break
        }
      }
      return next
    })
    try {
      await updateApplicationStage(appId, newStage)
    } catch {
      load() // revert on failure
    }
  }

  const submitRating = async (e) => {
    e.preventDefault()
    setRatingError('')
    try {
      await rateJobSeeker(ratingApp.id, { rating: Number(ratingValue), review: ratingReview })
      setRatingApp(null)
      setRatingReview('')
      load()
    } catch (err) {
      setRatingError(err.response?.data?.detail || 'Could not save rating.')
    }
  }

  const openChat = async (app) => {
    setChatApp(app)
    setChatMessages([])
    setChatText('')
    setChatError('')
    setChatLoading(true)
    try {
      const { data: messages } = await fetchApplicationMessages(app.id)
      setChatMessages(messages)
    } catch (err) {
      setChatError(err.response?.data?.detail || 'Could not load messages.')
    } finally {
      setChatLoading(false)
    }
  }

  const submitMessage = async (e) => {
    e.preventDefault()
    const body = chatText.trim()
    if (!body || chatSending) return
    setChatSending(true)
    setChatError('')
    try {
      const { data: message } = await sendApplicationMessage(chatApp.id, body)
      setChatMessages((current) => [...current, message])
      setChatText('')
    } catch (err) {
      setChatError(err.response?.data?.detail || 'Could not send message.')
    } finally {
      setChatSending(false)
    }
  }

  if (loading || !data) {
    return <div className="pt-32 text-center font-body-md text-on-surface-variant">Loading hiring hub...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display text-headline-md text-primary">Employer Hiring Hub</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage your job posts and move applicants through your pipeline.
          </p>
        </div>
        <Link
          to="/employer/post-job"
          className="inline-flex items-center gap-1 bg-secondary text-on-secondary px-space-md py-2.5 rounded-lg font-display text-label-lg shadow-[0_2px_8px_-2px_rgba(183,16,42,0.4)] hover:bg-secondary-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Post a Job
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter mb-space-lg">
        <StatCard label="Jobs Posted" value={data.jobs_posted} icon="work" />
        <StatCard label="Open Jobs" value={data.open_jobs} icon="business_center" />
        <StatCard label="Total Applicants" value={data.total_applicants} icon="groups" />
      </div>

      <h2 className="font-display text-title-md text-primary mb-space-sm">Applicant Pipeline (ATS)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-gutter">
        {stages.map((stage) => (
          <div key={stage.key} className="bg-surface-container-low rounded-xl p-space-sm min-h-[200px]">
            <div className="flex items-center justify-between mb-space-sm px-space-xs">
              <h3 className="font-display text-label-lg text-on-surface">{stage.label}</h3>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-display text-label-sm">
                {data.pipeline[stage.key]?.length || 0}
              </span>
            </div>
            <div className="flex flex-col gap-space-sm">
              {(data.pipeline[stage.key] || []).map((app) => (
                <div key={app.id} className="bg-surface-container-lowest rounded-lg p-space-sm shadow-sm">
                  <p className="font-display text-label-md text-on-surface">
                    {app.applicant_detail?.first_name || app.applicant_detail?.username}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm line-clamp-1">
                    {app.job_detail?.title}
                  </p>
                  <select
                    value={app.stage}
                    onChange={(e) => moveStage(app.id, e.target.value)}
                    className="w-full text-xs bg-surface-container-low rounded-md py-1 px-1.5 font-display outline-none cursor-pointer"
                  >
                    {stages.map((s) => (
                      <option key={s.key} value={s.key}>
                        Move to {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDetailApp(app)}
                    className="w-full mt-space-sm py-1.5 rounded-md bg-surface-container-low text-primary font-display text-label-sm hover:bg-surface-container-high transition-colors"
                  >
                    View applicant details
                  </button>
                  <button
                    type="button"
                    onClick={() => openChat(app)}
                    className="w-full mt-space-sm py-1.5 rounded-md bg-secondary text-on-secondary font-display text-label-sm hover:bg-secondary-container transition-colors"
                  >
                    <span className="material-symbols-outlined align-middle text-[15px] mr-1">chat</span>
                    Chat with applicant
                  </button>
                  {app.stage === 'hired' && !app.rating && (
                    <button
                      type="button"
                      onClick={() => setRatingApp(app)}
                      className="w-full mt-space-sm py-1.5 rounded-md bg-primary-container text-on-primary font-display text-label-sm hover:bg-primary transition-colors"
                    >
                      Rate job seeker
                    </button>
                  )}
                  {app.rating && (
                    <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">
                      Rated {app.rating.rating}/5
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-title-md text-primary mt-space-xl mb-space-sm">Your Job Posts</h2>
      <div className="flex flex-col gap-space-sm">
        {data.jobs.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You haven't posted any jobs yet.
          </p>
        )}
        {data.jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between bg-surface-container-lowest rounded-lg p-space-md shadow-sm"
          >
            <div>
              <Link to={`/jobs/${job.id}`} className="font-display text-label-lg text-on-surface hover:underline">
                {job.title}
              </Link>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {job.district} &middot; {job.applicant_count} applicant(s)
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-display text-label-sm font-bold ${
                job.status === 'open' ? 'bg-verified/10 text-[#059669]' : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {job.status}
            </span>
          </div>
        ))}
      </div>

      {ratingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-space-md">
          <form onSubmit={submitRating} className="w-full max-w-md bg-surface-container-lowest rounded-xl p-space-lg shadow-xl">
            <h2 className="font-display text-title-md text-primary mb-space-md">Rate job seeker</h2>
            <label className="flex flex-col gap-1 mb-space-sm">
              <span className="font-display text-label-md text-on-surface-variant">Rating</span>
              <select value={ratingValue} onChange={(e) => setRatingValue(e.target.value)} className="w-full p-space-sm rounded-lg bg-surface-container-low">
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
              </select>
            </label>
            <textarea
              value={ratingReview}
              onChange={(e) => setRatingReview(e.target.value)}
              rows={4}
              placeholder="Optional review"
              className="w-full p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {ratingError && <p className="mt-space-sm font-body-sm text-error">{ratingError}</p>}
            <div className="flex justify-end gap-space-sm mt-space-md">
              <button type="button" onClick={() => setRatingApp(null)} className="px-space-md py-2 rounded-lg bg-surface-container-low font-display text-label-md">Cancel</button>
              <button type="submit" className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-display text-label-md">Save rating</button>
            </div>
          </form>
        </div>
      )}

      {chatApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-space-md">
          <section className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-space-md border-b border-outline-variant">
              <div>
                <h2 className="font-display text-title-md text-primary">Applicant chat</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {chatApp.applicant_detail?.first_name || chatApp.applicant_detail?.username} · {chatApp.job_detail?.title}
                </p>
              </div>
              <button type="button" onClick={() => setChatApp(null)} aria-label="Close chat" className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="h-80 overflow-y-auto p-space-md bg-surface-container-low flex flex-col gap-space-sm">
              {chatLoading && <p className="font-body-sm text-body-sm text-on-surface-variant text-center">Loading messages...</p>}
              {!chatLoading && chatMessages.length === 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-space-lg">Start the conversation with this applicant.</p>
              )}
              {chatMessages.map((message) => {
                const mine = message.sender === user?.id
                return (
                  <div key={message.id} className={`max-w-[85%] rounded-lg px-space-sm py-2 ${mine ? 'self-end bg-primary-container text-on-primary' : 'self-start bg-surface-container-lowest text-on-surface'}`}>
                    <p className="font-body-sm text-body-sm whitespace-pre-wrap">{message.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </div>
            <form onSubmit={submitMessage} className="p-space-md flex gap-space-sm">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 min-w-0 px-space-sm py-2 rounded-lg bg-surface-container-low outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" disabled={chatSending || !chatText.trim()} className="px-space-md rounded-lg bg-primary-container text-on-primary font-display text-label-md disabled:opacity-50">
                {chatSending ? 'Sending...' : 'Send'}
              </button>
            </form>
            {chatError && <p className="px-space-md pb-space-md font-body-sm text-error">{chatError}</p>}
          </section>
        </div>
      )}

      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-space-md">
          <section className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-xl p-space-lg shadow-xl">
            <div className="flex items-start justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-display font-bold text-primary text-lg">
                  {(detailApp.applicant_detail?.first_name || detailApp.applicant_detail?.username || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-title-md text-primary">
                    {detailApp.applicant_detail?.first_name} {detailApp.applicant_detail?.last_name}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    @{detailApp.applicant_detail?.username} · {detailApp.applicant_detail?.district}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setDetailApp(null)} aria-label="Close applicant details" className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-lg">
              <DetailField label="Skills" value={detailApp.applicant_detail?.skills || 'Not provided'} />
              <DetailField label="Application stage" value={stages.find((stage) => stage.key === detailApp.stage)?.label || detailApp.stage} />
            </div>

            <div className="mt-space-md">
              <p className="font-display text-label-md text-on-surface-variant mb-1">Applicant bio</p>
              <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">
                {detailApp.applicant_detail?.bio || 'No bio provided.'}
              </p>
            </div>
            <div className="mt-space-md">
              <p className="font-display text-label-md text-on-surface-variant mb-1">Cover letter</p>
              <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">
                {detailApp.cover_letter || 'No cover letter provided.'}
              </p>
            </div>
            {detailApp.resume_url && (
              <a href={detailApp.resume_url} target="_blank" rel="noreferrer" className="inline-flex mt-space-md text-primary-container font-display text-label-md hover:underline">
                Open applicant resume
                <span className="material-symbols-outlined text-[16px] ml-1">open_in_new</span>
              </a>
            )}
            {detailApp.portfolio_url && (
              <a href={detailApp.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex mt-space-md ml-space-md text-primary-container font-display text-label-md hover:underline">
                Open applicant portfolio
                <span className="material-symbols-outlined text-[16px] ml-1">open_in_new</span>
              </a>
            )}

            {detailApp.stage === 'hired' && !detailApp.rating && (
              <button
                type="button"
                onClick={() => {
                  setDetailApp(null)
                  setRatingApp(detailApp)
                }}
                className="w-full mt-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary font-display text-label-md hover:bg-primary transition-colors"
              >
                Rate this job seeker
              </button>
            )}
            {detailApp.rating && (
              <p className="mt-space-lg font-display text-label-md text-on-surface-variant">
                Your rating: {detailApp.rating.rating}/5
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function DetailField({ label, value }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-space-sm">
      <p className="font-display text-label-sm text-on-surface-variant">{label}</p>
      <p className="font-body-md text-body-md text-on-surface mt-1">{value}</p>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center gap-space-sm">
      <span className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
        <span className="material-symbols-outlined text-primary-container text-[20px]">{icon}</span>
      </span>
      <div>
        <p className="font-display text-headline-sm text-on-surface">{value}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{label}</p>
      </div>
    </div>
  )
}
