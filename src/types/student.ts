export type AccountStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended' | 'Inactive'

export interface StudentProfile {
  student_id: string
  full_name: string
  avatar?: string
  dob: string
  gender: string
  // Admin-managed academic fields
  college: string
  department: string
  specialization: string
  batch: string
  section: string
  academic_year: string
  rrn: string
  roll_number: string
  admission_number: string
  account_status: AccountStatus
  // Contact fields
  personal_email: string
  college_email: string
  whatsapp: string
  alternate_phone?: string
  address?: string
  // Professional fields
  github?: string
  linkedin?: string
  portfolio?: string
  skills: string[]
  career_interest: string
}

export type LiveClassStatus = 'Live Now' | 'Upcoming' | 'Completed' | 'Cancelled'

export interface LiveClass {
  live_class_id: string
  title: string
  teacher_name: string
  teacher_title?: string
  subject: string
  topic: string
  date: string
  start_time: string
  end_time: string
  platform: 'Google Meet' | 'Zoom' | 'Microsoft Teams'
  meeting_url: string
  status: LiveClassStatus
  mode: 'Online' | 'Hybrid' | 'Offline'
  notes_count?: number
  is_hero?: boolean
}

export interface NoteAttachment {
  type: 'image' | 'pdf'
  title: string
  url: string
  size?: string
}

export interface DailyNote {
  note_id: string
  date: string // e.g. "2026-08-28"
  formatted_date: string // e.g. "28 August 2026"
  title: string
  subject: string
  teacher_name: string
  description: string
  images: string[]
  pdf_url?: string
  pdf_name?: string
  attachments_count: number
  read_time?: string
  tags: string[]
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused' | 'Not Applicable'

export interface AttendanceRecord {
  record_id: string
  date: string
  formatted_date: string
  subject: string
  session_time: string
  teacher: string
  status: AttendanceStatus
  mode: 'Online' | 'Offline'
}

export interface SubjectAttendance {
  subject: string
  conducted: number
  present: number
  absent: number
  percentage: number
  status: 'Safe' | 'Watch' | 'Critical'
}

export interface AttendanceCorrectionRequest {
  request_id: string
  session_date: string
  subject: string
  current_status: AttendanceStatus
  requested_status: AttendanceStatus
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  submitted_at: string
}

export type AssessmentType = 'MCQ' | 'Coding' | 'Assignment' | 'Mixed'
export type AssessmentStatus = 'Active' | 'Upcoming' | 'Completed' | 'Expired' | 'Missed'

export interface Assessment {
  assessment_id: string
  title: string
  type: AssessmentType
  subject: string
  description: string
  duration_minutes: number
  total_questions: number
  max_marks: number
  start_date: string
  end_date: string
  attempts_allowed: number
  attempts_used: number
  status: AssessmentStatus
  score?: number
  percentage?: number
  grade?: string
}

export interface McqQuestion {
  id: number
  question: string
  codeSnippet?: string
  options: { label: string; text: string }[]
  correctOptionIndex?: number
  explanation?: string
}

export interface CodingTestCase {
  id: number
  input: string
  expectedOutput: string
  isHidden: boolean
}

export interface CodingProblem {
  problem_id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  description: string
  input_format: string
  output_format: string
  constraints: string[]
  examples: {
    input: string
    output: string
    explanation?: string
  }[]
  starter_code: Record<string, string> // language -> code
  test_cases: CodingTestCase[]
}

export interface ResultRecord {
  result_id: string
  assessment_title: string
  type: AssessmentType
  subject: string
  date: string
  score: number
  max_score: number
  percentage: number
  grade: string
  status: 'Passed' | 'Distinction' | 'Needs Review'
  correct_count?: number
  wrong_count?: number
  unanswered_count?: number
  time_used?: string
  feedback?: string
}

export interface NotificationItem {
  notification_id: string
  type: 'live_class' | 'note' | 'assessment' | 'result' | 'attendance' | 'announcement' | 'profile'
  title: string
  message: string
  timestamp: string
  read: boolean
  action_url?: string
}

export interface AnnouncementItem {
  announcement_id: string
  title: string
  sender_name: string
  sender_role: string
  date: string
  priority: 'High' | 'Normal' | 'Low'
  content: string
  target_class: string
}
