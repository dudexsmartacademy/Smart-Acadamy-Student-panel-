import React from 'react'
import type { View, StudentProfile, PortalNotification } from '../types'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { SignOutModal } from '../components/SignOutModal'
import { MobileBottomBar } from '../components/MobileBottomBar'

interface StudentLayoutProps {
  currentTitle: string
  view: View
  goTo: (v: View) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  notifications: PortalNotification[]
  unreadCount: number
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  profile: StudentProfile
  signOutConfirmOpen: boolean
  setSignOutConfirmOpen: (open: boolean) => void
  onSignOutConfirm: () => void
  children: React.ReactNode
}

export function StudentLayout({
  currentTitle,
  view,
  goTo,
  mobileOpen,
  setMobileOpen,
  notificationsOpen,
  setNotificationsOpen,
  notifications,
  unreadCount,
  markNotificationRead,
  markAllRead,
  profile,
  signOutConfirmOpen,
  setSignOutConfirmOpen,
  onSignOutConfirm,
  children,
}: StudentLayoutProps) {
  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar
        view={view}
        goTo={goTo}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onSignOutClick={() => setSignOutConfirmOpen(true)}
        profile={profile}
      />

      {/* Sign-Out Confirmation Modal */}
      <SignOutModal
        isOpen={signOutConfirmOpen}
        onClose={() => setSignOutConfirmOpen(false)}
        onConfirm={onSignOutConfirm}
      />

      {/* Main Content Shell */}
      <main className="main-content">
        <Header
          currentTitle={currentTitle}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          notifications={notifications}
          unreadCount={unreadCount}
          markNotificationRead={markNotificationRead}
          markAllRead={markAllRead}
          goTo={goTo}
          profile={profile}
        />

        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomBar view={view} goTo={goTo} />
    </div>
  )
}

export default StudentLayout
