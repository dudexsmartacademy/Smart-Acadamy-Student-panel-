import { useState, useEffect } from 'react'
import { Zap, Code2, Check } from 'lucide-react'
import type { View, CodingProblem } from '../../types'
import { codingJudgeService, studentService } from '../../services'

export function CodingChallengeView({ goTo }: { goTo: (v: View) => void }) {
  const [problem, setProblem] = useState<CodingProblem>(() => codingJudgeService.getCodingProblem())
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<string>('Python')
  const [code, setCode] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [runResult, setRunResult] = useState<string | null>(null)

  useEffect(() => {
    studentService.fetchCodingProblemsAsync().then((problems) => {
      if (problems && problems.length > 0) {
        setProblem(problems[0])
        setCode(problems[0].starter_code ? problems[0].starter_code['Python'] || '' : '')
      } else {
        const fallback = codingJudgeService.getCodingProblem()
        setProblem(fallback)
        setCode(fallback.starter_code ? fallback.starter_code['Python'] || '' : '')
      }
      setLoading(false)
    })
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    setCode(problem.starter_code ? problem.starter_code[lang] || '' : '')
  }

  const runCodeSandbox = () => {
    setRunning(true)
    setRunResult(null)
    setTimeout(() => {
      setRunning(false)
      const res = codingJudgeService.runCode(code, language, '')
      setRunResult(`${res.output} Status: ${res.status}`)
    }, 800)
  }

  const resetCode = () => {
    setCode(problem.starter_code ? problem.starter_code[language] || '' : '')
    setRunResult(null)
    setRunning(false)
  }

  const handleSubmitSolution = async () => {
    setSubmitting(true)
    try {
      const res = codingJudgeService.runCode(code, language, '')
      const passed = res.status === 'Passed'

      await studentService.submitAssessmentResult({
        assessment_title: problem.title || 'Coding Challenge',
        type: 'Coding',
        subject: problem.category || 'Algorithms',
        score: passed ? (problem.points || 100) : 0,
        max_score: problem.points || 100,
        percentage: passed ? 100 : 0,
        grade: passed ? 'A+' : 'C',
        status: passed ? 'Passed' : 'Needs Review',
        correct_count: passed ? 1 : 0,
        wrong_count: passed ? 0 : 1,
        time_used: '12:45',
        feedback: `Language: ${language}. Result: ${res.status}`,
      })

      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading coding challenge specification from Supabase...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="page fade-in">
        <div className="content-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '40px 32px' }}>
          <div className="brand-mark" style={{ width: '48px', height: '48px', margin: '0 auto 16px', fontSize: '20px' }}>
            ✓
          </div>
          <div className="eyebrow">DudeX Smart Academy · Solution Evaluated</div>
          <h2>Coding Submission Recorded</h2>

          <div className="result-main-score" style={{ margin: '24px 0' }}>
            <p style={{ color: 'var(--status-success)', fontSize: '15px', fontWeight: 600 }}>
              Your solution code and evaluation score have been synchronized with the Teacher & Admin panels via Supabase Cloud.
            </p>
          </div>

          <button className="btn-primary" onClick={() => goTo('results')}>
            View Dashboard Results
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Algorithmic IDE · {problem.difficulty || 'Medium'}</div>
          <h1>{problem.title}</h1>
          <p className="page-copy">Solve within constraints. Hidden test cases protected against tampering.</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={() => goTo('assessments')}>
            Exit Challenge
          </button>
        </div>
      </div>

      <div className="coding-ide-grid">
        {/* Left: Problem Specs */}
        <div className="problem-specs-panel">
          <h3>Problem Statement</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '13.5px' }}>
            {problem.description}
          </p>

          <h4 style={{ margin: '18px 0 6px', fontSize: '13px' }}>Input Format</h4>
          <pre style={{ background: 'var(--cream-bg)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
            {problem.input_format}
          </pre>

          <h4 style={{ margin: '18px 0 6px', fontSize: '13px' }}>Output Format</h4>
          <pre style={{ background: 'var(--cream-bg)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
            {problem.output_format}
          </pre>

          {problem.examples && problem.examples.length > 0 && (
            <>
              <h4 style={{ margin: '18px 0 6px', fontSize: '13px' }}>Examples</h4>
              {problem.examples.map((ex, i) => (
                <div key={i} style={{ background: 'var(--cream-bg)', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px' }}>
                  <div><strong>Input:</strong> {ex.input}</div>
                  <div><strong>Output:</strong> {ex.output}</div>
                  {ex.explanation && <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{ex.explanation}</div>}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right: Monaco-Style Dark Editor */}
        <div className="editor-wrapper">
          <div className="editor-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={16} color="var(--gold-light)" />
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
                <option>Python</option>
                <option>JavaScript</option>
                <option>Java</option>
                <option>C++</option>
                <option>C</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-reset-white"
                onClick={resetCode}
                disabled={running || submitting}
                style={{
                  minWidth: '78px',
                  height: '34px',
                  padding: '0 12px',
                  justifyContent: 'center',
                  background: '#ffffff',
                  color: '#2b2926',
                  border: '1px solid #d8d0c5',
                  boxShadow: 'none',
                  opacity: running || submitting ? 0.55 : 1,
                  cursor: running || submitting ? 'not-allowed' : 'pointer',
                }}
              >
                Reset
              </button>
              <button className="btn-gold" onClick={runCodeSandbox} disabled={running || submitting}>
                {running ? 'Evaluating...' : 'Run Code'} <Zap size={14} />
              </button>
              <button className="btn-primary" onClick={handleSubmitSolution} disabled={submitting}>
                {submitting ? 'Submitting to Supabase...' : 'Submit Solution'} <Check size={15} />
              </button>
            </div>
          </div>

          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />

          <div className="editor-testcases-panel">
            <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--gold-light)' }}>
              Execution Output & Sandbox Verification:
            </strong>
            <div style={{ fontSize: '12.5px', color: '#B5B0A8', fontFamily: 'var(--font-mono)' }}>
              {running ? 'Executing in isolated sandbox container...' : runResult || 'Click "Run Code" to evaluate against test cases.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const CodingPage = CodingChallengeView
export default CodingPage
