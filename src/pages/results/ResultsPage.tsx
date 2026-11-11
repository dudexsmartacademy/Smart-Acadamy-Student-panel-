import { useState, useEffect } from 'react'
import { studentService, STUDENT_DATA_SYNCED_EVENT } from '../../services'
import type { ResultRecord } from '../../types'

export function ResultsView() {
  const [results, setResults] = useState<ResultRecord[]>(() => studentService.getResults())

  useEffect(() => {
    setResults([...studentService.getResults()])
    void studentService.syncStudentData()

    const handleSync = () => {
      setResults([...studentService.getResults()])
    }
    window.addEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    window.addEventListener('dudex_results_changed', handleSync)

    return () => {
      window.removeEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
      window.removeEventListener('dudex_results_changed', handleSync)
    }
  }, [])

  const totalEvaluations = results.length
  const avgPercentage =
    totalEvaluations > 0
      ? Math.round(
          results.reduce((acc, r) => acc + r.percentage, 0) / totalEvaluations
        )
      : 0
  const highestResult =
    results.length > 0
      ? results.reduce(
          (max, r) => (r.percentage > max.percentage ? r : max),
          results[0]
        )
      : null

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academic Records</div>
          <h1>Results</h1>
          <p className="page-copy">Final scorecards, percentage benchmarks, and faculty remarks.</p>
        </div>
      </div>

      <section className="result-highlight-card results-highlight-grid">
        <div className="result-main-score">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cohort Placement Index</span>
          <strong>{totalEvaluations > 0 ? `${avgPercentage}%` : '—'}</strong>
          <span style={{ fontSize: '13px', color: 'var(--status-success)', fontWeight: 600 }}>
            {totalEvaluations > 0
              ? avgPercentage >= 75
                ? 'Grade A (Distinction Tier)'
                : 'In Progress'
              : 'No Evaluations'}
          </span>
        </div>
        <div>
          <small style={{ color: 'var(--text-muted)' }}>Highest Single Score</small>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>
            {highestResult ? `${highestResult.percentage}% · ${highestResult.assessment_title}` : '—'}
          </div>
        </div>
        <div>
          <small style={{ color: 'var(--text-muted)' }}>Evaluations Completed</small>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>
            {totalEvaluations} Finalized
          </div>
        </div>
      </section>

      <div className="content-card">
        <div className="card-heading">
          <h3>Completed Assessments</h3>
        </div>

        {results.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No evaluation results published yet.
          </div>
        ) : (
          <>
            <div className="data-table-container results-desktop-table">
              <table className="dudex-table">
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((res) => (
                    <tr key={res.result_id}>
                      <td><strong>{res.assessment_title}</strong></td>
                      <td>{res.type}</td>
                      <td>{res.date}</td>
                      <td>{res.score} / {res.max_score}</td>
                      <td><strong style={{ color: 'var(--gold-dark)' }}>{res.percentage}%</strong></td>
                      <td>
                        <span
                          className={`badge-status ${
                            res.status === 'Distinction' || res.status === 'Passed'
                              ? 'present'
                              : res.status === 'Needs Review'
                              ? 'absent'
                              : 'late'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="results-mobile-list">
              {results.map((res) => (
                <article className="result-mobile-item" key={`mobile-${res.result_id}`}>
                  <div className="result-mobile-title">{res.assessment_title}</div>
                  <div className="result-mobile-meta">
                    <span>{res.type}</span>
                    <span>{res.date}</span>
                  </div>
                  <div className="result-mobile-bottom">
                    <div className="result-mobile-stat">
                      <span>Score</span>
                      <strong>{res.score} / {res.max_score}</strong>
                    </div>
                    <div className="result-mobile-stat">
                      <span>Percentage</span>
                      <strong style={{ color: 'var(--gold-dark)' }}>{res.percentage}%</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const ResultsPage = ResultsView
export default ResultsPage
