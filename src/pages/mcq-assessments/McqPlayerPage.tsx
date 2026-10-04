import { useState, useEffect } from 'react'
import { CheckCircle2, ChevronRight, Clock3, Check } from 'lucide-react'
import type { View } from '../../types'
import { studentService } from '../../services'

export function McqPlayerView({ goTo }: { goTo: (v: View) => void }) {
  const questions = studentService.getMcqQuestions()
  const [currentIdx, setCurrentIdx] = useState(0)
  // Start each new MCQ player session with no option pre-selected.
  // Previous browser-stored answers must never appear as selected when the test opens.
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [reviewFlags, setReviewFlags] = useState<Record<number, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(1122) // 18m 42s
  const [submitted, setSubmitted] = useState(false)
  const [autoSavedNotice, setAutoSavedNotice] = useState('Saved')

  useEffect(() => {
    // Remove answers from any previous browser session so the student starts clean.
    localStorage.removeItem('dudex_mcq_answers')
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
    localStorage.setItem('dudex_mcq_answers', JSON.stringify(updated))
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

  const q = questions[currentIdx]

  if (submitted) {
    return (
      <div className="page fade-in">
        <div className="content-card" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '40px 32px' }}>
          <div className="brand-mark" style={{ width: '48px', height: '48px', margin: '0 auto 16px', fontSize: '20px' }}>
            ✓
          </div>
          <div className="eyebrow">DudeX Smart Academy · Scorecard</div>
          <h2>Python Fundamentals & OOP</h2>
          
          <div className="result-main-score" style={{ margin: '24px 0' }}>
            <strong>18 / 20</strong>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand-black)' }}>90% · Grade A+</span>
            <p style={{ color: 'var(--status-success)', fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
              Excellent Performance! Qualified for Placement Round 2.
            </p>
          </div>

          <div className="result-summary-grid" style={{ display: 'grid', gap: '12px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0', margin: '24px 0' }}>
            <div>
              <small style={{ color: 'var(--text-muted)' }}>Correct</small>
              <strong style={{ display: 'block', fontSize: '16px', color: 'var(--status-success)' }}>18</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)' }}>Wrong</small>
              <strong style={{ display: 'block', fontSize: '16px', color: 'var(--status-danger)' }}>2</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)' }}>Unanswered</small>
              <strong style={{ display: 'block', fontSize: '16px' }}>0</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)' }}>Time Used</small>
              <strong style={{ display: 'block', fontSize: '16px' }}>17:24</strong>
            </div>
          </div>

          <button className="btn-primary" onClick={() => goTo('results')}>
            View All  Results <ChevronRight size={16} />
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
          <h2 style={{ fontSize: '20px' }}>Python Fundamentals MCQ</h2>
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
              <button className="btn-gold" onClick={() => setSubmitted(true)}>
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
