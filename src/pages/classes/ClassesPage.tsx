import { useEffect, useState } from 'react'
import { ArrowUpRight, GraduationCap, BookOpen, Video, FileText } from 'lucide-react'
import type { View } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { studentService, type EnrolledClass, STUDENT_DATA_SYNCED_EVENT } from '../../services/studentService'

export function MyClassesView({ goTo }: { goTo: (v: View) => void }) {
  const { profile } = useAuth()
  const [classes, setClasses] = useState<EnrolledClass[]>([])

  const loadClasses = async () => {
    try {
      const data = await studentService.getEnrolledClasses()
      setClasses(data)
    } catch (err) {
      console.error('Failed to load classes', err)
    }
  }

  useEffect(() => {
    loadClasses()
    const handleSync = () => {
      loadClasses()
    }
    window.addEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    return () => window.removeEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
  }, [])

  const departmentTitle = profile.department || profile.specialization || 'Academic Cohort'
  const sectionTitle = profile.section ? `Section ${profile.section}` : 'General Section'
  const formatBatchDisplay = (raw?: string) => {
    if (!raw) return 'Current Academic Year'
    const match = raw.match(/\d+/)
    if (match) return `Batch ${match[0]}`
    return raw.replace(/^(?:batch\s*)+/i, 'Batch ')
  }
  const batchTitle = formatBatchDisplay(profile.batch)

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academic Groups</div>
          <h1>My Classes</h1>
          <p className="page-copy">Assigned cohort batches, faculty leads, and schedule modes.</p>
        </div>
      </div>

      <div className="notes-card-grid" style={{ marginBottom: '24px' }}>
        {/* Dynamic Enrolled Classes from Admin & Teacher Portals */}
        {classes.map((cls) => (
          <div key={cls.id} className="content-card" style={{ borderLeft: '4px solid var(--gold-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span className="attachment-badge" style={{ background: 'var(--brand-black)', color: '#FFF' }}>
                Enrolled Class
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {cls.academicYear || profile.academic_year || 'Active'}
              </span>
            </div>

            <h3 style={{ margin: '8px 0 6px', fontSize: '18px', fontWeight: 700 }}>{cls.name}</h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>
              {cls.collegeName ? <strong>{cls.collegeName} · </strong> : ''}
              {cls.department || departmentTitle}
              {cls.section ? ` · Sec ${cls.section}` : ''}
              {cls.batch ? ` · ${cls.batch.toLowerCase().startsWith('batch') ? cls.batch : `Batch ${cls.batch}`}` : ''}
            </p>

            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={15} style={{ color: 'var(--gold-primary)' }} />
              <span>Faculty: <strong>{cls.teacherName || 'Assigned Faculty Lead'}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '7px 12px', fontSize: '12px' }} onClick={() => goTo('live')}>
                <Video size={13} style={{ marginRight: '4px' }} /> Live Sessions
              </button>
              <button className="btn-secondary" style={{ padding: '7px 12px', fontSize: '12px' }} onClick={() => goTo('notes')}>
                <FileText size={13} style={{ marginRight: '4px' }} /> Daily Notes
              </button>
              <button className="btn-secondary" style={{ padding: '7px 12px', fontSize: '12px' }} onClick={() => goTo('mcq')}>
                <BookOpen size={13} style={{ marginRight: '4px' }} /> Assessments
              </button>
            </div>
          </div>
        ))}

        {/* Primary Registered Cohort Card */}
        <div className="content-card">
          <span className="attachment-badge" style={{ background: 'var(--brand-black)', color: '#FFF' }}>Registered Cohort</span>
          <h3 style={{ margin: '14px 0 6px' }}>{departmentTitle}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
            {profile.college ? `${profile.college} · ` : ''}{sectionTitle} · {batchTitle}
          </p>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Registration: <strong>{profile.rrn || 'Pending ID'}</strong> · Status: <strong>{profile.account_status}</strong>
          </div>
          <button className="btn-primary" onClick={() => goTo('courses')}>
            View Courses &amp; Syllabus <ArrowUpRight size={14} />
          </button>
        </div>

        {/* DudeX Placement Track Card */}
        <div className="content-card">
          <span className="attachment-badge" style={{ background: 'var(--gold-primary)', color: '#FFF' }}>Placement Track</span>
          <h3 style={{ margin: '14px 0 6px' }}>DudeX Placement Readiness</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
            Technical interview prep, algorithmic problem solving, and industry cohorts.
          </p>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Modules: Algorithms, Full-Stack, System Architecture
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
