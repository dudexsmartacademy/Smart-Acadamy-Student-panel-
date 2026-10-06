import { supabase } from '../lib/supabase'
import type {
  StudentProfile,
  LiveClass,
  DailyNote,
  AttendanceRecord,
  SubjectAttendance,
  AttendanceCorrectionRequest,
  Assessment,
  McqQuestion,
  CodingProblem,
  ResultRecord,
  NotificationItem,
  AnnouncementItem,
} from '../types/student'

// Default clean profile template for newly registered/authenticated students
export const defaultStudentProfile: StudentProfile = {
  student_id: 'STU-NEW',
  full_name: 'Student User',
  dob: '',
  gender: '',
  college: 'DudeX Academy',
  department: 'Computer Science & Engineering',
  specialization: 'Full Stack Development',
  batch: '2025–2029',
  section: 'Section A',
  academic_year: '1st Year (Semester 1)',
  rrn: 'RRN-000',
  roll_number: 'ROLL-000',
  admission_number: 'ADM-000',
  account_status: 'Approved',
  personal_email: 'student@dudex.edu.in',
  college_email: 'student@dudex.edu.in',
  whatsapp: '',
  skills: [],
  career_interest: '',
}

// In-Memory Data State (No localStorage reliance)
let cachedProfile: StudentProfile = defaultStudentProfile
let cachedLiveClasses: LiveClass[] = []
let cachedDailyNotes: DailyNote[] = []
let cachedAttendanceRecords: AttendanceRecord[] = []
let cachedSubjectAttendance: SubjectAttendance[] = []
let cachedCorrectionRequests: AttendanceCorrectionRequest[] = []
let cachedAssessments: Assessment[] = []
let cachedMcqQuestions: McqQuestion[] = []
let cachedCodingProblems: CodingProblem[] = []
let cachedResults: ResultRecord[] = []
let cachedAnnouncements: AnnouncementItem[] = []
let cachedNotifications: NotificationItem[] = []

export const studentService = {
  // --- Profile ---
  getProfile(): StudentProfile {
    return cachedProfile
  },

  async fetchProfileAsync(userId?: string): Promise<StudentProfile> {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
      if (!userId) return cachedProfile

      const { data, error } = await supabase
        .from('student_profiles')
        .select('*, profiles(*)')
        .eq('user_id', userId)
        .single()

      if (error || !data) return cachedProfile

      const profile: StudentProfile = {
        student_id: data.student_id || data.id || 'STU-001',
        full_name: data.profiles?.full_name || data.full_name || 'Student User',
        avatar: data.profiles?.avatar_url || data.avatar,
        dob: data.dob || '',
        gender: data.gender || '',
        college: data.college || 'DudeX Academy',
        department: data.department || 'Computer Science',
        specialization: data.specialization || 'Software Engineering',
        batch: data.batch || '2025–2029',
        section: data.section || 'A',
        academic_year: data.academic_year || '2026–27',
        rrn: data.rrn || '',
        roll_number: data.roll_number || '',
        admission_number: data.admission_number || '',
        account_status: data.account_status || 'Approved',
        personal_email: data.personal_email || '',
        college_email: data.college_email || data.profiles?.email || '',
        whatsapp: data.whatsapp || '',
        alternate_phone: data.alternate_phone,
        address: data.address,
        github: data.github,
        linkedin: data.linkedin,
        portfolio: data.portfolio,
        skills: data.skills || [],
        career_interest: data.career_interest || '',
      }

      cachedProfile = profile
      return profile
    } catch {
      return cachedProfile
    }
  },

  saveProfile(profile: Partial<StudentProfile>): StudentProfile {
    cachedProfile = { ...cachedProfile, ...profile }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('student_profiles').upsert({
          user_id: user.id,
          full_name: cachedProfile.full_name,
          dob: cachedProfile.dob,
          gender: cachedProfile.gender,
          whatsapp: cachedProfile.whatsapp,
          address: cachedProfile.address,
          github: cachedProfile.github,
          linkedin: cachedProfile.linkedin,
          portfolio: cachedProfile.portfolio,
          skills: cachedProfile.skills,
          career_interest: cachedProfile.career_interest,
        }).then()
      }
    })

    return cachedProfile
  },

  // --- Live Classes (Connected to Teacher / Admin Panel table `live_classes`) ---
  getLiveClasses(): LiveClass[] {
    return cachedLiveClasses
  },

  async fetchLiveClassesAsync(): Promise<LiveClass[]> {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data) return cachedLiveClasses

      const formatted: LiveClass[] = data.map((item) => ({
        live_class_id: item.id || item.live_class_id,
        title: item.title,
        teacher_name: item.teacher_name || 'Faculty',
        teacher_title: item.teacher_title,
        subject: item.subject,
        topic: item.topic || item.title,
        date: item.date || item.scheduled_date || 'Today',
        start_time: item.start_time || '10:00 AM',
        end_time: item.end_time || '11:00 AM',
        platform: item.platform || 'Google Meet',
        meeting_url: item.meeting_url || '#',
        status: item.status || 'Upcoming',
        mode: item.mode || 'Online',
        notes_count: item.notes_count || 0,
        is_hero: item.is_hero || false,
      }))

      cachedLiveClasses = formatted
      return formatted
    } catch {
      return cachedLiveClasses
    }
  },

  getHeroLiveClass(): LiveClass | undefined {
    return cachedLiveClasses.find((c) => c.status === 'Live Now') || cachedLiveClasses[0]
  },

  // --- Daily Notes / Materials (Connected to Teacher Panel table `notes`) ---
  getDailyNotes(): DailyNote[] {
    return cachedDailyNotes
  },

  async fetchDailyNotesAsync(): Promise<DailyNote[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*, note_attachments(*)')
        .order('created_at', { ascending: false })

      if (error || !data) return cachedDailyNotes

      const formatted: DailyNote[] = data.map((item) => ({
        note_id: item.id || item.note_id,
        date: item.date || new Date().toISOString().split('T')[0],
        formatted_date: item.formatted_date || item.date || 'Recent',
        title: item.title,
        subject: item.subject,
        teacher_name: item.teacher_name || 'Faculty',
        description: item.description || '',
        images: item.images || [],
        pdf_url: item.pdf_url,
        pdf_name: item.pdf_name,
        attachments_count: item.note_attachments?.length || item.attachments_count || 0,
        read_time: item.read_time || '5 min read',
        tags: item.tags || [item.subject],
      }))

      cachedDailyNotes = formatted
      return formatted
    } catch {
      return cachedDailyNotes
    }
  },

  getNoteById(id: string): DailyNote | undefined {
    return cachedDailyNotes.find((n) => n.note_id === id)
  },

  // --- Attendance (Connected to Teacher Panel table `attendance_records`) ---
  getSubjectAttendance(): SubjectAttendance[] {
    return cachedSubjectAttendance
  },

  getAttendanceRecords(): AttendanceRecord[] {
    return cachedAttendanceRecords
  },

  async fetchAttendanceAsync(): Promise<{ records: AttendanceRecord[]; summary: SubjectAttendance[] }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase.from('attendance_records').select('*').order('date', { ascending: false })
      if (user) {
        query = query.eq('student_id', user.id)
      }

      const { data, error } = await query

      if (error || !data) {
        return { records: cachedAttendanceRecords, summary: cachedSubjectAttendance }
      }

      const records: AttendanceRecord[] = data.map((item) => ({
        record_id: item.id || item.record_id,
        date: item.date,
        formatted_date: item.formatted_date || item.date,
        subject: item.subject,
        session_time: item.session_time || '10:00 AM',
        teacher: item.teacher || 'Faculty',
        status: item.status || 'Present',
        mode: item.mode || 'Online',
      }))

      const subjectMap: Record<string, { conducted: number; present: number; absent: number }> = {}
      records.forEach((r) => {
        if (!subjectMap[r.subject]) {
          subjectMap[r.subject] = { conducted: 0, present: 0, absent: 0 }
        }
        subjectMap[r.subject].conducted += 1
        if (r.status === 'Present' || r.status === 'Late') {
          subjectMap[r.subject].present += 1
        } else if (r.status === 'Absent') {
          subjectMap[r.subject].absent += 1
        }
      })

      const summary: SubjectAttendance[] = Object.keys(subjectMap).map((sub) => {
        const info = subjectMap[sub]
        const pct = info.conducted > 0 ? Math.round((info.present / info.conducted) * 100) : 100
        return {
          subject: sub,
          conducted: info.conducted,
          present: info.present,
          absent: info.absent,
          percentage: pct,
          status: pct >= 85 ? 'Safe' : pct >= 75 ? 'Watch' : 'Critical',
        }
      })

      cachedAttendanceRecords = records
      cachedSubjectAttendance = summary
      return { records, summary }
    } catch {
      return { records: cachedAttendanceRecords, summary: cachedSubjectAttendance }
    }
  },

  getCorrectionRequests(): AttendanceCorrectionRequest[] {
    return cachedCorrectionRequests
  },

  submitCorrectionRequest(req: Omit<AttendanceCorrectionRequest, 'request_id' | 'status' | 'submitted_at'>): AttendanceCorrectionRequest {
    const newReq: AttendanceCorrectionRequest = {
      ...req,
      request_id: `cr_${Date.now()}`,
      status: 'Pending',
      submitted_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    }

    cachedCorrectionRequests = [newReq, ...cachedCorrectionRequests]

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('attendance_correction_requests').insert({
          student_id: user.id,
          session_date: req.session_date,
          subject: req.subject,
          current_status: req.current_status,
          requested_status: req.requested_status,
          reason: req.reason,
          status: 'Pending',
        }).then()
      }
    })

    return newReq
  },

  // --- Assessments (Connected to Teacher / Admin Panel table `assessments`) ---
  getAssessments(): Assessment[] {
    return cachedAssessments
  },

  async fetchAssessmentsAsync(): Promise<Assessment[]> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data) return cachedAssessments

      const formatted: Assessment[] = data.map((item) => ({
        assessment_id: item.id || item.assessment_id,
        title: item.title,
        type: item.type || 'MCQ',
        subject: item.subject,
        description: item.description || '',
        duration_minutes: item.duration_minutes || 30,
        total_questions: item.total_questions || 10,
        max_marks: item.max_marks || 100,
        start_date: item.start_date || 'Today',
        end_date: item.end_date || 'Tomorrow',
        attempts_allowed: item.attempts_allowed || 1,
        attempts_used: item.attempts_used || 0,
        status: item.status || 'Active',
        score: item.score,
        percentage: item.percentage,
        grade: item.grade,
      }))

      cachedAssessments = formatted
      return formatted
    } catch {
      return cachedAssessments
    }
  },

  getAssessmentById(id: string): Assessment | undefined {
    return cachedAssessments.find((a) => a.assessment_id === id)
  },

  getMcqQuestions(): McqQuestion[] {
    return cachedMcqQuestions
  },

  getCodingProblems(): CodingProblem[] {
    return cachedCodingProblems
  },

  getCodingProblem(): CodingProblem | undefined {
    return cachedCodingProblems[0]
  },

  // --- Results (Connected to Teacher Panel table `results`) ---
  getResults(): ResultRecord[] {
    return cachedResults
  },

  async fetchResultsAsync(): Promise<ResultRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase.from('results').select('*').order('created_at', { ascending: false })
      if (user) {
        query = query.eq('student_id', user.id)
      }

      const { data, error } = await query

      if (error || !data) return cachedResults

      const formatted: ResultRecord[] = data.map((item) => ({
        result_id: item.id || item.result_id,
        assessment_title: item.assessment_title || item.title,
        type: item.type || 'MCQ',
        subject: item.subject,
        date: item.date || new Date().toISOString().split('T')[0],
        score: item.score,
        max_score: item.max_score,
        percentage: item.percentage,
        grade: item.grade,
        status: item.status || 'Passed',
        correct_count: item.correct_count,
        wrong_count: item.wrong_count,
        unanswered_count: item.unanswered_count,
        time_used: item.time_used,
        feedback: item.feedback,
      }))

      cachedResults = formatted
      return formatted
    } catch {
      return cachedResults
    }
  },

  // --- Announcements & Notifications (Connected to Admin Panel tables) ---
  getAnnouncements(): AnnouncementItem[] {
    return cachedAnnouncements
  },

  async fetchAnnouncementsAsync(): Promise<AnnouncementItem[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data) return cachedAnnouncements

      const formatted: AnnouncementItem[] = data.map((item) => ({
        announcement_id: item.id || item.announcement_id,
        title: item.title,
        sender_name: item.sender_name || 'Academy Administration',
        sender_role: item.sender_role || 'Admin',
        date: item.date || item.created_at,
        priority: item.priority || 'Normal',
        content: item.content,
        target_class: item.target_class || 'All Students',
      }))

      cachedAnnouncements = formatted
      return formatted
    } catch {
      return cachedAnnouncements
    }
  },

  getNotifications(): NotificationItem[] {
    return cachedNotifications
  },

  async fetchNotificationsAsync(): Promise<NotificationItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false })
      if (user) {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query

      if (error || !data) return cachedNotifications

      const formatted: NotificationItem[] = data.map((item) => ({
        notification_id: item.id || item.notification_id,
        type: item.type || 'announcement',
        title: item.title,
        message: item.message,
        timestamp: item.timestamp || item.created_at,
        read: item.read || false,
        action_url: item.action_url,
      }))

      cachedNotifications = formatted
      return formatted
    } catch {
      return cachedNotifications
    }
  },

  markAllNotificationsRead(): NotificationItem[] {
    cachedNotifications = cachedNotifications.map((n) => ({ ...n, read: true }))

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('notifications').update({ read: true }).eq('user_id', user.id).then()
      }
    })

    return cachedNotifications
  },
}
