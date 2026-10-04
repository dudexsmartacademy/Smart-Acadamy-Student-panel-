import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
export function PerformanceView() {
  const subjectScores = [
    { name: 'Python', score: 91 },
    { name: 'Data Science', score: 84 },
    { name: 'DBMS', score: 78 },
    { name: 'Mathematics', score: 67 },
  ]

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
          <div className="metric-card-value">84.6</div>
          <span className="metric-trend good">+6.8% vs last month</span>
        </div>
        <div className="metric-card">
          <div className="metric-card-header"><span> Completion</span></div>
          <div className="metric-card-value">94%</div>
          <div className="metric-card-detail">On-time submissions</div>
        </div>
        <div className="metric-card accent-gold">
          <div className="metric-card-header"><span>Coding Challenge Pass Rate</span></div>
          <div className="metric-card-value">88%</div>
          <div className="metric-card-detail">100% test constraints</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-header"><span>Learning Streak</span></div>
          <div className="metric-card-value">12 Days</div>
          <span className="metric-trend good">Best: 18 Days</span>
        </div>
      </div>

      <div className="dashboard-split-grid" style={{ marginTop: '24px' }}>
        <div className="content-card">
          <div className="card-heading">
            <h3>Subject Performance Benchmark</h3>
          </div>
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
        </div>

        {/* Strongest / Weakest Subject Insight Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="content-card" style={{ borderLeft: '4px solid var(--status-success)' }}>
            <div className="eyebrow" style={{ color: 'var(--status-success)' }}>Strongest Track</div>
            <h3 style={{ margin: '6px 0' }}>Python Programming — 91%</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Demonstrating high algorithmic fluency in two-pointers and OOP principles.
            </p>
          </div>

          <div className="content-card" style={{ borderLeft: '4px solid var(--gold-primary)' }}>
            <div className="eyebrow" style={{ color: 'var(--gold-dark)' }}>Growth Opportunity</div>
            <h3 style={{ margin: '6px 0' }}>Mathematics & Probability — 67%</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Focus on conditional probability formulas and Bayes theorem practice sheets to elevate cohort standing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const PerformancePage = PerformanceView
export default PerformancePage
