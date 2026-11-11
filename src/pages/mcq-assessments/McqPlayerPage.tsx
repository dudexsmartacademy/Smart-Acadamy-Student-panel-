import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, ChevronRight, Clock3, Check } from 'lucide-react'
import type { McqQuestion, View } from '../../types'
import { studentService } from '../../services'
import type { McqSubmissionResult } from '../../services/studentService'

export function McqPlayerView({
  goTo,
  assessmentId,
}: {
  goTo: (v: View) => void
  assessmentId: string
}) {
  const assessment = studentService.getAssessmentById(assessmentId)
  const durationSec = (assessment?.duration_minutes || 30) * 60
  const [questions, setQuestions] = useState<McqQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [currentIdx, setCurrentIdx] = useState(0)
  // Start each new MCQ player session with no option pre-selected.
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [reviewFlags, setReviewFlags] = useState<Record<number, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(durationSec)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [scoreData, setScoreData] = useState<McqSubmissionResult | null>(null)
  const [autoSavedNotice, setAutoSavedNotice] = useState('Saved')
  const answersRef = useRef(selectedAnswers)
  answersRef.current = selectedAnswers

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')
    studentService
      .fetchAssessmentQuestions(assessmentId)
      .then((list) => {
        if (!cancelled) setQuestions(list)
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load questions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [assessmentId])

  const submitExam = async () => {
    if (submitting || scoreData) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await studentService.submitMcqAttempt(
        assessmentId,
        answersRef.current,
        durationSec - timeLeft
      )
      setScoreData(result)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (loading || questions.length === 0 || scoreData) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [loading, questions.length, scoreData])

  // Auto-submit when the timer runs out.
  useEffect(() => {
    if (timeLeft === 0 && questions.length > 0 && !scoreData) void submitExam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  const selectOption = (optIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optIdx })
    setAutoSavedNotice('Saved')
  }

  const toggleReview = () => {
    setReviewFlags((prev) => ({ ...prev, [currentIdx]: !prev[currentIdx] }))
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="page fade-in">
        <div className="content-card" style={{ maxWidth: '680px', margin: '40px auto', textAlign: 'center', padding: '40px 32px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading assessment…</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="page fade-in">
        <div
          className="content-card"
          style={{
            maxWidth: '680px',
            margin: '40px auto',
            textAlign: 'center',
            padding: '40px 32px',
          }}
        >
          <h2>No Questions Available</h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              marginTop: '8px',
              marginBottom: '20px',
            }}
          >
            {loadError || 'There are currently no active questions configured for this assessment.'}
          </p>
          <button className="btn-outline" onClick={() => goTo('assessments')}>
            Back to Assessments
          </button>
        </div>
      </div>
    )
  }

  const q = questions[currentIdx]

  if (scoreData) {
    return (
      <div className="page fade-in">
        <div
          className="content-card"
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '40px 32px',
          }}
        >
          <div
            className="brand-mark"
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              fontSize: '20px',
            }}
          >
            ✓
          </div>
          <div className="eyebrow">DudeX Smart Academy · Scorecard</div>
          <h2>{assessment?.title || 'Assessment'}</h2>

          <div className="result-main-score" style={{ margin: '24px 0' }}>
            <strong>
              {scoreData.score} / {scoreData.max_score}
            </strong>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--brand-black)',
              }}
            >
              {scoreData.percentage}% · Grade {scoreData.grade} · {scoreData.status}
            </span>
            <p
              style={{
                color:
                  scoreData.status === 'Passed'
                    ? 'var(--status-success)'
                    : 'var(--status-danger)',
                fontSize: '14px',
                fontWeight: 600,
                marginTop: '4px',
              }}
            >
              {scoreData.percentage >= 75
                ? 'Excellent Performance! Verified score recorded.'
                : scoreData.percentage >= 50
                ? 'Satisfactory Performance. Review learning notes to strengthen fundamentals.'
                : 'Needs Improvement. Please revise topic notes.'}
            </p>
          </div>

          <div
            className="result-summary-grid"
            style={{
              display: 'grid',
              gap: '12px',
              borderTop: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
              padding: '16px 0',
              margin: '24px 0',
            }}
          >
            <div>
              <small style={{ color: 'var(--text-muted)' }}>Correct</small>
              <strong
                style={{
                  display: 'block',
                  fontSize: '16px',
                  color: 'var(--status-success)',
                }}
              >
                {scoreData.correct}
              </strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)' }}>Wrong</small>
              <strong
                style={{
                  display: 'block',
                  fontSize: '16px',
                  color: 'var(--status-danger)',
                }}
              >
                {scoreData.wrong}
              </strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)' }}>Unanswered</small>
              <strong style={{ display: 'block', fontSize: '16px' }}>
                {scoreData.unanswered}
              </strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)' }}>Time Used</small>
              <strong style={{ display: 'block', fontSize: '16px' }}>
                {scoreData.time_used}
              </strong>
            </div>
          </div>

          <button className="btn-primary" onClick={() => goTo('results')}>
            View All Results <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      {/* Top Exam Header */}
      <div className="mcq-timer-header">
        <div>
          <div className="eyebrow">Server Timed Exam</div>
          <h2 style={{ fontSize: '20px' }}>{assessment?.title || 'Assessment'}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="autosave-status">
            <CheckCircle2 size={14} /> {autoSavedNotice}
          </div>
          <div className={`mcq-timer-badge ${timeLeft < 300 ? 'warning' : ''} ${timeLeft < 60 ? 'critical' : ''}`}>
            <Clock3 size={16} />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="mcq-container">
        {/* Center: Question & Options */}
        <div className="mcq-question-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <button className="btn-link" onClick={toggleReview}>
              {reviewFlags[currentIdx] ? '★ Marked for Review' : '☆ Mark for Review'}
            </button>
          </div>

          <h2>{q.question}</h2>

          {q.codeSnippet && (
            <pre className="code-snippet-box">
              <code>{q.codeSnippet}</code>
            </pre>
          )}

          <div className="mcq-options-list">
            {q.options.map((opt, optIdx) => (
              <button
                key={opt.label}
                className={`mcq-option-item ${selectedAnswers[currentIdx] === optIdx ? 'selected' : ''}`}
                onClick={() => selectOption(optIdx)}
              >
                <span className="option-key">{opt.label}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>

          <div className="mcq-actions-bar">
            <button
              className="btn-outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button className="btn-primary" onClick={() => setCurrentIdx((p) => p + 1)}>
                Next Question <ChevronRight size={15} />
              </button>
            ) : (
              <button className="btn-gold" disabled={submitting} onClick={() => void submitExam()}>
                {submitting ? 'Submitting…' : 'Submit Exam'} <Check size={16} />
              </button>
            )}
          </div>
          {submitError && (
            <p role="alert" style={{ color: 'var(--status-danger)', fontSize: '13px', marginTop: '12px' }}>
              {submitError}
            </p>
          )}
        </div>

        {/* Right: Question Navigator */}
        <div className="question-navigator">
          <h3>Question Navigator</h3>
          <div className="navigator-grid">
            {questions.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined
              const isCurrent = idx === currentIdx
              const isReview = reviewFlags[idx]
              return (
                <button
                  key={idx}
                  className={`nav-q-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isReview ? 'review' : ''}`}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="navigator-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--brand-black)' }} /> Current
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--status-success)' }} /> Answered
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: 'var(--gold-primary)' }} /> Marked for Review
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const McqPlayerPage = McqPlayerView
export default McqPlayerPage
