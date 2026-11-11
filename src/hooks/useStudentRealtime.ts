import { useEffect, useState } from 'react'
import type { PortalNotification } from '../types'
import { DEMO_NOTIFICATIONS } from '../data'

export function useStudentRealtime() {
  const [notifications, setNotifications] = useState<PortalNotification[]>(() =>
    DEMO_NOTIFICATIONS.map((n) => ({ ...n }))
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, read: true } : n))
    )
  }

  const markAllRead = () => {
    setNotifications([])
  }

  useEffect(() => {
    // Realtime connection handler stub
  }, [])

  return {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    setNotifications,
  }
}
