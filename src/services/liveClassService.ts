import { studentService } from './studentService'
import type { LiveClass } from '../types'

export const liveClassService = {
  getLiveClasses(): LiveClass[] {
    return studentService.getLiveClasses()
  },
  getHeroLiveClass(): LiveClass | undefined {
    return studentService.getHeroLiveClass()
  },
}
