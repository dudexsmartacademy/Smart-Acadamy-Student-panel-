import {
  ClipboardCheck,
  ArrowUpRight,
  Clock3,
  Zap,
} from 'lucide-react'
import type { View } from '../../types'
import { studentService } from '../../services'

/*
 * HackerRank assignment schedule.
 * Change these values when the actual assignment
 * schedule is finalized.
 */
const HACKERRANK_START_DATE = '10 Sep 2026'
const HACKERRANK_START_TIME = '09:00 AM'

export function AssessmentsView({
  goTo,
  setSelectedAssessmentId,
}: {
  goTo: (v: View) => void
  setSelectedAssessmentId: (id: string) => void
}) {
  const assessments = studentService.getAssessments()

  const mcq = assessments.find(
    (assessment) => assessment.type === 'MCQ'
  )

  return (
    <div className="page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">
            Assessment Hub
          </div>

          <h1>
            Assessments &amp; Practice
          </h1>

          <p className="page-copy">
            Placement screening tests, server-timed MCQs,
            and coding assessments.
          </p>
        </div>
      </div>

      {/* Assessment Cards */}
      <div
        className="notes-card-grid"
        style={{
          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'stretch',
        }}
      >

        {/* =========================
            MCQ CARD
           ========================= */}
        {mcq && (
          <div
            key={mcq.assessment_id}
            className="content-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span
                className="attachment-badge"
                style={{
                  background: 'var(--brand-black)',
                  color: '#FFF',
                }}
              >
                MCQ
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '17px',
                marginBottom: '6px',
              }}
            >
              {mcq.title}
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
                flex: 1,
              }}
            >
              {mcq.description}
            </p>

            {/* Start Date + Start Time */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '16px',
              }}
            >
              <span>
                <strong>Start Date:</strong>{' '}
                {mcq.start_date?.split(' · ')[0] ||
                  'Not Scheduled'}
              </span>

              <span>
                <strong>Start Time:</strong>{' '}
                {mcq.start_date?.split(' · ')[1] ||
                  'Not Scheduled'}
              </span>
            </div>

            {/* Assessment Metadata */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '16px',
                borderTop:
                  '1px solid var(--cream-secondary)',
                paddingTop: '12px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Clock3 size={13} />
                {mcq.duration_minutes} Mins
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ClipboardCheck size={13} />
                {mcq.max_marks} Marks
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Zap size={13} />
                {mcq.attempts_allowed} Attempt Allowed
              </span>
            </div>

            {/* Start Button */}
            <button
              className="btn-primary"
              onClick={() => {
                setSelectedAssessmentId(
                  mcq.assessment_id
                )

                goTo('assessment-details')
              }}
            >
              Start
              <ArrowUpRight size={15} />
            </button>
          </div>
        )}

        {/* =========================
            HACKERRANK CARD
           ========================= */}
        <div
          className="content-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#FFFDF9',
          }}
        >
          {/* Badge + Provider */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <span
              className="attachment-badge"
              style={{
                background: 'var(--brand-black)',
                color: '#FFF',
              }}
            >
              Coding
            </span>

            <span
              style={{
                fontSize: '12px',
                color: 'var(--gold-dark)',
                fontWeight: 600,
              }}
            >
              HackerRank
            </span>
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '17px',
              marginBottom: '6px',
            }}
          >
            HackerRank Coding Challenge
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              flex: 1,
            }}
          >
            Complete the coding assessment on HackerRank
            within the given time limit.
          </p>

          {/* Start Date + Start Time */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}
          >
            <span>
              <strong>Start Date:</strong>{' '}
              {HACKERRANK_START_DATE}
            </span>

            <span>
              <strong>Start Time:</strong>{' '}
              {HACKERRANK_START_TIME}
            </span>
          </div>

          {/* Assessment Metadata */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '16px',
              borderTop:
                '1px solid var(--cream-secondary)',
              paddingTop: '12px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock3 size={13} />
              45 Mins
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ClipboardCheck size={13} />
              100 Marks
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={13} />
              1 Attempt Only
            </span>
          </div>

          {/* Instructions Button */}
          <button
            className="btn-gold"
            onClick={() => goTo('hackerrank')}
          >
            View Instructions
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

/*
 * Keep both named and default exports.
 *
 * Your current index.ts is expecting a default export,
 * so this prevents the Vite error:
 *
 * "does not provide an export named 'default'"
 */
export const AssessmentsPage = AssessmentsView

export default AssessmentsPage