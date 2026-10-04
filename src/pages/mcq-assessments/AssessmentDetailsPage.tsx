import { ChevronLeft, Play } from 'lucide-react'
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

  // The existing assessment data stores the schedule as:
  // "08 Sep 2026 · 09:00 AM"
  const startDate = assessment.start_date?.split(' · ')[0] || 'Not Scheduled'
  const startTime = assessment.start_date?.split(' · ')[1] || 'Not Scheduled'

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
          <h3 style={{ marginBottom: '14px' }}>
            Instructions
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
              <strong>
                {assessment.total_questions} questions
              </strong>{' '}
              with a strict time limit of{' '}
              <strong>
                {assessment.duration_minutes} minutes
              </strong>
              .
            </li>

            <li>
              The authoritative timer is tracked on the server.
              Autosave is enabled across all selected answers.
            </li>

            <li>
              Do not close or refresh the window during final
              submission.
            </li>

            <li>
              Each correct answer carries marks toward your
              placement readiness index.
            </li>
          </ul>

          {/* Begin Assessment */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginTop: '28px',
            }}
          >
            <button
              className="btn-gold"
              style={{
                padding: '12px 28px',
                fontSize: '15px',
              }}
              onClick={() =>
                goTo(
                  assessment.type === 'Coding'
                    ? 'coding'
                    : 'mcq',
                )
              }
            >
              <Play size={16} /> Begin Now
            </button>
          </div>
        </div>

        {/* Specs & Parameters */}
        <div className="content-card">
          <h3 style={{ marginBottom: '16px' }}>
            Specs & Parameters
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
                borderBottom:
                  '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                Duration
              </span>

              <strong>
                {assessment.duration_minutes} Minutes
              </strong>
            </div>

            {/* Total Marks */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom:
                  '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                Total Marks
              </span>

              <strong>
                {assessment.max_marks} Marks
              </strong>
            </div>

            {/* Attempt Limit */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom:
                  '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                Attempt Limit
              </span>

              <strong>
                {assessment.attempts_allowed} Attempt
              </strong>
            </div>

            {/* Start Date */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom:
                  '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                Start Date
              </span>

              <strong>
                {startDate}
              </strong>
            </div>

            {/* Start Time */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom:
                  '1px solid var(--cream-secondary)',
                paddingBottom: '8px',
              }}
            >
              <span
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                Start Time
              </span>

              <strong>
                {startTime}
              </strong>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export const AssessmentDetailsPage = AssessmentDetailsView

export default AssessmentDetailsPage