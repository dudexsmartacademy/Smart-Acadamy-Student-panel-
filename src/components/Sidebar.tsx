import {
  X,
  ShieldCheck,
  HelpCircle,
  LogOut,
} from 'lucide-react'

import type { View, StudentProfile } from '../types'
import { navItems } from '../data'
import { studentService } from '../services/studentService'

interface SidebarProps {
  view: View
  goTo: (v: View) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  onSignOutClick: () => void
  profile: StudentProfile
}

const formatBatchDisplay = (raw?: string) => {
  if (!raw) return 'Student'
  const match = raw.match(/\d+/)
  if (match) return `Batch ${match[0]}`
  return raw.replace(/^(?:batch\s*)+/i, 'Batch ')
}

export function Sidebar({
  view,
  goTo,
  mobileOpen,
  setMobileOpen,
  onSignOutClick,
  profile,
}: SidebarProps) {
  // The app re-renders after each Supabase sync, so this stays current.
  const assessmentCount = studentService.getAssessments().length

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="brand-wrapper">
          <div className="brand-identity">
            <div
              className="brand-mark"
              style={{
                background: 'linear-gradient(135deg, #2A1D17, #171311)',
                border: '1px solid rgba(180, 140, 100, 0.4)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              <img
                src="/logo.png?v=20261031_0715"
                alt="DudeX Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div className="brand-text">
              <strong>DudeX Smart Academy</strong>
              <span>Student Portal</span>
            </div>
          </div>

          <button
            className="close-nav"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Student Mini Profile Summary */}
        <div
          className="student-card-mini"
          onClick={() => goTo('profile')}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              goTo('profile')
            }
          }}
          aria-label={`View profile for ${profile.full_name || 'Student'}`}
        >
          <div className="avatar" style={{ overflow: 'hidden' }}>
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

          <div className="student-meta">
            <strong>{profile.full_name || 'Student'}</strong>

            <span>{profile.department || 'Student'}</span>

            {/* STUDENT BATCH NUMBER */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                width: 'fit-content',
                marginTop: '5px',
                padding: '3px 7px',
                borderRadius: '4px',
                background: '#383838',
                color: '#e5d0b3',
                fontSize: '9px',
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {formatBatchDisplay(profile.batch)}
            </span>
          </div>
        </div>

        <p className="nav-section-title">Learning Workspace</p>

        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link ${view === id ? 'active' : ''}`}
              onClick={() => goTo(id)}
            >
              <Icon size={18} />

              <span>{label}</span>

              {id === 'assessments' && assessmentCount > 0 && (
                <span className="nav-badge">{assessmentCount} Active</span>
              )}

              {id === 'live' && (
                <span
                  className="pulse-indicator"
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className={`nav-link ${view === 'profile' ? 'active' : ''}`}
            onClick={() => goTo('profile')}
          >
            <ShieldCheck size={17} />
            <span>My Profile</span>
          </button>

          <button
            className={`nav-link ${view === 'help' ? 'active' : ''}`}
            onClick={() => goTo('help')}
          >
            <HelpCircle size={17} />
            <span>Help & Support</span>
          </button>

          <button className="nav-link" onClick={onSignOutClick}>
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>

          <div className="sidebar-status-tag">
            <span>Supabase Ready</span>

            <span
              className="status-dot-pulse"
              title="Connected to academy real-time network"
            />
          </div>
        </div>
      </aside>

      {/* Mobile navigation backdrop */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          onClick={() => setMobileOpen(false)}
          style={{ zIndex: 25 }}
        />
      )}
    </>
  )
}

export default Sidebar