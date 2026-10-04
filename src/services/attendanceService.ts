import { studentService } from './studentService'
import type { AttendanceRecord, SubjectAttendance, AttendanceCorrectionRequest } from '../types'

export const attendanceService = {
  getSubjectAttendance(): SubjectAttendance[] {
    return studentService.getSubjectAttendance()
  },
  getAttendanceRecords(): AttendanceRecord[] {
    return studentService.getAttendanceRecords()
  },
  getCorrectionRequests(): AttendanceCorrectionRequest[] {
    return studentService.getCorrectionRequests()
  },
  submitCorrectionRequest(req: Omit<AttendanceCorrectionRequest, 'request_id' | 'status' | 'submitted_at'>): AttendanceCorrectionRequest {
    return studentService.submitCorrectionRequest(req)
  },
}
