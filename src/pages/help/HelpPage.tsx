import { useState } from 'react'
import { ResponsiveSelect } from '../../components/CustomSelect'

export function HelpView() {
  const [ticketSent, setTicketSent] = useState(false)
  const [issueCategory, setIssueCategory] = useState('')

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
            <div style={{ color: 'var(--status-success)', fontSize: '13px' }}>
              ✓ Support ticket created. An advisor will respond within 24 hours.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setTicketSent(true) }}>
              <div className="form-group">
                <label>Issue Category</label>
                <ResponsiveSelect
                  value={issueCategory}
                  onChange={setIssueCategory}
                  options={[
                    'Live Class Issue',
                    ' / Exam Issue',
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
                <textarea rows={3} placeholder="Explain the problem..." required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Send to Support Team
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export const HelpPage = HelpView
export default HelpPage
