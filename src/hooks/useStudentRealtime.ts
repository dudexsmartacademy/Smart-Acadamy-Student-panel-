import { useEffect, useState } from 'react'
import type { PortalNotification } from '../types'
import { studentService } from '../services'

export function useStudentRealtime() {
  const [notifications, setNotifications] = useState<PortalNotification[]>(() =>
    studentService.getNotifications().map((n) => ({
      notification_id: n.notification_id,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp,
      read: n.read,
    }))
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, read: true } : n))
    )
  }

  const markAllRead = () => {
    setNotifications([])
    studentService.markAllNotificationsRead()
  }

  useEffect(() => {
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
  }, [])

  return {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    setNotifications,
  }
}
