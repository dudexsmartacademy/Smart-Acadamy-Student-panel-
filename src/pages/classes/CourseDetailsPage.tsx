import { ArrowUpRight } from 'lucide-react'
import type { View } from '../../types'

export function CourseDetailsView({ goTo }: { goTo: (v: View) => void }) {
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Syllabus Breakdown</div>
          <h1>Course Curriculum</h1>
          <p className="page-copy">Detailed module roadmap with live sessions and attached notes.</p>
        </div>
      </div>

      <div className="today-learning-grid">
        <div className="today-item-card">
          <span className="today-item-type">Module 01</span>
          <h4>Python Fundamentals & Memory Models</h4>
          <p>12 Modules · 2 active assessments · 4 Daily Notes</p>
          <button className="btn-primary" onClick={() => goTo('notes')}>
            Browse Notes <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="today-item-card">
          <span className="today-item-type">Module 02</span>
          <h4>Data Science & Statistical Inference</h4>
          <p>9 Modules · 1 active assessment · 2 Daily Notes</p>
          <button className="btn-secondary" onClick={() => goTo('notes')}>
            Browse Notes <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="today-item-card">
          <span className="today-item-type">Module 03</span>
          <h4>Relational Database Systems (SQL)</h4>
          <p>8 Modules · 3 completed tests · 3 Daily Notes</p>
          <button className="btn-secondary" onClick={() => goTo('notes')}>
            Browse Notes <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export const CourseDetailsPage = CourseDetailsView
export default CourseDetailsPage
