import { useState } from 'react'
import { NotebookPen, Search, ChevronRight, Download, Eye, ChevronDown } from 'lucide-react'
import type { DailyNote } from '../../types'
import { studentService } from '../../services'

export function DailyNotesView({ openNoteDetail }: { openNoteDetail: (n: DailyNote) => void }) {
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false)
  const notes = studentService.getDailyNotes()

  const filtered = notes.filter((n) => {
    const matchQuery = n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.description.toLowerCase().includes(query.toLowerCase()) ||
      n.teacher_name.toLowerCase().includes(query.toLowerCase())
    const matchSubject = subjectFilter === 'All' || n.subject === subjectFilter
    return matchQuery && matchSubject
  })

  // Group notes by date
  const groupedByDate: Record<string, DailyNote[]> = {}
  filtered.forEach((note) => {
    if (!groupedByDate[note.formatted_date]) {
      groupedByDate[note.formatted_date] = []
    }
    groupedByDate[note.formatted_date].push(note)
  })

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academic Library</div>
          <h1>Daily Notes</h1>
          <p className="page-copy">
            Explore daily lecture notes, code breakdowns, PDF sheets, and visual architecture galleries shared by faculty.
          </p>
        </div>
      </div>

      {/* Toolbar: Search & Subject Filters */}
      <div className="daily-notes-toolbar" style={{ marginBottom: '20px' }}>
        <div className="daily-notes-search search-box">
          <Search size={17} color="var(--text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, topics or teachers..."
          />
        </div>

        <div className={`daily-notes-select-wrap ${subjectDropdownOpen ? 'is-open' : ''}`}>
          <button
            type="button"
            className="daily-notes-select"
            aria-haspopup="listbox"
            aria-expanded={subjectDropdownOpen}
            onClick={() => setSubjectDropdownOpen((open) => !open)}
          >
            <span>{subjectFilter === 'All' ? 'All Subjects' : subjectFilter}</span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>

          {subjectDropdownOpen && (
            <div className="daily-notes-dropdown" role="listbox" aria-label="Subjects">
              {[
                ['All', 'All Subjects'],
                ['Python', 'Python'],
                ['Data Structures', 'Data Structures'],
                ['DBMS', 'DBMS'],
                ['Problem Solving', 'Problem Solving'],
                ['Mathematics & Logic', 'Mathematics & Logic'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={subjectFilter === value}
                  className={`daily-notes-dropdown-option ${subjectFilter === value ? 'selected' : ''}`}
                  onClick={() => {
                    setSubjectFilter(value)
                    setSubjectDropdownOpen(false)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grouped Notes Render */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <NotebookPen size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3>No notes available for this query</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            Try resetting your search filter or selecting another subject.
          </p>
        </div>
      ) : (
        <div className="notes-group-container" style={{ marginTop: '0px' }}>
          {Object.entries(groupedByDate).map(([dateLabel, dateNotes]) => (
            <div key={dateLabel}>
              <div className="date-group-header">
                <span className="date-group-badge">{dateLabel}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {dateNotes.length} Note{dateNotes.length > 1 ? 's' : ''} Published
                </span>
                <div className="date-group-line" />
              </div>

              <div className="notes-card-grid">
                {dateNotes.map((note) => (
                  <div key={note.note_id} className="note-item-card" onClick={() => openNoteDetail(note)}>
                    <span className="note-card-subject">{note.subject} · {note.teacher_name}</span>
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const DailyNotesPage = DailyNotesView
export default DailyNotesPage
