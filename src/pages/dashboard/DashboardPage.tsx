import { BookOpen, Video, ClipboardCheck, CalendarDays, BarChart3, CheckCircle2, ChevronRight, ArrowUpRight, Clock3, Download, Eye, ExternalLink, Sparkles, Play } from 'lucide-react'
import type { View, DailyNote, StudentProfile } from '../../types'
import { studentService } from '../../services'

export function DashboardView({
  goTo,
  profile,
  openNoteDetail,
  setSelectedAssessmentId
}: {
  goTo: (v: View) => void
  profile: StudentProfile
  openNoteDetail: (n: DailyNote) => void
  setSelectedAssessmentId: (id: string) => void
}) {
  const heroClass = studentService.getHeroLiveClass()
  const recentNotes = studentService.getDailyNotes().slice(0, 3)
  const assessments = studentService.getAssessments()
  const activeAssessment = assessments.find(a => a.status === 'Active') || assessments[0]

  return (
    <div className="page fade-in dashboard-page">
      {/* Student Greeting Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Sparkles size={13} /> {profile.department || 'Academic Portal'} · {profile.section || 'Class'} · {profile.batch || 'Batch'}
          </div>
          <h1>Good Morning, {profile.full_name}</h1>
          <p className="page-copy">
            RRN: <strong>{profile.rrn || 'N/A'}</strong> · Welcome to your personal learning & placement training workspace.
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
              <span>Faculty: <strong>{heroClass.teacher_name}</strong> {heroClass.teacher_title && `(${heroClass.teacher_title})`}</span>
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
              <span>{heroClass.platform} ({heroClass.mode})</span>
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
          <div className="metric-card-value">100%</div>
          <div className="metric-card-detail">Attendance status active</div>
          <span className="metric-trend good"><CheckCircle2 size={13} /> Safe above 75%</span>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>Assessments</span>
            <ClipboardCheck size={18} color="var(--brand-black)" />
          </div>
          <div className="metric-card-value">{assessments.length} Available</div>
          <div className="metric-card-detail">Active placement modules</div>
          <span className="metric-trend"><Clock3 size={13} /> Regular progress tracking</span>
        </div>

        <div className="metric-card accent-gold">
          <div className="metric-card-header">
            <span>Average Performance</span>
            <BarChart3 size={18} color="var(--gold-primary)" />
          </div>
          <div className="metric-card-value">Good</div>
          <div className="metric-card-detail">Placement training track</div>
          <span className="metric-trend good"><ArrowUpRight size={13} /> Updated from Supabase</span>
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
        {heroClass ? (
          <div className="today-item-card">
            <span className="today-item-type">Live Session</span>
            <h4>{heroClass.title}</h4>
            <p>{heroClass.topic} with {heroClass.teacher_name}.</p>
            <button
              className="btn-primary"
              onClick={() => window.open(heroClass.meeting_url, '_blank', 'noopener,noreferrer')}
            >
              Join Class <ExternalLink size={14} />
            </button>
          </div>
        ) : (
          <div className="today-item-card">
            <span className="today-item-type">Live Classes</span>
            <h4>No Live Session Scheduled</h4>
            <p>Check your schedule for upcoming academic sessions.</p>
            <button className="btn-secondary" onClick={() => goTo('live')}>
              View Classes <ChevronRight size={14} />
            </button>
          </div>
        )}

        {recentNotes.length > 0 ? (
          <div className="today-item-card">
            <span className="today-item-type">Daily Notes</span>
            <h4>{recentNotes[0].title}</h4>
            <p>{recentNotes[0].description}</p>
            <button className="btn-secondary" onClick={() => openNoteDetail(recentNotes[0])}>
              Open Notes <ArrowUpRight size={14} />
            </button>
          </div>
        ) : (
          <div className="today-item-card">
            <span className="today-item-type">Notes Archive</span>
            <h4>Daily Notes</h4>
            <p>Faculty shared lecture notes and study material.</p>
            <button className="btn-secondary" onClick={() => goTo('notes')}>
              Browse Notes <ArrowUpRight size={14} />
            </button>
          </div>
        )}

        {activeAssessment ? (
          <div className="today-item-card">
            <span className="today-item-type">Assessment · Active</span>
            <h4>{activeAssessment.title}</h4>
            <p>{activeAssessment.total_questions} Questions · {activeAssessment.duration_minutes} Mins.</p>
            <button
              className="btn-gold"
              onClick={() => {
                setSelectedAssessmentId(activeAssessment.assessment_id)
                goTo('mcq')
              }}
            >
              Start Assessment <Play size={14} />
            </button>
          </div>
        ) : (
          <div className="today-item-card">
            <span className="today-item-type">Assessments</span>
            <h4>Academic Assessments</h4>
            <p>Attempt course assessments and practice challenges.</p>
            <button className="btn-secondary" onClick={() => goTo('assessments')}>
              View Assessments <ChevronRight size={14} />
            </button>
          </div>
        )}
      </section>

      {/* 4. LATEST DAILY NOTES PREVIEWS */}
      {recentNotes.length > 0 && (
        <>
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
            {recentNotes.map((note) => (
              <div key={note.note_id} className="note-item-card" onClick={() => openNoteDetail(note)}>
                <span className="note-card-subject">{note.subject} · {note.formatted_date}</span>
                <h3>{note.title}</h3>
                <p className="note-card-desc">{note.description}</p>
                <div className="note-card-footer">
                  <div className="attachment-badges">
                    {note.pdf_url && <span className="attachment-badge"><Download size={12} /> PDF</span>}
                    {note.images && note.images.length > 0 && <span className="attachment-badge"><Eye size={12} /> {note.images.length} Images</span>}
                  </div>
                  <button className="btn-link">Open Note <ChevronRight size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const DashboardPage = DashboardView
export default DashboardPage
