import {
  LayoutDashboard,
  Video,
  NotebookPen,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react'
import type { View } from '../types'

interface MobileBottomBarProps {
  view: View
  goTo: (v: View) => void
}

export function MobileBottomBar({ view, goTo }: MobileBottomBarProps) {
  return (
    <div className="mobile-bottom-bar">
      <nav>
        <button
          className={`mobile-nav-item ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => goTo('dashboard')}
        >
          <LayoutDashboard size={19} />
          <span>Home</span>
        </button>
        <button
          className={`mobile-nav-item ${view === 'live' || view === 'classes' ? 'active' : ''}`}
          onClick={() => goTo('live')}
        >
          <Video size={19} />
          <span>Classes</span>
        </button>
        <button
          className={`mobile-nav-item ${view === 'notes' || view === 'note-detail' ? 'active' : ''}`}
          onClick={() => goTo('notes')}
        >
          <NotebookPen size={19} />
          <span>Notes</span>
        </button>
        <button
          className={`mobile-nav-item ${
            view === 'assessments' || view === 'hackerrank' || view === 'mcq' || view === 'coding'
              ? 'active'
              : ''
          }`}
          onClick={() => goTo('assessments')}
        >
          <ClipboardCheck size={19} />
          <span>Tests</span>
        </button>
        <button
          className={`mobile-nav-item ${view === 'profile' ? 'active' : ''}`}
          onClick={() => goTo('profile')}
        >
          <ShieldCheck size={19} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  )
}

export default MobileBottomBar
