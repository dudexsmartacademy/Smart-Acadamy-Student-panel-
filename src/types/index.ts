export * from './student'

export type View =
  | 'dashboard'
  | 'classes'
  | 'courses'
  | 'live'
  | 'notes'
  | 'note-detail'
  | 'mark-attendance'
  | 'assessments'
  | 'assessment-details'
  | 'hackerrank'
  | 'mcq'
  | 'coding'
  | 'attendance'
  | 'performance'
  | 'results'
  | 'materials'
  | 'calendar'
  | 'announcements'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'help'

export type RegistrationDetails = {
  full_name: string
  college_name: string
  college_email: string
  register_number: string
  phone_number: string
  course: string
  specialization: string
  batch_name: string
  section: string
  academic_year: string
}

export type PortalNotification = {
  notification_id: string
  title: string
  message: string
  timestamp: string
  read: boolean
}

export type AuthViewMode =
  | 'portal'
  | 'landing'
  | 'verify'
  | 'login'
  | 'signup'
  | 'forgot'
  | 'status'