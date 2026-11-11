import { useState } from 'react'
import {
  ChevronRight,
  Download,
  ChevronLeft,
  FileText,
  Eye,
  CheckCircle2,
  Images,
  FileArchive,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { View, DailyNote, NoteDocument } from '../../types'

export function NoteDetailView({ note, goTo }: { note: DailyNote | null; goTo: (v: View) => void }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [downloadingImages, setDownloadingImages] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

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

  const showToast = (msg: string) => {
    setStatusMessage(msg)
    setTimeout(() => {
      setStatusMessage(null)
    }, 4000)
  }

  // Helper to ensure URL is a valid full or signed URL
  const resolveFileUrl = async (rawUrl?: string): Promise<string | null> => {
    if (!rawUrl) return null
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
      return rawUrl
    }
    try {
      const cleanPath = rawUrl.replace(/^\/+/, '')
      const { data, error } = await supabase.storage.from('notes').createSignedUrl(cleanPath, 3600)
      if (!error && data?.signedUrl) {
        return data.signedUrl
      }
    } catch (err) {
      console.warn('Could not sign attachment path on demand:', err)
    }
    return rawUrl
  }

  // Helper to trigger real file download with CORS fallback
  const triggerBrowserDownload = async (url: string, filename: string): Promise<boolean> => {
    const resolvedUrl = await resolveFileUrl(url)
    if (!resolvedUrl) {
      showToast('Download unavailable: no valid file link was provided.')
      return false
    }

    try {
      const response = await fetch(resolvedUrl, { mode: 'cors' })
      if (!response.ok) throw new Error(`Download request failed (${response.status}).`)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      return true
    } catch {
      // Fallback: direct browser anchor click bypasses fetch CORS limitations
      try {
        const link = document.createElement('a')
        link.href = resolvedUrl
        link.target = '_blank'
        link.download = filename || 'download'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return true
      } catch (err) {
        showToast(err instanceof Error ? err.message : `Could not download ${filename}.`)
        return false
      }
    }
  }

  // Download all diagrams at once
  const handleDownloadAllImages = async () => {
    if (!note.images || note.images.length === 0) return
    setDownloadingImages(true)

    const sanitizedTitle = (note.title || 'Lecture_Diagram').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32)

    let allDownloaded = true
    for (let i = 0; i < note.images.length; i++) {
      const imgUrl = note.images[i]
      const filename = `${sanitizedTitle}_diagram_${i + 1}.jpg`
      if (!(await triggerBrowserDownload(imgUrl, filename))) allDownloaded = false
      if (i < note.images.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 350))
      }
    }

    setDownloadingImages(false)
    if (allDownloaded) showToast(`All ${note.images.length} images downloaded.`)
  }

  // Download current single diagram
  const handleDownloadSingleImage = async (idx: number) => {
    const imgUrl = note.images[idx]
    if (!imgUrl) return
    const sanitizedTitle = (note.title || 'Lecture_Diagram').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32)
    const filename = `${sanitizedTitle}_diagram_${idx + 1}.jpg`
    if (await triggerBrowserDownload(imgUrl, filename)) {
      showToast(`Downloaded image ${idx + 1}.`)
    }
  }

  // Handle document open
  const handleOpenDocument = async (doc: NoteDocument) => {
    const resolvedUrl = await resolveFileUrl(doc.url)
    if (resolvedUrl && (resolvedUrl.startsWith('http') || resolvedUrl.startsWith('blob:'))) {
      window.open(resolvedUrl, '_blank', 'noopener,noreferrer')
    } else {
      showToast('Document preview is unavailable as no URL was provided by faculty.')
    }
  }

  // Handle document download
  const handleDownloadDocument = async (doc: NoteDocument) => {
    if (await triggerBrowserDownload(doc.url || '', doc.name)) {
      showToast(`Downloaded: ${doc.name}`)
    }
  }

  // Normalized documents list
  const documents: NoteDocument[] =
    note.documents && note.documents.length > 0
      ? note.documents
      : note.pdf_name
      ? [
          {
            id: 'primary-pdf',
            name: note.pdf_name,
            type: 'pdf',
            url: note.pdf_url,
          },
        ]
      : []

  // Document Icon & Type helper
  const getDocBadge = (type?: string, filename?: string) => {
    const ext = (type || (filename ? filename.split('.').pop() : 'pdf') || 'pdf').toLowerCase()
    if (ext === 'pdf') {
      return { label: 'PDF', bg: '#FEE2E2', color: '#DC2626', icon: FileText }
    }
    if (ext === 'doc' || ext === 'docx') {
      return { label: 'DOCX', bg: '#DBEAFE', color: '#2563EB', icon: FileText }
    }
    if (ext === 'ppt' || ext === 'pptx') {
      return { label: 'PPTX', bg: '#FFEDD5', color: '#EA580C', icon: FileSpreadsheet }
    }
    if (ext === 'zip' || ext === 'rar') {
      return { label: 'ZIP', bg: '#F3E8FF', color: '#9333EA', icon: FileArchive }
    }
    return { label: ext.toUpperCase(), bg: '#E0E7FF', color: '#4F46E5', icon: FileCode }
  }

  return (
    <div className="page fade-in note-detail-page-wrapper">
      <style>{`
        .note-detail-flow {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .note-gallery-card {
          background: var(--surface-white);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg, 16px);
          padding: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .note-gallery-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }

        .gallery-main-viewport {
          width: 100%;
          height: clamp(280px, 45vw, 460px);
          background: #0D0E11;
          border-radius: var(--radius-md, 12px);
          overflow: hidden;
          position: relative;
          display: grid;
          place-items: center;
          border: 1px solid #232529;
        }

        .gallery-main-viewport img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #0D0E11;
        }

        .gallery-floating-download {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(27, 28, 30, 0.85);
          backdrop-filter: blur(8px);
          color: #FFF;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
          z-index: 10;
        }

        .gallery-floating-download:hover {
          background: var(--brand-black, #1B1C1E);
          transform: translateY(-1px);
        }

        .attached-resources-card {
          background: var(--surface-white);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg, 16px);
          padding: 26px;
          width: 100%;
          box-sizing: border-box;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .resource-item-card {
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 18px;
          background: var(--cream-bg, #FAF8F5);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          min-width: 0;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }

        .resource-item-card:hover {
          border-color: var(--brand-gold, #B18B5E);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        .resource-header-info {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-width: 0;
          width: 100%;
        }

        .resource-badge-icon {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }

        .resource-details {
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }

        .resource-filename {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          display: block;
          word-break: break-word;
          overflow-wrap: anywhere;
          margin-bottom: 4px;
        }

        .resource-subtitle {
          font-size: 12px;
          color: var(--text-secondary);
          display: block;
          line-height: 1.4;
          margin-bottom: 6px;
        }

        .resource-meta-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--cream-secondary, #EFECE6);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .resource-actions-row {
          display: flex;
          gap: 10px;
          width: 100%;
          min-width: 0;
        }

        .resource-actions-row button {
          flex: 1;
          min-width: 0;
          justify-content: center;
          padding: 9px 12px;
          font-size: 13px;
        }

        .toast-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #1B1C1E;
          color: #FFF;
          padding: 12px 20px;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border: 1px solid #333;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 600;
          z-index: 9999;
          animation: slideUpToast 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUpToast {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .resource-actions-row {
            flex-direction: column;
            gap: 8px;
          }

          .attached-resources-card,
          .note-gallery-card {
            padding: 18px 14px;
          }

          .resources-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Back Button */}
      <button className="btn-link" onClick={() => goTo('notes')} style={{ marginBottom: '18px' }}>
        <ChevronLeft size={16} /> Back to Daily Notes
      </button>

      {/* Page Header (Top download button removed per user request) */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="eyebrow">
            {note.subject} · {note.formatted_date}
          </div>
          <h1 style={{ margin: '8px 0' }}>{note.title}</h1>
          <p className="page-copy" style={{ color: 'var(--text-secondary)' }}>
            {note.teacher_name && <>Faculty: <strong>{note.teacher_name}</strong></>}
            {note.teacher_name && note.read_time && ' · '}
            {note.read_time && <>Read Time: {note.read_time}</>}
          </p>
        </div>
      </div>

      {/* Full-width Flow Layout */}
      <div className="note-detail-flow">
        {/* 1. Lecture Overview Card */}
        <div className="content-card">
          <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 700 }}>Lecture Overview</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14.5px' }}>
            {note.description}
          </p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
            {note.tags.map((tag) => (
              <span key={tag} className="attachment-badge" style={{ background: 'var(--cream-bg)' }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Diagrams & Whiteboard Gallery (with Download All Images option) */}
        {note.images && note.images.length > 0 && (
          <div className="note-gallery-card">
            <div className="note-gallery-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Images size={20} color="var(--brand-gold, #B18B5E)" />
                  Diagrams &amp; Whiteboard Gallery
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Image {activeImageIndex + 1} of {note.images.length}
                </span>
              </div>

              {/* Download All Images Button */}
              <button
                className="btn-primary"
                onClick={handleDownloadAllImages}
                disabled={downloadingImages}
                style={{ padding: '8px 16px', fontSize: '13px' }}
                title="Download all lecture whiteboard images"
              >
                <Download size={15} />
                {downloadingImages ? 'Downloading Images...' : `Download All Images (${note.images.length})`}
              </button>
            </div>

            {/* Main Image Viewport */}
            <div className="gallery-main-viewport">
              <img src={note.images[activeImageIndex]} alt={`${note.title} diagram ${activeImageIndex + 1}`} />

              {/* Single Diagram Download Button */}
              <button
                className="gallery-floating-download"
                onClick={() => handleDownloadSingleImage(activeImageIndex)}
                title="Download this specific diagram"
              >
                <Download size={14} /> Download Diagram {activeImageIndex + 1}
              </button>

              {/* Carousel Next/Prev Controls */}
              {note.images.length > 1 && (
                <div className="gallery-nav-overlay">
                  <button className="gallery-nav-btn" onClick={prevImage} aria-label="Previous diagram">
                    <ChevronLeft size={20} />
                  </button>
                  <button className="gallery-nav-btn" onClick={nextImage} aria-label="Next diagram">
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              <div className="gallery-counter">
                {activeImageIndex + 1} / {note.images.length}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {note.images.length > 1 && (
              <div className="gallery-thumbnails" style={{ marginTop: '16px' }}>
                {note.images.map((img, idx) => (
                  <div
                    key={img + idx}
                    className={`gallery-thumb ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    role="button"
                    tabIndex={0}
                    title={`View diagram ${idx + 1}`}
                  >
                    <img src={img} alt={`Diagram thumbnail ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Attached Resources Section - Full Width Below Images */}
        <div className="attached-resources-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Attached Resources &amp; Documents</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                {documents.length} official study material{documents.length !== 1 ? 's' : ''} provided by faculty
              </p>
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="resources-grid">
              {documents.map((doc, idx) => {
                const badge = getDocBadge(doc.type, doc.name)
                const BadgeIcon = badge.icon
                return (
                  <div key={doc.id || `doc_${idx}`} className="resource-item-card">
                    <div className="resource-header-info">
                      <div
                        className="resource-badge-icon"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        <BadgeIcon size={18} />
                      </div>
                      <div className="resource-details">
                        <strong className="resource-filename" title={doc.name}>
                          {doc.name}
                        </strong>
                        {doc.subtitle && (
                          <span className="resource-subtitle">{doc.subtitle}</span>
                        )}
                        <span className="resource-meta-pill">
                          {doc.size ? `${doc.size} · ` : ''}{badge.label}
                        </span>
                      </div>
                    </div>

                    {/* Both Open Document and Download Document for each file */}
                    <div className="resource-actions-row">
                      <button
                        className="btn-outline"
                        onClick={() => handleOpenDocument(doc)}
                        title={`Open ${doc.name} in preview`}
                      >
                        <Eye size={14} /> Open Document
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleDownloadDocument(doc)}
                        title={`Download ${doc.name}`}
                      >
                        <Download size={14} /> Download Document
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '16px 0 0' }}>
              No downloadable documents attached for this lecture note.
            </p>
          )}

          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--cream-secondary)',
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>💡</span>
            <em>Notes &amp; attached documents are strictly published by authorized academy faculty and verified for the curriculum.</em>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {statusMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={18} color="var(--gold-primary, #B18B5E)" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  )
}

export const NoteDetailPage = NoteDetailView
export default NoteDetailPage
