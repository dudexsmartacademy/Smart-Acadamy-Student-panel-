import { useState } from 'react'
import { ChevronRight, Download, ChevronLeft } from 'lucide-react'
import type { View, DailyNote } from '../../types'

export function NoteDetailView({ note, goTo }: { note: DailyNote | null; goTo: (v: View) => void }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (!note) {
    return (
      <div className="page">
        <p>No note selected.</p>
        <button className="btn-primary" onClick={() => goTo('notes')}>Back to Notes</button>
      </div>
    )
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : note.images.length - 1))
  }

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev < note.images.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="page fade-in">
      <button className="btn-link" onClick={() => goTo('notes')} style={{ marginBottom: '18px' }}>
        <ChevronLeft size={16} /> Back to Daily Notes
      </button>

      <div className="page-header">
        <div>
          <div className="eyebrow">
            {note.subject} · {note.formatted_date}
          </div>
          <h1>{note.title}</h1>
          <p className="page-copy">
            Faculty: <strong>{note.teacher_name}</strong> · Read Time: {note.read_time || '10 min'}
          </p>
        </div>
        <div className="header-actions">
          {note.pdf_name && (
            <button className="btn-primary" onClick={() => alert(`Downloading: ${note.pdf_name}`)}>
              <Download size={16} /> Download {note.pdf_name}
            </button>
          )}
        </div>
      </div>

      <div className="note-viewer-layout">
        {/* Left Column: Description & Image Gallery */}
        <div>
          <div className="content-card">
            <h3 style={{ marginBottom: '12px' }}>Lecture Overview</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14px' }}>
              {note.description}
            </p>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              {note.tags.map((tag) => (
                <span key={tag} className="attachment-badge" style={{ background: 'var(--cream-bg)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Multiple Image Gallery */}
          {note.images.length > 0 && (
            <div className="gallery-container">
              <div className="card-heading" style={{ marginBottom: '14px' }}>
                <h3>Diagrams & Whiteboard Gallery</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {activeImageIndex + 1} of {note.images.length}
                </span>
              </div>

              <div className="gallery-main-view">
                <img src={note.images[activeImageIndex]} alt={note.title} />
                <div className="gallery-nav-overlay">
                  <button className="gallery-nav-btn" onClick={prevImage} aria-label="Previous image">
                    <ChevronLeft size={20} />
                  </button>
                  <button className="gallery-nav-btn" onClick={nextImage} aria-label="Next image">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="gallery-counter">
                  {activeImageIndex + 1} / {note.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="gallery-thumbnails">
                {note.images.map((img, idx) => (
                  <div
                    key={img}
                    className={`gallery-thumb ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: PDF Preview / Attachment Specs */}
        <div>
          <div className="content-card">
            <h3 style={{ marginBottom: '16px' }}>Attached Resources</h3>
            {note.pdf_name ? (
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '18px',
                  background: 'var(--cream-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="brand-mark" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                    PDF
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>{note.pdf_name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Official Lecture Handout</span>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => alert(`Opening PDF document: ${note.pdf_name}`)}
                >
                  <Download size={14} /> Open Document
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No downloadable PDFs for this note.</p>
            )}

            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--cream-secondary)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <p>💡 <em>Note: Notes are strictly published by authorized academy faculty and cannot be edited by students.</em></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const NoteDetailPage = NoteDetailView
export default NoteDetailPage
