import { useState, useEffect } from 'react'
import { ResponsiveSelect } from '../../components/CustomSelect'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

interface StudentTicket {
  id: string
  query_code?: string
  category?: string
  subject?: string
  description?: string
  status?: string
  admin_response?: string
  created_at: string
}

export function HelpView() {
  const { session, profile } = useAuth()
  const [ticketSent, setTicketSent] = useState(false)
  const [issueCategory, setIssueCategory] = useState('Technical Platform Issue')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [tickets, setTickets] = useState<StudentTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)

  const loadTickets = async () => {
    if (!session?.user?.id) return
    setLoadingTickets(true)
    try {
      const { data, error } = await supabase
        .from('student_queries')
        .select('*')
        .eq('student_id', session.user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setTickets(data as StudentTicket[])
      }
    } catch (err) {
      console.warn('Failed to load student queries:', err)
    } finally {
      setLoadingTickets(false)
    }
  }

  useEffect(() => {
    void loadTickets()
  }, [session?.user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) {
      setErrorMsg('You must be signed in to submit a support request.')
      return
    }
    if (!description.trim()) {
      setErrorMsg('Please describe your issue.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const category = issueCategory || 'Technical Platform Issue'
      const studentName = profile.full_name || session.user.user_metadata?.full_name || 'Student'
      const studentEmail = profile.personal_email || profile.college_email || session.user.email || ''
      const batchName = profile.batch || ''

      const { error } = await supabase.from('student_queries').insert({
        student_id: session.user.id,
        student_name: studentName,
        student_email: studentEmail,
        batch_name: batchName,
        category,
        subject: category,
        description: description.trim(),
        message: description.trim(),
        status: 'open',
      })

      if (error) {
        setErrorMsg(`Failed to submit: ${error.message}`)
      } else {
        setTicketSent(true)
        setDescription('')
        await loadTickets()
        setTimeout(() => setTicketSent(false), 5000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed'
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Support Hub</div>
          <h1>Help & Support</h1>
          <p className="page-copy">Resolve technical issues, attendance corrections, and test queries.</p>
        </div>
      </div>

      <div className="note-viewer-layout">
        <div className="content-card">
          <h3 style={{ marginBottom: '16px' }}>Frequently Asked Questions</h3>
          {[
            'How do I join my live online placement session?',
            'What happens if my connection drops during an MCQ exam?',
            'How long does an attendance correction review take?',
            'Can I re-attempt a completed coding challenge?',
          ].map((q, idx) => (
            <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid var(--cream-secondary)', fontSize: '13.5px' }}>
              <strong>{q}</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                All live sessions provide a Google Meet button in your Dashboard hero. Answers autosave in real time.
              </p>
            </div>
          ))}
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '16px' }}>Report an Issue</h3>
          {ticketSent ? (
            <div style={{ color: 'var(--status-success)', fontSize: '13px', padding: '12px 0' }}>
              ✓ Support ticket created successfully. An advisor will respond within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{ color: 'var(--status-danger, #dc2626)', fontSize: '12.5px', marginBottom: '12px' }}>
                  {errorMsg}
                </div>
              )}
              <div className="form-group">
                <label>Issue Category</label>
                <ResponsiveSelect
                  value={issueCategory}
                  onChange={setIssueCategory}
                  options={[
                    'Live Class Issue',
                    'Exam / Assessment Issue',
                    'Attendance Discrepancy',
                    'Notes / PDF Viewer Issue',
                    'Technical Platform Issue',
                  ]}
                />
                <input
                  type="hidden"
                  name="issueCategory"
                  value={issueCategory}
                  required
                  onChange={() => {}}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the problem in detail..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Sending Request...' : 'Send to Support Team'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Submitted Support Tickets */}
      <div className="content-card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Your Support Tickets ({tickets.length})</h3>
        {loadingTickets ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>You haven't submitted any support requests yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tickets.map((t) => {
              const status = (t.status || 'open').toLowerCase()
              const isResolved = status === 'resolved' || status === 'closed'
              return (
                <div
                  key={t.id}
                  style={{
                    border: '1px solid var(--cream-secondary)',
                    borderRadius: '8px',
                    padding: '14px',
                    background: 'var(--cream-bg, #fcfbf9)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {t.category || t.subject || 'Support Ticket'}
                      {t.query_code && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 400 }}>
                          [{t.query_code}]
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: isResolved ? '#dcfce7' : status === 'in_progress' ? '#fef3c7' : '#e0f2fe',
                        color: isResolved ? '#15803d' : status === 'in_progress' ? '#b45309' : '#0369a1',
                      }}
                    >
                      {t.status || 'open'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-main, #374151)', margin: '4px 0' }}>
                    {t.description}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Submitted on {new Date(t.created_at).toLocaleDateString()} at {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Admin Reply */}
                  {t.admin_response && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: '#f0fdf4',
                        borderLeft: '3px solid #22c55e',
                      }}
                    >
                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#166534' }}>
                        Admin Response:
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#14532d', marginTop: '2px' }}>
                        {t.admin_response}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export const HelpPage = HelpView
export default HelpPage
