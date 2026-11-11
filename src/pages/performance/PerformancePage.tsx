import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { studentService } from '../../services'

export function PerformanceView() {
  const results = studentService.getResults()
  const subjectScores = results.map((r) => ({
    name: r.assessment_title,
    score: r.percentage,
  }))

  const total = results.length
  const avg =
    total > 0
      ? Math.round(results.reduce((a, b) => a + b.percentage, 0) / total)
      : null
  const highest =
    results.length > 0
      ? results.reduce(
          (max, r) => (r.percentage > max.percentage ? r : max),
          results[0]
        )
      : null
  const lowest =
    results.length > 1
      ? results.reduce(
          (min, r) => (r.percentage < min.percentage ? r : min),
          results[0]
        )
      : null

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academic Growth</div>
          <h1>Performance Analytics</h1>
          <p className="page-copy">Data-driven insights to boost your placement readiness score.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card accent-gold">
          <div className="metric-card-header"><span>Overall Average</span></div>
          <div className="metric-card-value">{avg !== null ? avg : '—'}</div>
          <span className="metric-trend good">
            {total > 0 ? `${total} evaluations verified` : 'No evaluations yet'}
          </span>
        </div>
        <div className="metric-card">
          <div className="metric-card-header"><span>Assessment Completion</span></div>
          <div className="metric-card-value">{total}</div>
          <div className="metric-card-detail">On-time submissions</div>
        </div>
        <div className="metric-card accent-gold">
          <div className="metric-card-header"><span>Placement Benchmark</span></div>
          <div className="metric-card-value">
            {avg !== null ? `${avg}%` : '—'}
          </div>
          <div className="metric-card-detail">
            {avg !== null && avg >= 75 ? 'Meets placement target' : 'Awaiting scores'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-header"><span>Evaluations Recorded</span></div>
          <div className="metric-card-value">{total} Completed</div>
          <span className="metric-trend good">
            {total > 0 ? 'Active learner' : 'Pending submissions'}
          </span>
        </div>
      </div>

      <div className="dashboard-split-grid" style={{ marginTop: '24px' }}>
        <div className="content-card">
          <div className="card-heading">
            <h3>Subject Performance Benchmark</h3>
          </div>
          {subjectScores.length === 0 ? (
            <div
              style={{
                height: '250px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
                padding: '20px',
              }}
            >
              No performance assessment data available to chart. Completed assessments will visualize here.
            </div>
          ) : (
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectScores} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid horizontal={false} stroke="#E7DED3" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8C857D' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#1B1C1E' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B1C1E',
                      color: '#FFF',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="score" fill="#1B1C1E" barSize={20} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Strongest / Weakest Subject Insight Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {highest ? (
            <div className="content-card" style={{ borderLeft: '4px solid var(--status-success)' }}>
              <div className="eyebrow" style={{ color: 'var(--status-success)' }}>Strongest Track</div>
              <h3 style={{ margin: '6px 0' }}>{highest.assessment_title} — {highest.percentage}%</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Demonstrating high fluency in assessment concepts and topic problem solving.
              </p>
            </div>
          ) : null}

          {lowest ? (
            <div className="content-card" style={{ borderLeft: '4px solid var(--gold-primary)' }}>
              <div className="eyebrow" style={{ color: 'var(--gold-dark)' }}>Growth Opportunity</div>
              <h3 style={{ margin: '6px 0' }}>{lowest.assessment_title} — {lowest.percentage}%</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Focus on reviewing lecture notes and reference materials to elevate scores.
              </p>
            </div>
          ) : null}

          {!highest && !lowest && (
            <div className="content-card" style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Complete evaluations and assessments to generate personalized strengths and recommendations.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const PerformancePage = PerformanceView
export default PerformancePage
