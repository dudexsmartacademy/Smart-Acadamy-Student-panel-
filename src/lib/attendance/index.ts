import type { AttendanceStatus, SubjectAttendance } from '../../types'

export function calculateAttendancePercentage(present: number, conducted: number): number {
  if (conducted === 0) return 0
  return Math.round((present / conducted) * 100)
}

export function getAttendanceStatus(percentage: number): SubjectAttendance['status'] {
  if (percentage >= 85) return 'Safe'
  if (percentage >= 75) return 'Watch'
  return 'Critical'
}

export function getStatusBadgeClass(status: AttendanceStatus): string {
  switch (status) {
    case 'Present':
      return 'badge-success'
    case 'Absent':
      return 'badge-danger'
    case 'Late':
      return 'badge-warning'
    default:
      return 'badge-neutral'
  }
}
