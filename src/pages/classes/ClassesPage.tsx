import { ArrowUpRight } from 'lucide-react'
import type { View } from '../../types'

export function MyClassesView({ goTo }: { goTo: (v: View) => void }) {
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academic Groups</div>
          <h1>My Classes</h1>
          <p className="page-copy">Assigned cohort batches, faculty leads, and schedule modes.</p>
        </div>
      </div>

      <div className="notes-card-grid">
        <div className="content-card">
          <span className="attachment-badge" style={{ background: 'var(--brand-black)', color: '#FFF' }}>Hybrid Mode</span>
          <h3 style={{ margin: '14px 0 6px' }}>AI & Data Science · Batch B</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
            2024–2028 · Section B · 3rd Year
          </p>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Subjects: Python, Data Science, DBMS, Mathematics
          </div>
          <button className="btn-primary" onClick={() => goTo('courses')}>
            View Courses & Syllabus <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="content-card">
          <span className="attachment-badge" style={{ background: 'var(--gold-primary)', color: '#FFF' }}>Online Mode</span>
          <h3 style={{ margin: '14px 0 6px' }}>Placement Readiness Cohort 04</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
            September 2026 Intensive Placement Training
          </p>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Subjects: Aptitude, Soft Skills, Coding Sandbox
          </div>
          <button className="btn-primary" onClick={() => goTo('live')}>
            View Live Sessions <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export const ClassesPage = MyClassesView
export default ClassesPage
