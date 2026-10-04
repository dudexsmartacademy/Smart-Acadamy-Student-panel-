import { studentService } from '../../services'

export function AnnouncementsView() {
  const items = studentService.getAnnouncements()
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
        {items.map((ann) => (
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
        ))}
      </div>
    </div>
  )
}

export const AnnouncementsPage = AnnouncementsView
export default AnnouncementsPage
