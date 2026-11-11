import { useEffect, useState } from 'react'
import { Zap, Code2 } from 'lucide-react'
import type { CodingProblem, View } from '../../types'
import { studentService, codingJudgeService } from '../../services'

// Starter code is keyed by the language name stored in the database
// (e.g. "javascript"); match it case-insensitively against the picker label.
const starterFor = (problem: CodingProblem | undefined, lang: string) => {
  if (!problem) return ''
  const key = Object.keys(problem.starter_code).find((k) => k.toLowerCase() === lang.toLowerCase())
  return key ? problem.starter_code[key] : ''
}

export function CodingChallengeView({
  goTo,
  assessmentId,
}: {
  goTo: (v: View) => void
  assessmentId?: string
}) {
  const [problem, setProblem] = useState<CodingProblem | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<string>('Python')
  const [code, setCode] = useState('')
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [runResult, setRunResult] = useState<string | null>(null)

  // Load the coding problem for the selected assessment from the student-safe
  // view (public examples only; hidden tests stay on the server).
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    studentService
      .fetchCodingProblems(assessmentId || undefined)
      .then((list) => {
        if (cancelled) return
        const first = list[0]
        setProblem(first)
        const lang = first ? Object.keys(first.starter_code)[0] : undefined
        if (lang) {
          const label = lang.charAt(0).toUpperCase() + lang.slice(1)
          setLanguage(label === 'Javascript' ? 'JavaScript' : label)
          setCode(first?.starter_code[lang] || '')
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setRunResult(err instanceof Error ? err.message : 'Could not load the coding problem.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [assessmentId])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    setCode(starterFor(problem, lang))
  }

  const runCodeSandbox = () => {
    if (!problem) return
    setRunning(true)
    setRunResult(null)
    const result = codingJudgeService.runCode(code, language)
    setRunResult(result.output)
    setRunning(false)
  }

  const resetCode = () => {
    setCode(starterFor(problem, language))
    setRunResult(null)
    setRunning(false)
  }

  if (loading) {
    return (
      <div className="page fade-in">
        <div className="content-card" style={{ maxWidth: '680px', margin: '40px auto', textAlign: 'center', padding: '40px 32px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading coding challenge…</p>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="page fade-in">
        <div className="content-card" style={{ maxWidth: '680px', margin: '40px auto', textAlign: 'center', padding: '40px 32px' }}>
          <h2>No Coding Challenges Available</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '20px' }}>
            No coding challenges are currently available from the academy database.
          </p>
          <button className="btn-outline" onClick={() => goTo('assessments')}>
            Back to Assessments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Algorithmic IDE · Medium</div>
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

          <h4 style={{ margin: '18px 0 6px', fontSize: '13px' }}>Examples</h4>
          {problem.examples.map((ex, i) => (
            <div key={i} style={{ background: 'var(--cream-bg)', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px' }}>
              <div><strong>Input:</strong> {ex.input}</div>
              <div><strong>Output:</strong> {ex.output}</div>
              {ex.explanation && <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{ex.explanation}</div>}
            </div>
          ))}
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
                disabled={running}
                style={{
                  minWidth: '78px',
                  height: '34px',
                  padding: '0 12px',
                  justifyContent: 'center',
                  background: '#ffffff',
                  color: '#2b2926',
                  border: '1px solid #d8d0c5',
                  boxShadow: 'none',
                  opacity: running ? 0.55 : 1,
                  cursor: running ? 'not-allowed' : 'pointer',
                }}
              >
                Reset
              </button>
              <button className="btn-gold" onClick={runCodeSandbox} disabled={running}>
                {running ? 'Evaluating...' : 'Run Code'} <Zap size={14} />
              </button>
              <button
                className="btn-primary"
                disabled={submitting || !code.trim()}
                onClick={async () => {
                  setSubmitting(true)
                  try {
                    await studentService.submitCode(problem.problem_id, assessmentId || null, language, code)
                    setRunResult('Solution submitted. Your teacher will evaluate it and publish the result.')
                  } catch (err) {
                    setRunResult(err instanceof Error ? err.message : 'Submission failed. Please try again.')
                  } finally {
                    setSubmitting(false)
                  }
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Solution'}
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
