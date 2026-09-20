import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyApplications, fetchApplicationMessages, sendApplicationMessage } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

const stageLabels = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
}

export default function MyApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyApplications()
      .then(({ data }) => setApplications(data.results || data))
      .finally(() => setLoading(false))
  }, [])

  const openChat = async (application) => {
    setSelectedApplication(application)
    setMessages([])
    setMessage('')
    setError('')
    setChatLoading(true)
    try {
      const { data } = await fetchApplicationMessages(application.id)
      setMessages(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load messages.')
    } finally {
      setChatLoading(false)
    }
  }

  const submitMessage = async (event) => {
    event.preventDefault()
    const body = message.trim()
    if (!body || sending) return
    setSending(true)
    setError('')
    try {
      const { data } = await sendApplicationMessage(selectedApplication.id, body)
      setMessages((current) => [...current, data])
      setMessage('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
      <div className="mb-space-lg">
        <h1 className="font-display text-headline-md text-primary">My Applications</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Track your applications and message employers through KAAM Nepal.
        </p>
      </div>

      {loading ? (
        <p className="font-body-md text-on-surface-variant">Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center card-elevated">
          <p className="font-body-md text-on-surface-variant">You have not applied to any jobs yet.</p>
          <Link to="/find-jobs" className="inline-flex mt-space-md px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-display text-label-lg">
            Find jobs
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm">
          {applications.map((application) => {
            const job = application.job_detail
            const employer = job?.employer_detail
            return (
              <article key={application.id} className="bg-surface-container-lowest rounded-xl p-space-md card-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <Link to={`/jobs/${application.job}`} className="font-display text-title-md text-primary hover:underline">
                    {job?.title || 'Job application'}
                  </Link>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {job?.company_name || employer?.username || 'Employer'} · Applied {new Date(application.applied_at).toLocaleDateString()}
                  </p>
                  <span className="inline-flex mt-space-sm px-2.5 py-1 rounded-full bg-surface-container-low font-display text-label-sm text-on-surface-variant">
                    {stageLabels[application.stage] || application.stage}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openChat(application)}
                  className="inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-lg bg-secondary text-on-secondary font-display text-label-md hover:bg-secondary-container transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  Chat with employer
                </button>
              </article>
            )
          })}
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-space-md">
          <section className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-space-md border-b border-outline-variant">
              <div>
                <h2 className="font-display text-title-md text-primary">Employer chat</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {selectedApplication.job_detail?.company_name || selectedApplication.job_detail?.employer_detail?.username || 'Employer'} · {selectedApplication.job_detail?.title}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedApplication(null)} aria-label="Close chat" className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="h-80 overflow-y-auto p-space-md bg-surface-container-low flex flex-col gap-space-sm">
              {chatLoading && <p className="font-body-sm text-body-sm text-on-surface-variant text-center">Loading messages...</p>}
              {!chatLoading && messages.length === 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-space-lg">Send a message to the employer.</p>
              )}
              {messages.map((item) => {
                const mine = item.sender === user?.id
                return (
                  <div key={item.id} className={`max-w-[85%] rounded-lg px-space-sm py-2 ${mine ? 'self-end bg-primary-container text-on-primary' : 'self-start bg-surface-container-lowest text-on-surface'}`}>
                    <p className="font-body-sm text-body-sm whitespace-pre-wrap">{item.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </div>
            <form onSubmit={submitMessage} className="p-space-md flex gap-space-sm">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write a message..."
                className="flex-1 min-w-0 px-space-sm py-2 rounded-lg bg-surface-container-low outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" disabled={sending || !message.trim()} className="px-space-md rounded-lg bg-primary-container text-on-primary font-display text-label-md disabled:opacity-50">
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
            {error && <p className="px-space-md pb-space-md font-body-sm text-error">{error}</p>}
          </section>
        </div>
      )}
    </div>
  )
}
