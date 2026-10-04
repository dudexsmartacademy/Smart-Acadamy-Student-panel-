import { studentService } from '../../services'

export function ResultsView() {
  const results = studentService.getResults()

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academic Records</div>
          <h1> Results</h1>
          <p className="page-copy">Final scorecards, percentage benchmarks, and faculty remarks.</p>
        </div>
      </div>

      <section className="result-highlight-card results-highlight-grid">
        <div className="result-main-score">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cohort Placement Index</span>
          <strong>84.6%</strong>
          <span style={{ fontSize: '13px', color: 'var(--status-success)', fontWeight: 600 }}>Grade A (Distinction Tier)</span>
        </div>
        <div>
          <small style={{ color: 'var(--text-muted)' }}>Highest Single Score</small>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>90% · Python</div>
        </div>
        <div>
          <small style={{ color: 'var(--text-muted)' }}>Evaluations Completed</small>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>8 Finalized</div>
        </div>
      </section>

      <div className="content-card">
        <div className="card-heading">
          <h3>Completed s</h3>
        </div>

        <div className="data-table-container results-desktop-table">
          <table className="dudex-table">
            <thead>
              <tr>
                <th></th>
                <th>Type</th>
                <th>Date</th>
                <th>Score</th>
                <th>Percentage</th>
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
      </div>
    </div>
  )
}

export const ResultsPage = ResultsView
export default ResultsPage
