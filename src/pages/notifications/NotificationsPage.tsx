import { CheckCircle2 } from 'lucide-react'
import type { PortalNotification } from '../../types'

export function NotificationsView({
  notifications,
  onMarkAll,
}: {
  notifications: PortalNotification[]
  onMarkAll: () => void
}) {
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Realtime Activity</div>
          <h1>Notifications</h1>
          <p className="page-copy">Live updates regarding notes, results, classes and attendance.</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={onMarkAll}>
            <CheckCircle2 size={16} /> Mark all read
          </button>
        </div>
      </div>

      <div className="content-card">
        {notifications.length === 0 ? (
          <div
            style={{
              minHeight: '110px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            No notifications
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.notification_id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '16px 0',
                borderBottom: '1px solid var(--cream-secondary)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  marginTop: '6px',
                  width: '8px',
                  minWidth: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: item.read ? 'transparent' : '#222222',
                }}
              />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text-primary)' }}>
                  {item.title}
                </strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0' }}>
                  {item.message}
                </p>
                <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{item.timestamp}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export const NotificationsPage = NotificationsView
export default NotificationsPage
