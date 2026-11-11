import { studentService } from './studentService'
import type { DailyNote } from '../types'

export const notesService = {
  getDailyNotes(): DailyNote[] {
    return studentService.getDailyNotes()
  },
  getNoteById(id: string): DailyNote | undefined {
    return studentService.getNoteById(id)
  },
}
