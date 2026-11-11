import { ChevronLeft, Play, Lock, AlertCircle } from 'lucide-react'
import type { View } from '../../types'
import { studentService } from '../../services'

export function AssessmentDetailsView({
  goTo,
  assessmentId,
}: {
  goTo: (v: View) => void
  assessmentId: string
}) {
  const assessment =
    studentService.getAssessmentById(assessmentId) ||
    studentService.getAssessments()[0]

  if (!assessment) {
    return (
      <div className="page fade-in">
        <button
          className="btn-link"
          onClick={() => goTo('assessments')}
          style={{ marginBottom: '18px' }}
        >
          <ChevronLeft size={16} /> Back to Assessments
        </button>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <h3>Assessment Not Found</h3>
          <p style={{ marginTop: '8px' }}>The selected assessment is currently unavailable or has not been scheduled.</p>
        </div>
      </div>
    )
  }

  // start_date / end_date are database timestamps; show them in academy time (IST).
  const startMs = assessment.start_date ? new Date(assessment.start_date).getTime() : NaN
  const endMs = assessment.end_date ? new Date(assessment.end_date).getTime() : NaN
  const formatIst = (ms: number, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', ...options }).format(ms)
  const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true }
  // Questions are only served once the exam starts (migration 057), so the
  // test unlocks at the start time.
  const unlockMs = startMs

  const startDate = isNaN(startMs) ? 'Not Scheduled' : formatIst(startMs, dateOptions)
  const startTime = isNaN(startMs) ? 'Not Scheduled' : formatIst(startMs, timeOptions)
  const unlockTime = isNaN(startMs) ? 'the start time' : formatIst(unlockMs, timeOptions)

  // Opens at the scheduled start and closes at the window end.
  const now = Date.now()
  const isAccessible = !isNaN(startMs) && now >= unlockMs && (isNaN(endMs) || now < endMs)

  return (
    <div className="page fade-in">
      {/* Back to Assessments */}
      <button
        className="btn-link"
        onClick={() => goTo('assessments')}
        style={{ marginBottom: '18px' }}
      >
        <ChevronLeft size={16} /> Back to Assessments
      </button>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">
            {assessment.subject} · {assessment.type}
          </div>

          <h1>{assessment.title}</h1>

          <p className="page-copy">
            {assessment.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="note-viewer-layout">
        {/* Instructions */}
        <div className="content-card">
          <h3 style={{ marginBottom: '14px', fontSize: '18px', fontWeight: 700 }}>
            Assessment Instructions
          </h3>

          <ul
            style={{
              paddingLeft: '20px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              fontSize: '13.5px',
            }}
          >
            <li>
              This assessment contains{' '}
              <strong>{assessment.total_questions} questions</strong> with a strict time limit of{' '}
              <strong>{assessment.duration_minutes} minutes</strong>.
            </li>

            <li>
              <strong>Access Window:</strong> The <strong>"Start Test"</strong> button is strictly locked and will become active at the scheduled assessment start time.
            </li>

            <li>
              The authoritative timer is tracked on the server. Autosave is enabled across all selected answers.
            </li>

            <li>
              Do not close, minimize, or refresh the window during final submission.
            </li>

            <li>
              Each correct answer carries marks toward your placement readiness index.
            </li>
          </ul>

          {/* Important Notice Box */}
          <div
            style={{
              background: '#FDF8F0',
              border: '1px solid #EBD5BA',
              borderRadius: '10px',
              padding: '14px 16px',
              marginTop: '18px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              fontSize: '13px',
              color: 'var(--brand-black, #1B1C1E)',
            }}
          >
            <AlertCircle size={18} color="var(--brand-gold, #B18B5E)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Important Schedule Policy:</strong> Assessment access opens at <strong>{unlockTime}</strong> on <strong>{startDate}</strong>. The test cannot be started before this window.
            </div>
          </div>

          {/* Start Test Action Area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className={isAccessible ? 'btn-gold' : 'btn-outline'}
                disabled={!isAccessible}
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isAccessible ? 'pointer' : 'not-allowed',
                  opacity: isAccessible ? 1 : 0.65,
                  background: isAccessible ? 'var(--brand-gold, #B18B5E)' : '#E9E5DE',
                  color: isAccessible ? '#FFFFFF' : '#888888',
                  borderColor: isAccessible ? 'var(--brand-gold, #B18B5E)' : '#D6D0C5',
                }}
                onClick={() => {
                  if (!isAccessible) return
                  goTo(assessment.type === 'Coding' ? 'coding' : 'mcq')
                }}
              >
                {isAccessible ? <Play size={16} /> : <Lock size={16} />}
                Start Test
              </button>

              {/* Status Notice */}
              <span style={{ fontSize: '12.5px', color: isAccessible ? 'var(--status-success, #2E7D32)' : 'var(--text-muted)' }}>
                {isAccessible ? (
                  '✅ Test is active and ready to start.'
                ) : (
                  `🔒 Assessment opens at ${startTime} (${startDate})`
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Specs & Parameters */}
        <div className="content-card">
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
            Specs &amp; Parameters
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '13px',
            }}
          >
            {/* Duration */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Duration</span>
              <strong>{assessment.duration_minutes} Minutes</strong>
            </div>

            {/* Total Marks */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Total Marks</span>
              <strong>{assessment.max_marks} Marks</strong>
            </div>

            {/* Attempt Limit */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Attempt Limit</span>
              <strong>{assessment.attempts_allowed} Attempt</strong>
            </div>

            {/* Start Date */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Start Date</span>
              <strong>{startDate}</strong>
            </div>

            {/* Start Time */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Start Time</span>
              <strong>{startTime}</strong>
            </div>

            {/* Access Opens */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Access Opens</span>
              <strong style={{ color: 'var(--brand-gold, #B18B5E)' }}>{unlockTime}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const AssessmentDetailsPage = AssessmentDetailsView
export default AssessmentDetailsPage