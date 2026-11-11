import { useState, useEffect } from 'react'
import { BookOpen, Video, ClipboardCheck, CalendarDays, BarChart3, CheckCircle2, ChevronRight, ArrowUpRight, Clock3, Download, Eye, ExternalLink, Sparkles, Play } from 'lucide-react'
import type { View, DailyNote } from '../../types'
import { studentService, initialProfile, syncStudentData, STUDENT_DATA_SYNCED_EVENT } from '../../services'

export function DashboardView({
  goTo,
  profile,
  openNoteDetail,
  setSelectedAssessmentId
}: {
  goTo: (v: View) => void
  profile: typeof initialProfile
  openNoteDetail: (n: DailyNote) => void
  setSelectedAssessmentId: (id: string) => void
}) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const handleSync = () => setTick((v) => v + 1)
    window.addEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    window.addEventListener('dudex_notes_changed', handleSync)
    // Run sync in case it hasn't completed yet
    syncStudentData().catch(() => {})
    return () => {
      window.removeEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
      window.removeEventListener('dudex_notes_changed', handleSync)
    }
  }, [])

  const heroClass = studentService.getHeroLiveClass()
  const recentNotes = studentService.getDailyNotes().slice(0, 3)
  const subjectAttendance = studentService.getSubjectAttendance()
  const results = studentService.getResults()
  const assessments = studentService.getAssessments()

  const totalConducted = subjectAttendance.reduce((a, s) => a + s.conducted, 0)
  const totalPresent = subjectAttendance.reduce((a, s) => a + s.present, 0)
  const attendanceRate =
    totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 100) : 0

  const avgScore =
    results.length > 0
      ? Math.round(
          results.reduce((a, r) => a + r.percentage, 0) / results.length
        )
      : 0

  return (
    <div className="page fade-in dashboard-page">
      {/* Student Greeting Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Sparkles size={13} /> {profile.department || 'Student Portal'}{' '}
            {profile.section ? `· ${profile.section}` : ''}{' '}
            {profile.batch ? `· ${profile.batch}` : ''}
          </div>
          <h1>Good Morning, {profile.full_name || 'Student'}</h1>
          <p className="page-copy">
            RRN: <strong>{profile.rrn || 'Pending'}</strong> · Welcome to your personal learning &amp; placement training workspace.
          </p>
        </div>
      </div>

      {/* 1. LIVE CLASS HERO (Dark Card Priority) */}
      {heroClass && (
        <section className="live-hero-card">
          <div className="live-hero-content">
            <span className="live-pill-tag">
              <span className="pulse-indicator" /> {heroClass.status} · Today
            </span>
            <h2>{heroClass.title}</h2>
            <p className="live-hero-topic">Topic: {heroClass.topic}</p>
            <div className="live-hero-faculty">
              <span>Faculty: <strong>{heroClass.teacher_name || 'Faculty Member'}</strong>{heroClass.teacher_title ? ` (${heroClass.teacher_title})` : ''}</span>
            </div>
            <div className="live-hero-actions">
              <button
                className="btn-gold"
                onClick={() => window.open(heroClass.meeting_url, '_blank', 'noopener,noreferrer')}
              >
                JOIN LIVE CLASS <ExternalLink size={16} />
              </button>
              <button className="btn-outline" style={{ color: '#FFF', borderColor: '#444' }} onClick={() => goTo('live')}>
                View Session Details
              </button>
            </div>
          </div>

          <div className="live-hero-meta">
            <div className="live-meta-row">
              <Clock3 size={16} />
              <span>{heroClass.start_time} — {heroClass.end_time}</span>
            </div>
            <div className="live-meta-row">
              <BookOpen size={16} />
              <span>{heroClass.subject}</span>
            </div>
            <div className="live-meta-row">
              <Video size={16} />
              <span>{heroClass.platform} (Live Online Meeting)</span>
            </div>
          </div>
        </section>
      )}

      {/* 2. STUDENT METRIC CARDS */}
      <section className="metric-grid dashboard-metric-grid">
        <div className="metric-card accent-gold">
          <div className="metric-card-header">
            <span>Overall Attendance</span>
            <CalendarDays size={18} color="var(--gold-primary)" />
          </div>
          <div className="metric-card-value">
            {totalConducted > 0 ? `${attendanceRate}%` : '—'}
          </div>
          <div className="metric-card-detail">
            {totalConducted > 0
              ? `${totalPresent} of ${totalConducted} classes attended`
              : 'No attendance records yet'}
          </div>
          <span className="metric-trend good">
            <CheckCircle2 size={13} />{' '}
            {totalConducted > 0
              ? attendanceRate >= 75
                ? 'Safe above 75%'
                : 'Below threshold'
              : 'Awaiting sessions'}
          </span>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>Assessments Completed</span>
            <ClipboardCheck size={18} color="var(--brand-black)" />
          </div>
          <div className="metric-card-value">
            {results.length} / {assessments.length || results.length}
          </div>
          <div className="metric-card-detail">
            {assessments.length > 0
              ? `${assessments.length} total scheduled`
              : 'Evaluations taken'}
          </div>
          <span className="metric-trend">
            <Clock3 size={13} />{' '}
            {results.length > 0 ? `${results.length} verified` : 'None pending'}
          </span>
        </div>

        <div className="metric-card accent-gold">
          <div className="metric-card-header">
            <span>Average Score</span>
            <BarChart3 size={18} color="var(--gold-primary)" />
          </div>
          <div className="metric-card-value">
            {results.length > 0 ? `${avgScore}%` : '—'}
          </div>
          <div className="metric-card-detail">Placement training track</div>
          <span className="metric-trend good">
            <ArrowUpRight size={13} />{' '}
            {results.length > 0 ? 'Verified evaluations' : 'No evaluations yet'}
          </span>
        </div>
      </section>

      {/* 3. TODAY'S LEARNING SECTION */}
      <div className="card-heading" style={{ marginTop: '36px' }}>
        <div>
          <div className="eyebrow">Focused Routine</div>
          <h3>Today's Learning Schedule</h3>
        </div>
        <button className="btn-link" onClick={() => goTo('live')}>View schedule <ChevronRight size={14} /></button>
      </div>

      <section className="today-learning-grid">
        {!heroClass && recentNotes.length === 0 && assessments.length === 0 ? (
          <div
            className="content-card"
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '36px 16px',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            No live classes or active tasks scheduled for today.
          </div>
        ) : (
          <>
            {heroClass && (
              <div className="today-item-card">
                <span className="today-item-type">Live Class · {heroClass.start_time}</span>
                <h4>{heroClass.title}</h4>
                <p>Topic: {heroClass.topic} with {heroClass.teacher_name}.</p>
                <button
                  className="btn-primary"
                  onClick={() => window.open(heroClass.meeting_url, '_blank', 'noopener,noreferrer')}
                >
                  Join Class <ExternalLink size={14} />
                </button>
              </div>
            )}

            {recentNotes[0] && (
              <div className="today-item-card">
                <span className="today-item-type">Daily Notes Added</span>
                <h4>{recentNotes[0].title}</h4>
                <p>
                  {(recentNotes[0].images.length + (recentNotes[0].documents?.length || 0)) > 0
                    ? `${recentNotes[0].images.length + (recentNotes[0].documents?.length || 0)} attachments · ${recentNotes[0].description}`
                    : recentNotes[0].description}
                </p>
                <button className="btn-secondary" onClick={() => openNoteDetail(recentNotes[0])}>
                  Open Notes <ArrowUpRight size={14} />
                </button>
              </div>
            )}

            {assessments[0] && (
              <div className="today-item-card">
                <span className="today-item-type">MCQ Assessment · Active</span>
                <h4>{assessments[0].title}</h4>
                <p>{assessments[0].description}</p>
                <button
                  className="btn-gold"
                  onClick={() => {
                    setSelectedAssessmentId(assessments[0].assessment_id)
                    goTo('mcq')
                  }}
                >
                  Start Assessment <Play size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 4. LATEST DAILY NOTES PREVIEWS */}
      <div className="card-heading" style={{ marginTop: '36px' }}>
        <div>
          <div className="eyebrow">Faculty Shared Archive</div>
          <h3>Latest Daily Notes</h3>
        </div>
        <button className="btn-secondary" onClick={() => goTo('notes')}>
          View All Notes <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="notes-card-grid">
        {recentNotes.length === 0 ? (
          <div
            className="content-card"
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '32px 16px',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            No daily notes published yet.
          </div>
        ) : (
          recentNotes.map((note) => (
            <div key={note.note_id} className="note-item-card" onClick={() => openNoteDetail(note)}>
              <span className="note-card-subject">{note.subject} · {note.formatted_date}</span>
              <h3>{note.title}</h3>
              <p className="note-card-desc">{note.description}</p>
              <div className="note-card-footer">
                <div className="attachment-badges">
                  {note.pdf_url && <span className="attachment-badge"><Download size={12} /> PDF</span>}
                  {note.images.length > 0 && <span className="attachment-badge"><Eye size={12} /> {note.images.length} Images</span>}
                </div>
                <button className="btn-link">Open Note <ChevronRight size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export const DashboardPage = DashboardView
export default DashboardPage
