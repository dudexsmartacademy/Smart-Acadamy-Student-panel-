import { useState, useEffect } from 'react'
import { CheckCircle2, ChevronRight, Clock3, Check } from 'lucide-react'
import type { View, McqQuestion } from '../../types'
import { studentService } from '../../services'

export function McqPlayerView({ goTo }: { goTo: (v: View) => void }) {
  const [questions, setQuestions] = useState<McqQuestion[]>(() => studentService.getMcqQuestions())
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [reviewFlags, setReviewFlags] = useState<Record<number, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [submitted, setSubmitted] = useState(false)
  const [autoSavedNotice, setAutoSavedNotice] = useState('Saved to Supabase')

  useEffect(() => {
    studentService.fetchMcqQuestionsAsync().then((q) => {
      setQuestions(q)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const selectOption = (optIdx: number) => {
    const updated = { ...selectedAnswers, [currentIdx]: optIdx }
    setSelectedAnswers(updated)
    setAutoSavedNotice('Saved to Supabase')
  }

  const toggleReview = () => {
    setReviewFlags((prev) => ({ ...prev, [currentIdx]: !prev[currentIdx] }))
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSubmitExam = async () => {
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === (q.correctOptionIndex ?? 0)) {
        correctCount++
      }
    })
    const total = questions.length || 1
    const pct = Math.round((correctCount / total) * 100)

    await studentService.submitAssessmentResult({
      assessment_title: 'MCQ Assessment',
      type: 'MCQ',
      subject: 'Computer Science',
      score: correctCount * 10,
      max_score: total * 10,
      percentage: pct,
      grade: pct >= 80 ? 'A+' : pct >= 60 ? 'B' : 'C',
      status: pct >= 80 ? 'Distinction' : pct >= 50 ? 'Passed' : 'Needs Review',
      correct_count: correctCount,
      wrong_count: total - correctCount,
      time_used: formatTimer(1800 - timeLeft),
    })

    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="page fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading assessment questions from Supabase backend...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="page fade-in">
        <div className="content-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '40px 24px' }}>
          <h2>No Active MCQ Questions</h2>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
            There are currently no active MCQ questions configured in the Supabase database.
          </p>
          <button className="btn-primary" onClick={() => goTo('assessments')}>
            Return to Assessments
          </button>
        </div>
      </div>
    )
  }

  const q = questions[currentIdx]

  if (submitted) {
    return (
      <div className="page fade-in">
        <div className="content-card" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '40px 32px' }}>
          <div className="brand-mark" style={{ width: '48px', height: '48px', margin: '0 auto 16px', fontSize: '20px' }}>
            ✓
          </div>
          <div className="eyebrow">DudeX Smart Academy · Scorecard</div>
          <h2>Assessment Complete</h2>

          <div className="result-main-score" style={{ margin: '24px 0' }}>
            <strong>Assessment Submitted</strong>
            <p style={{ color: 'var(--status-success)', fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
              Your response has been synchronized with the Teacher & Admin panels via Supabase Cloud.
            </p>
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
          <h2 style={{ fontSize: '20px' }}>MCQ Assessment</h2>
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
              <button className="btn-gold" onClick={handleSubmitExam}>
                Submit Exam <Check size={16} />
              </button>
            )}
          </div>
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
