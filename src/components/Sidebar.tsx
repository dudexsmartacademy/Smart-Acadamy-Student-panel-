import {
  X,
  ShieldCheck,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import type { View, StudentProfile } from '../types'
import { navItems } from '../data'

interface SidebarProps {
  view: View
  goTo: (v: View) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  onSignOutClick: () => void
  profile: StudentProfile
}

export function Sidebar({
  view,
  goTo,
  mobileOpen,
  setMobileOpen,
  onSignOutClick,
  profile,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="brand-wrapper">
          <div className="brand-identity">
            <div className="brand-mark">D</div>
            <div className="brand-text">
              <strong>DudeX Smart Academy</strong>
              <span>Student Portal</span>
            </div>
          </div>
          <button className="close-nav" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Student Mini Profile Summary */}
        <div className="student-card-mini" onClick={() => goTo('profile')}>
          <div className="avatar">NJ</div>
          <div className="student-meta">
            <strong>{profile.full_name}</strong>
            <span>{profile.department}</span>
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
              {id === 'assessments' && <span className="nav-badge">2 Active</span>}
              {id === 'live' && <span className="pulse-indicator" style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className={`nav-link ${view === 'profile' ? 'active' : ''}`} onClick={() => goTo('profile')}>
            <ShieldCheck size={17} />
            <span>My Profile</span>
          </button>
          <button className={`nav-link ${view === 'help' ? 'active' : ''}`} onClick={() => goTo('help')}>
            <HelpCircle size={17} />
            <span>Help & Support</span>
          </button>
          <button className="nav-link" onClick={onSignOutClick}>
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>

          <div className="sidebar-status-tag">
            <span>Supabase Ready</span>
            <span className="status-dot-pulse" title="Connected to academy real-time network" />
          </div>
        </div>
      </aside>

      {/* Mobile navigation backdrop */}
      {mobileOpen && <div className="modal-overlay" onClick={() => setMobileOpen(false)} style={{ zIndex: 25 }} />}
    </>
  )
}

export default Sidebar
