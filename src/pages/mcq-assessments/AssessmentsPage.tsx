import { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  ArrowUpRight,
  Clock3,
  Zap,
} from 'lucide-react'
import type { Assessment, View } from '../../types'
import { studentService } from '../../services'
import { STUDENT_DATA_SYNCED_EVENT, syncStudentData } from '../../services/studentService'

const formatDateTime = (iso: string) => {
  const d = iso ? new Date(iso) : null
  if (!d || Number.isNaN(d.getTime())) return { date: 'Not Scheduled', time: 'Not Scheduled' }
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
}

// Every assessment published for the student's class (MCQ, coding, and
// external HackerRank challenges) is listed from Supabase.
export function AssessmentsView({
  goTo,
  setSelectedAssessmentId,
}: {
  goTo: (v: View) => void
  setSelectedAssessmentId: (id: string) => void
}) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const handleSync = () => setTick((v) => v + 1)
    window.addEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    syncStudentData().catch(() => {})
    return () => {
      window.removeEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    }
  }, [])

  const assessments = studentService.getAssessments()

  const open = (a: Assessment) => {
    setSelectedAssessmentId(a.assessment_id)
    goTo(a.provider === 'hackerrank' ? 'hackerrank' : 'assessment-details')
  }

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
        {assessments.length === 0 && (
          <div
            className="content-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '36px 20px',
              color: 'var(--text-muted)',
            }}
          >
            <ClipboardCheck size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>No Scheduled Assessments</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Tests will appear here when your faculty publishes them for your class.
            </p>
          </div>
        )}

        {assessments.map((a) => {
          const isExternal = a.provider === 'hackerrank'
          const when = formatDateTime(a.start_date)
          const attemptsLeft =
            a.attempts_allowed !== null ? Math.max(0, a.attempts_allowed - (a.attempts_used || 0)) : null
          const done = a.status === 'Completed' || (attemptsLeft !== null && attemptsLeft === 0)
          return (
            <div
              key={a.assessment_id}
              className="content-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: isExternal ? '#FFFDF9' : undefined,
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
                  {a.type === 'Mixed' ? 'Coding + MCQ' : a.type}
                </span>

                <span
                  style={{
                    fontSize: '12px',
                    color: isExternal ? 'var(--gold-dark)' : 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {isExternal ? 'HackerRank' : a.status}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '17px',
                  marginBottom: '6px',
                }}
              >
                {a.title}
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
                {a.description || (a.subject ? `Subject: ${a.subject}` : '')}
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
                  <strong>Start Date:</strong> {when.date}
                </span>

                <span>
                  <strong>Start Time:</strong> {when.time}
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
                {a.duration_minutes !== null && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock3 size={13} />
                    {a.duration_minutes} Mins
                  </span>
                )}

                {a.max_marks !== null && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ClipboardCheck size={13} />
                    {a.max_marks} Marks
                  </span>
                )}

                {attemptsLeft !== null && !isExternal && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={13} />
                    {attemptsLeft} of {a.attempts_allowed} Attempt{a.attempts_allowed === 1 ? '' : 's'} Left
                  </span>
                )}

                {a.percentage !== undefined && (
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    Score: {a.percentage}%{a.grade ? ` · ${a.grade}` : ''}
                  </span>
                )}
              </div>

              <button
                className={isExternal ? 'btn-gold' : 'btn-primary'}
                disabled={!isExternal && done}
                onClick={() => open(a)}
              >
                {isExternal ? 'View Instructions' : done ? 'Completed' : 'Start'}
                <ArrowUpRight size={15} />
              </button>
            </div>
          )
        })}
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
