import { useState, useEffect } from 'react'
import './App.css'
import type { View, DailyNote, PortalNotification } from './types'
import { navItems } from './data'
import { StudentLayout } from './layouts'
import { AppRoutes } from './routes'
import { PublicApp, ResetPassword } from './pages/auth'
import { useAuth } from './context/AuthContext'
import { STUDENT_DATA_SYNCED_EVENT, studentService } from './services/studentService'

function PortalApp() {
  const {
    authView,
    setAuthView,
    profile,
    logout,
    sessionChecked,
    saveRegistrationDetails,
  } = useAuth()

  const [view, setView] = useState<View>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<DailyNote | null>(null)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('')
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [, setDataVersion] = useState(0)

  // Pages read synced Supabase data at render; re-render (not remount, so an
  // in-progress quiz keeps its state) once a sync lands.
  useEffect(() => {
    const handleSynced = () => setDataVersion((v) => v + 1)
    window.addEventListener(STUDENT_DATA_SYNCED_EVENT, handleSynced)
    return () => window.removeEventListener(STUDENT_DATA_SYNCED_EVENT, handleSynced)
  }, [])

  // Close the notification popup whenever the user clicks outside it.
  useEffect(() => {
    if (!notificationsOpen) return

    const handleOutsideNotificationClick = (event: MouseEvent) => {
      const target = event.target as Node
      const popup = document.querySelector('.notifications-dropdown')
      const trigger = document.querySelector('.notification-trigger')

      if (
        popup &&
        trigger &&
        !popup.contains(target) &&
        !trigger.contains(target)
      ) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideNotificationClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideNotificationClick)
    }
  }, [notificationsOpen])

  // Notifications come from the student data sync (loaded on sign-in and
  // refreshed after each sync).
  useEffect(() => {
    if (!profile.student_id) return
    const load = () =>
      setNotifications(
        studentService.getNotifications().map((n) => ({
          notification_id: n.notification_id,
          title: n.title,
          message: n.message,
          timestamp: n.timestamp,
          read: n.read,
        })),
      )
    load()
    window.addEventListener(STUDENT_DATA_SYNCED_EVENT, load)
    return () => window.removeEventListener(STUDENT_DATA_SYNCED_EVENT, load)
  }, [profile.student_id])

  const unreadCount = notifications.filter((n) => !n.read).length

  const goTo = (next: View) => {
    setView(next)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openNoteDetail = (note: DailyNote) => {
    setSelectedNote(note)
    goTo('note-detail')
  }

  const markNotificationRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notification_id === notificationId ? { ...n, read: true } : n,
      ),
    )
    try {
      await studentService.markNotificationRead(notificationId)
    } catch (err) {
      console.error(err)
    }
  }

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await studentService.markAllNotificationsRead()
    } catch (err) {
      console.error(err)
    }
  }

  // While we haven't yet checked whether there's an active session, show a
  // full-screen loader so users don't see the landing page briefly.
  if (!sessionChecked) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--bg-primary, #faf7f4)',
          color: 'var(--text-muted, #888)',
          fontSize: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid var(--border-color, #e8ddd4)',
            borderTop: '3px solid var(--brand-gold, #b58a5a)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span>Loading DudeX Academy…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (authView !== 'portal') {
    return (
      <PublicApp
        mode={authView === 'landing' ? 'landing' : (authView as 'verify' | 'login' | 'signup' | 'forgot' | 'status')}
        setMode={setAuthView}
        onLogin={() => {
          setView('dashboard')
          setAuthView('portal')
        }}
        onRegistrationSave={(details) => saveRegistrationDetails(details)}
      />
    )
  }

  const currentTitle =
    navItems.find((item) => item.id === view)?.label ||
    (view === 'note-detail'
      ? 'Note Details'
      : view === 'assessment-details'
      ? 'Assessment Brief'
      : view === 'mcq'
      ? 'MCQ Exam'
      : view === 'coding'
      ? 'Coding Challenge'
      : view === 'materials'
      ? 'Course Materials'
      : view === 'settings'
      ? 'Settings'
      : view === 'help'
      ? 'Help & Support'
      : 'Student Portal')

  return (
    <StudentLayout
      currentTitle={currentTitle}
      view={view}
      goTo={goTo}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      notificationsOpen={notificationsOpen}
      setNotificationsOpen={setNotificationsOpen}
      notifications={notifications}
      unreadCount={unreadCount}
      markNotificationRead={markNotificationRead}
      markAllRead={markAllRead}
      profile={profile}
      signOutConfirmOpen={signOutConfirmOpen}
      setSignOutConfirmOpen={setSignOutConfirmOpen}
      onSignOutConfirm={async () => {
        setSignOutConfirmOpen(false)
        setMobileOpen(false)
        await logout()
      }}
    >
      <AppRoutes
        view={view}
        goTo={goTo}
        selectedNote={selectedNote}
        openNoteDetail={openNoteDetail}
        selectedAssessmentId={selectedAssessmentId}
        setSelectedAssessmentId={setSelectedAssessmentId}
        notifications={notifications}
        markAllRead={markAllRead}
      />
    </StudentLayout>
  )
}

export default function App() {
  if (window.location.pathname === '/reset-password') {
    return <ResetPassword />
  }
  return <PortalApp />
}
