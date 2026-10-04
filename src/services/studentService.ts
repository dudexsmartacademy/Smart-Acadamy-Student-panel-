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

export const studentService = {
  // --- Profile ---
  getProfile(): StudentProfile {
    const stored = localStorage.getItem('dudex_student_profile')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return defaultStudentProfile
  },

  async fetchProfileAsync(userId?: string): Promise<StudentProfile> {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
      if (!userId) return this.getProfile()

      const { data, error } = await supabase
        .from('student_profiles')
        .select('*, profiles(*)')
        .eq('user_id', userId)
        .single()

      if (error || !data) return this.getProfile()

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

      this.saveProfile(profile)
      return profile
    } catch {
      return this.getProfile()
    }
  },

  saveProfile(profile: Partial<StudentProfile>): StudentProfile {
    const current = this.getProfile()
    const updated = { ...current, ...profile }
    localStorage.setItem('dudex_student_profile', JSON.stringify(updated))

    // Async push to Supabase if available
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('student_profiles').upsert({
          user_id: user.id,
          full_name: updated.full_name,
          dob: updated.dob,
          gender: updated.gender,
          whatsapp: updated.whatsapp,
          address: updated.address,
          github: updated.github,
          linkedin: updated.linkedin,
          portfolio: updated.portfolio,
          skills: updated.skills,
          career_interest: updated.career_interest,
        }).then()
      }
    })

    return updated
  },

  // --- Live Classes ---
  getLiveClasses(): LiveClass[] {
    const stored = localStorage.getItem('dudex_live_classes')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  async fetchLiveClassesAsync(): Promise<LiveClass[]> {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data) return this.getLiveClasses()

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

      localStorage.setItem('dudex_live_classes', JSON.stringify(formatted))
      return formatted
    } catch {
      return this.getLiveClasses()
    }
  },

  getHeroLiveClass(): LiveClass | undefined {
    const classes = this.getLiveClasses()
    return classes.find((c) => c.status === 'Live Now') || classes[0]
  },

  // --- Daily Notes / Materials ---
  getDailyNotes(): DailyNote[] {
    const stored = localStorage.getItem('dudex_daily_notes')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  async fetchDailyNotesAsync(): Promise<DailyNote[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*, note_attachments(*)')
        .order('created_at', { ascending: false })

      if (error || !data) return this.getDailyNotes()

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

      localStorage.setItem('dudex_daily_notes', JSON.stringify(formatted))
      return formatted
    } catch {
      return this.getDailyNotes()
    }
  },

  getNoteById(id: string): DailyNote | undefined {
    return this.getDailyNotes().find((n) => n.note_id === id)
  },

  // --- Attendance ---
  getSubjectAttendance(): SubjectAttendance[] {
    const stored = localStorage.getItem('dudex_subject_attendance')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  getAttendanceRecords(): AttendanceRecord[] {
    const stored = localStorage.getItem('dudex_attendance_records')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  async fetchAttendanceAsync(): Promise<{ records: AttendanceRecord[]; summary: SubjectAttendance[] }> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false })

      if (error || !data) {
        return { records: this.getAttendanceRecords(), summary: this.getSubjectAttendance() }
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

      // Calculate subject attendance summary
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

      localStorage.setItem('dudex_attendance_records', JSON.stringify(records))
      localStorage.setItem('dudex_subject_attendance', JSON.stringify(summary))
      return { records, summary }
    } catch {
      return { records: this.getAttendanceRecords(), summary: this.getSubjectAttendance() }
    }
  },

  getCorrectionRequests(): AttendanceCorrectionRequest[] {
    const stored = localStorage.getItem('dudex_correction_requests')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  submitCorrectionRequest(req: Omit<AttendanceCorrectionRequest, 'request_id' | 'status' | 'submitted_at'>): AttendanceCorrectionRequest {
    const list = this.getCorrectionRequests()
    const newReq: AttendanceCorrectionRequest = {
      ...req,
      request_id: `cr_${Date.now()}`,
      status: 'Pending',
      submitted_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    }
    const updated = [newReq, ...list]
    localStorage.setItem('dudex_correction_requests', JSON.stringify(updated))

    // Sync to Supabase table if accessible
    supabase.from('attendance_correction_requests').insert({
      session_date: req.session_date,
      subject: req.subject,
      current_status: req.current_status,
      requested_status: req.requested_status,
      reason: req.reason,
      status: 'Pending',
    }).then()

    return newReq
  },

  // --- Assessments ---
  getAssessments(): Assessment[] {
    const stored = localStorage.getItem('dudex_assessments')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  async fetchAssessmentsAsync(): Promise<Assessment[]> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data) return this.getAssessments()

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

      localStorage.setItem('dudex_assessments', JSON.stringify(formatted))
      return formatted
    } catch {
      return this.getAssessments()
    }
  },

  getAssessmentById(id: string): Assessment | undefined {
    return this.getAssessments().find((a) => a.assessment_id === id)
  },

  getMcqQuestions(): McqQuestion[] {
    const stored = localStorage.getItem('dudex_mcq_questions')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  getCodingProblems(): CodingProblem[] {
    const stored = localStorage.getItem('dudex_coding_problems')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  getCodingProblem(): CodingProblem | undefined {
    const problems = this.getCodingProblems()
    return problems[0]
  },

  // --- Results ---
  getResults(): ResultRecord[] {
    const stored = localStorage.getItem('dudex_results')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  async fetchResultsAsync(): Promise<ResultRecord[]> {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data) return this.getResults()

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

      localStorage.setItem('dudex_results', JSON.stringify(formatted))
      return formatted
    } catch {
      return this.getResults()
    }
  },

  // --- Announcements & Notifications ---
  getAnnouncements(): AnnouncementItem[] {
    const stored = localStorage.getItem('dudex_announcements')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  async fetchAnnouncementsAsync(): Promise<AnnouncementItem[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data) return this.getAnnouncements()

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

      localStorage.setItem('dudex_announcements', JSON.stringify(formatted))
      return formatted
    } catch {
      return this.getAnnouncements()
    }
  },

  getNotifications(): NotificationItem[] {
    const stored = localStorage.getItem('dudex_notifications')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // fallback
      }
    }
    return []
  },

  async fetchNotificationsAsync(): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data) return this.getNotifications()

      const formatted: NotificationItem[] = data.map((item) => ({
        notification_id: item.id || item.notification_id,
        type: item.type || 'announcement',
        title: item.title,
        message: item.message,
        timestamp: item.timestamp || item.created_at,
        read: item.read || false,
        action_url: item.action_url,
      }))

      localStorage.setItem('dudex_notifications', JSON.stringify(formatted))
      return formatted
    } catch {
      return this.getNotifications()
    }
  },

  markAllNotificationsRead(): NotificationItem[] {
    const current = this.getNotifications().map((n) => ({ ...n, read: true }))
    localStorage.setItem('dudex_notifications', JSON.stringify(current))

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('notifications').update({ read: true }).eq('user_id', user.id).then()
      }
    })

    return current
  },
}
