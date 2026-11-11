import {
  Menu,
  ChevronRight,
  Bell,
  ArrowUpRight,
} from 'lucide-react'
import type { View, StudentProfile, PortalNotification } from '../types'

interface HeaderProps {
  currentTitle: string
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  notifications: PortalNotification[]
  unreadCount: number
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  goTo: (v: View) => void
  profile: StudentProfile
}

export function Header({
  currentTitle,
  setMobileOpen,
  notificationsOpen,
  setNotificationsOpen,
  notifications,
  unreadCount,
  markNotificationRead,
  markAllRead,
  goTo,
  profile,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
          <Menu size={22} />
        </button>
        <div className="breadcrumbs">
          <span>DudeX Academy</span>
          <ChevronRight size={14} />
          <strong>{currentTitle}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-btn notification-trigger"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
        </button>

        {/* Notifications Popover */}
        {notificationsOpen && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <strong>Notifications</strong>
              <button className="btn-link" onClick={markAllRead}>Mark all read</button>
            </div>
            {notifications.filter((item) => !item.read).slice(0, 4).map((item) => (
              <div
                key={item.notification_id}
                className="notification-item-preview"
                onClick={() => {
                  markNotificationRead(item.notification_id)
                  setNotificationsOpen(false)
                  goTo('notifications')
                }}
              >
                <div style={{ marginTop: '4px', width: '8px', minWidth: '8px' }}>
                  <span
                    aria-label="Unread notification"
                    style={{
                      display: 'block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--brand-black, #1B1C1E)',
                    }}
                  />
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: '2px 0' }}>{item.message}</p>
                  <small>{item.timestamp}</small>
                </div>
              </div>
            ))}

            {notifications.filter((item) => !item.read).length === 0 && (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                }}
              >
                No unread notifications
              </div>
            )}

            <div style={{ paddingTop: '10px', marginTop: '6px', borderTop: '1px solid var(--cream-secondary)', textAlign: 'center' }}>
              <button
                className="btn-link"
                style={{ fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => { setNotificationsOpen(false); goTo('notifications') }}
              >
                View all notifications <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        )}

        <div className="profile-pill" onClick={() => goTo('profile')}>
          <div className="avatar small" style={{ overflow: 'hidden' }}>
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.full_name || 'Student'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              (profile.full_name || 'Student')
                .split(' ')
                .filter(Boolean)
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            )}
          </div>
          <span>{profile.full_name ? profile.full_name.split(' ')[0] : 'Profile'}</span>
          <ChevronRight size={14} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  )
}

export default Header
