import { studentService } from './studentService'
import type { NotificationItem } from '../types'

export const notificationService = {
  getNotifications(): NotificationItem[] {
    return studentService.getNotifications()
  },
}
