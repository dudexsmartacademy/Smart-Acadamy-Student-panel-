import { studentService } from './studentService'
import type { AnnouncementItem } from '../types'

export const activityService = {
  getAnnouncements(): AnnouncementItem[] {
    return studentService.getAnnouncements()
  },
}
