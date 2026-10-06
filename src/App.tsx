import { useState, useEffect } from 'react'
import './App.css'
import type { View, DailyNote, PortalNotification } from './types'
import { studentService } from './services'
import { navItems } from './data'
import { StudentLayout } from './layouts'
import { AppRoutes } from './routes'
import { PublicApp } from './pages/auth'
import { useAuth } from './context/AuthContext'

export default function App() {
  const {
    authView,
    setAuthView,
    profile,
    setProfile,
    registrationDetails,
    setRegistrationDetails,
    logout,
  } = useAuth()

  const [view, setView] = useState<View>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false)

  const [selectedNote, setSelectedNote] = useState<DailyNote | null>(null)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('')
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const unreadCount = notifications.filter((notification) => !notification.read).length

  // Synchronize data with Supabase backend on mount & session changes
  useEffect(() => {
    if (authView === 'portal') {
      studentService.fetchProfileAsync().then((fetchedProfile) => {
        if (fetchedProfile) setProfile(fetchedProfile)
      })
      studentService.fetchNotificationsAsync().then((fetched) => {
        setNotifications(
          fetched.map((n) => ({
            notification_id: n.notification_id,
            title: n.title,
            message: n.message,
            timestamp: n.timestamp,
            read: n.read,
          }))
        )
      })
      studentService.fetchDailyNotesAsync().then((notes) => {
        if (notes.length > 0) {
          setSelectedNote(notes[0])
        }
      })
      studentService.fetchLiveClassesAsync()
      studentService.fetchAssessmentsAsync()
      studentService.fetchResultsAsync()
      studentService.fetchAnnouncementsAsync()
    }
  }, [authView])

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

  const goTo = (next: View) => {
    setView(next)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openNoteDetail = (note: DailyNote) => {
    setSelectedNote(note)
    goTo('note-detail')
  }

  const markNotificationRead = (notificationId: string) => {
    const updated = notifications.map((notification) =>
      notification.notification_id === notificationId
        ? { ...notification, read: true }
        : notification
    )
    setNotifications(updated)
  }

  const markAllRead = () => {
    setNotifications([])
    studentService.markAllNotificationsRead()
  }

  if (authView !== 'portal') {
    return (
      <PublicApp
        mode={authView}
        setMode={setAuthView}
        onLogin={() => {
          setView('dashboard')
          setAuthView('portal')
        }}
        onRegistrationSave={(details) => {
          setRegistrationDetails(details)
        }}
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
      onSignOutConfirm={() => {
        setSignOutConfirmOpen(false)
        setMobileOpen(false)
        logout()
      }}
    >
      <AppRoutes
        view={view}
        goTo={goTo}
        profile={profile}
        setProfile={setProfile}
        registrationDetails={registrationDetails}
        setRegistrationDetails={setRegistrationDetails}
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
