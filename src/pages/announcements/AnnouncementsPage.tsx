import { useState, useEffect } from 'react'
import { studentService } from '../../services'
import { STUDENT_DATA_SYNCED_EVENT, syncStudentData } from '../../services/studentService'

export function AnnouncementsView() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const handleSync = () => setTick((v) => v + 1)
    window.addEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    syncStudentData().catch(() => {})
    return () => {
      window.removeEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    }
  }, [])

  const items = studentService.getAnnouncements()

  useEffect(() => {
    if (items.length > 0) {
      for (const ann of items) {
        void studentService.recordAnnouncementView(ann.announcement_id)
      }
    }
  }, [items.length])
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academy Broadcast</div>
          <h1>Announcements</h1>
          <p className="page-copy">Official updates from faculty and academy administration.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {items.length === 0 ? (
          <div
            className="content-card"
            style={{
              textAlign: 'center',
              padding: '36px 16px',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            No announcements posted at this time.
          </div>
        ) : (
          items.map((ann) => (
            <div key={ann.announcement_id} className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className={`badge-status ${ann.priority === 'High' ? 'late' : 'excused'}`}>
                  {ann.priority} Priority
                </span>
                <small style={{ color: 'var(--text-muted)' }}>{ann.date}</small>
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>{ann.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '12px' }}>
                {ann.content}
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Published by: <strong>{ann.sender_name}</strong> ({ann.sender_role}) · Target: {ann.target_class}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export const AnnouncementsPage = AnnouncementsView
export default AnnouncementsPage
