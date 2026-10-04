import { useState } from 'react'
import { Zap, Code2 } from 'lucide-react'
import type { View } from '../../types'
import { codingJudgeService } from '../../services'

export function CodingChallengeView({ goTo }: { goTo: (v: View) => void }) {
  const problem = codingJudgeService.getCodingProblem()
  const [language, setLanguage] = useState<string>('Python')
  const [code, setCode] = useState(() => (problem.starter_code ? problem.starter_code['Python'] || '' : ''))
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<string | null>(null)

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
              <button className="btn-primary" onClick={() => alert('Code submitted successfully!')}>
                Submit Solution
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
