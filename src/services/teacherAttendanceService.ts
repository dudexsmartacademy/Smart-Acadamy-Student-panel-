import { studentService } from './studentService'

export const teacherAttendanceService = {
  getAttendanceRecords() {
    return studentService.getAttendanceRecords()
  },
}
