import { useEffect, useState } from 'react'
import type { PortalNotification } from '../types'
import { studentService } from '../services'
import { supabase } from '../lib/supabase'

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
    // Initial fetch from Supabase
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

    // Realtime Supabase Channels for cross-panel synchronization
    const channel = supabase
      .channel('dudex_student_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
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
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_classes' },
        () => {
          studentService.fetchLiveClassesAsync()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          studentService.fetchAnnouncementsAsync()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        () => {
          studentService.fetchDailyNotesAsync()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_records' },
        () => {
          studentService.fetchAttendanceAsync()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'results' },
        () => {
          studentService.fetchResultsAsync()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    setNotifications,
  }
}
