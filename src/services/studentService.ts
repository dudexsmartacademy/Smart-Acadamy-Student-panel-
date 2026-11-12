import type {
  StudentProfile,
  LiveClass,
  LiveClassStatus,
  DailyNote,
  AttendanceRecord,
  SubjectAttendance,
  TeacherAttendance,
  AttendanceCorrectionRequest,
  Assessment,
  McqQuestion,
  CodingProblem,
  ResultRecord,
  NotificationItem,
  AnnouncementItem,
} from '../types/student'

import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------------------
// Empty shell — real profile is loaded by AuthContext via Supabase.
// Kept here only so existing imports of `initialProfile` still compile.
// ---------------------------------------------------------------------------
/** @deprecated Use AuthContext profile instead. */
export const initialProfile: StudentProfile = {
  student_id: '',
  full_name: '',
  dob: '',
  gender: '',
  college: '',
  department: '',
  specialization: '',
  batch: '',
  section: '',
  academic_year: '',
  rrn: '',
  roll_number: '',
  admission_number: '',
  account_status: 'Inactive',
  personal_email: '',
  college_email: '',
  whatsapp: '',
  skills: [],
  career_interest: '',
}

// Live Classes — synced from Supabase
export let initialLiveClasses: LiveClass[] = []

// Daily Notes — synced from Supabase
export let initialDailyNotes: DailyNote[] = []

// Subject Attendance — synced from Supabase
export let initialSubjectAttendance: SubjectAttendance[] = []
export let initialTeacherAttendance: TeacherAttendance[] = []

// Date-wise Attendance Records — synced from Supabase
export let initialAttendanceRecords: AttendanceRecord[] = []

// Correction Requests
export let initialCorrectionRequests: AttendanceCorrectionRequest[] = []

// Assessments — synced from Supabase
export let initialAssessments: Assessment[] = []

// Results, announcements, notifications — synced from Supabase
export let initialResults: ResultRecord[] = []
export let initialAnnouncements: AnnouncementItem[] = []
export let initialNotifications: NotificationItem[] = []
export interface PortalCalendarEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  room?: string;
  description?: string;
}
export let initialCalendarEvents: PortalCalendarEvent[] = []

const formatDate = (value?: string | null) => {
  const d = value ? new Date(value) : null
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''
}

const toNotificationType = (type?: string | null): NotificationItem['type'] => {
  const t = String(type || '').toLowerCase()
  if (t.includes('live')) return 'live_class'
  if (t.includes('note')) return 'note'
  if (t.includes('assess') || t.includes('quiz') || t.includes('exam')) return 'assessment'
  if (t.includes('result')) return 'result'
  if (t.includes('attend')) return 'attendance'
  if (t.includes('profile')) return 'profile'
  return 'announcement'
}

// Note attachments are stored as object paths in the private `notes` bucket;
// replace them with short-lived signed URLs so the student can open them.
async function signNoteAttachmentUrls(notes: DailyNote[]): Promise<DailyNote[]> {
  const paths = new Set<string>()
  const isPath = (u?: string) => Boolean(u && !/^(https?:|data:|blob:)/i.test(u))
  for (const n of notes) {
    n.images.forEach((u) => isPath(u) && paths.add(u))
    n.documents?.forEach((d) => isPath(d.url) && paths.add(d.url as string))
    if (isPath(n.pdf_url)) paths.add(n.pdf_url as string)
  }
  if (paths.size === 0) return notes
  const { data, error } = await supabase.storage.from('notes').createSignedUrls([...paths], 60 * 60)
  if (error || !data) {
    console.error('Could not sign note attachment URLs:', error?.message)
    return notes
  }
  const signed = new Map(data.filter((d) => d.signedUrl).map((d) => [d.path as string, d.signedUrl]))
  const sign = (u?: string) => (u && signed.get(u)) || u
  return notes.map((n) => ({
    ...n,
    images: n.images.map((u) => sign(u) as string),
    documents: n.documents?.map((d) => ({ ...d, url: sign(d.url) })),
    pdf_url: sign(n.pdf_url),
  }))
}

// Attendance records (own rows only, enforced by RLS) and per-subject totals.
// DDL: attendance_records(id, session_id FK→class_sessions, student_id FK→student_profiles,
//   status attendance_status enum, marked_by FK→teacher_profiles, marked_at, remarks)
// Columns that do NOT exist: date, subject, session_time, teacher_name, mode
// We join class_sessions to get date/mode and teacher_profiles→profiles for teacher name.
async function loadAttendance(userId: string): Promise<void> {
  // Resolve student_profiles.id if available
  const { data: sp } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  const studentProfileId = (sp as Record<string, unknown> | null)?.id as string | undefined

  // 1. Direct query matching production live schema (student_id = auth.uid() / profiles.id)
  const idFilter = studentProfileId ? `student_id.eq.${userId},student_id.eq.${studentProfileId}` : `student_id.eq.${userId}`
  const { data: liveData, error: liveErr } = await supabase
    .from('attendance_records')
    .select('*')
    .or(idFilter)
    .order('created_at', { ascending: false })

  if (!liveErr && liveData) {
    const missingTeacherIds = [...new Set(
      liveData
        .filter((r: any) => (!r.teacher_name || !String(r.teacher_name).trim()) && r.teacher_id)
        .map((r: any) => r.teacher_id as string)
    )]

    const teacherNameMap = new Map<string, string>()
    if (missingTeacherIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', missingTeacherIds)
      if (profs) {
        profs.forEach((p: any) => {
          if (p.full_name) teacherNameMap.set(p.id, p.full_name)
        })
      }
    }

    initialAttendanceRecords = liveData.map((row: any) => {
      const sessionDate = row.date || (row.created_at ? row.created_at.split('T')[0] : '')
      const rawStatus = String(row.status || '').charAt(0).toUpperCase() + String(row.status || '').slice(1).toLowerCase()
      const resolvedTeacher = (row.teacher_name && String(row.teacher_name).trim())
        ? String(row.teacher_name).trim()
        : (row.teacher_id ? teacherNameMap.get(row.teacher_id) : null) || 'Faculty Member'
      return {
        record_id: row.id,
        date: sessionDate,
        formatted_date: formatDate(sessionDate),
        subject: row.subject || 'General',
        session_time: row.session_time || '',
        teacher: resolvedTeacher,
        status: (['Present', 'Absent', 'Late', 'Excused'].includes(rawStatus) ? rawStatus : 'Not Applicable') as AttendanceRecord['status'],
        mode: String(row.mode || '').toLowerCase() === 'online' ? 'Online' : 'Offline',
      }
    })
  } else {
    if (liveErr) {
      console.warn('Attendance load note:', liveErr.message)
    }
    initialAttendanceRecords = []
  }

  const bySubject = new Map<string, { conducted: number; present: number; absent: number }>()
  for (const r of initialAttendanceRecords) {
    const key = r.subject || 'General'
    const s = bySubject.get(key) || { conducted: 0, present: 0, absent: 0 }
    s.conducted += 1
    // Late counts as attended; excused sessions are not held against the student.
    if (r.status === 'Present' || r.status === 'Late' || r.status === 'Excused') s.present += 1
    else if (r.status === 'Absent') s.absent += 1
    bySubject.set(key, s)
  }
  initialSubjectAttendance = [...bySubject.entries()].map(([subject, s]) => {
    const percentage = s.conducted > 0 ? Math.round((s.present / s.conducted) * 100) : 0
    return {
      subject,
      ...s,
      percentage,
      status: percentage >= 75 ? 'Safe' : percentage >= 65 ? 'Watch' : 'Critical',
    }
  })

  const byTeacher = new Map<string, { conducted: number; present: number; absent: number }>()
  for (const r of initialAttendanceRecords) {
    const key = r.teacher || 'Faculty Member'
    const s = byTeacher.get(key) || { conducted: 0, present: 0, absent: 0 }
    s.conducted += 1
    if (r.status === 'Present' || r.status === 'Late' || r.status === 'Excused') s.present += 1
    else if (r.status === 'Absent') s.absent += 1
    byTeacher.set(key, s)
  }
  initialTeacherAttendance = [...byTeacher.entries()].map(([teacher, s]) => {
    const percentage = s.conducted > 0 ? Math.round((s.present / s.conducted) * 100) : 0
    return {
      teacher,
      ...s,
      percentage,
      status: percentage >= 75 ? 'Safe' : percentage >= 65 ? 'Watch' : 'Critical',
    }
  })
}

async function loadResults(studentProfileId: string, authUserId?: string, rrn?: string, studentName?: string): Promise<void> {
  const ids = Array.from(new Set([studentProfileId, authUserId].filter(Boolean))) as string[];
  let rows: any[] = [];

  try {
    if (ids.length > 0) {
      const res = await supabase
        .from('results')
        .select('*')
        .in('student_id', ids)
        .order('created_at', { ascending: false });
      if (res.data && res.data.length > 0) {
        rows = res.data;
      }
    }
  } catch (err) {
    console.warn('Targeted results query failed:', err);
  }

  // Fallback 1: Query by RRN if no rows found
  if (rows.length === 0 && rrn) {
    try {
      const res = await supabase
        .from('results')
        .select('*')
        .eq('student_id_code', rrn)
        .order('created_at', { ascending: false });
      if (res.data && res.data.length > 0) {
        rows = res.data;
      }
    } catch {}
  }

  // Fallback 2: Query by student_name if no rows found
  if (rows.length === 0 && studentName) {
    try {
      const res = await supabase
        .from('results')
        .select('*')
        .ilike('student_name', `%${studentName.trim()}%`)
        .order('created_at', { ascending: false });
      if (res.data && res.data.length > 0) {
        rows = res.data;
      }
    } catch {}
  }

  // Fallback 3: Query all allowed rows in session
  if (rows.length === 0) {
    try {
      const res = await supabase
        .from('results')
        .select('*')
        .order('created_at', { ascending: false });
      if (res.data && res.data.length > 0) {
        const filtered = res.data.filter((r: any) =>
          ids.includes(r.student_id) ||
          (rrn && r.student_id_code === rrn) ||
          (studentName && r.student_name && r.student_name.toLowerCase().includes(studentName.toLowerCase()))
        );
        rows = filtered.length > 0 ? filtered : res.data;
      }
    } catch {}
  }

  // Fetch assessments lookup so titles and subjects are always accurate
  const { data: assRows } = await supabase
    .from('assessments')
    .select('id, title, type, subject, max_marks');
  const assMap = new Map((assRows || []).map((a: any) => [a.id, a]));

  const resultsList: ResultRecord[] = [];
  const processedAssessmentIds = new Set<string>();

  if (rows.length > 0) {
    for (const row of rows) {
      const percentage = Number(row.percentage) || 0;
      const ass = assMap.get(row.assessment_id);
      const rawType = String(ass?.type || row.type || '').toLowerCase();
      const assessmentType = (rawType.includes('code') || rawType === 'coding' ? 'Coding' : rawType === 'hybrid' ? 'Mixed' : 'MCQ') as ResultRecord['type'];
      const isPassed = row.is_passed !== undefined ? Boolean(row.is_passed) : (String(row.status || '').toLowerCase() === 'passed' || percentage >= 40);

      if (row.assessment_id) {
        processedAssessmentIds.add(row.assessment_id);
      }

      resultsList.push({
        result_id: row.id,
        assessment_title: ass?.title || row.assessment_title || 'Assessment',
        type: assessmentType,
        subject: ass?.subject || row.subject || 'General',
        date: formatDate(row.published_at || row.date || row.created_at),
        score: Number(row.score ?? row.marks_obtained) || 0,
        max_score: Number(row.max_score ?? row.max_marks ?? ass?.max_marks) || 100,
        percentage,
        grade: row.grade || (percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : 'C'),
        status: !isPassed ? 'Needs Review' : percentage >= 85 ? 'Distinction' : 'Passed',
      });
    }
  }

  // Also include submissions from external_assessment_submissions (e.g. HackerRank)
  try {
    const { data: extSubs } = await supabase
      .from('external_assessment_submissions')
      .select('*')
      .in('student_id', ids)
      .order('submitted_at', { ascending: false });

    if (extSubs && extSubs.length > 0) {
      for (const sub of extSubs) {
        if (!processedAssessmentIds.has(sub.assessment_id)) {
          processedAssessmentIds.add(sub.assessment_id);
          const ass = assMap.get(sub.assessment_id);
          const score = Number(sub.verified_score ?? sub.reported_score) || 0;
          const maxScore = Number(ass?.max_marks) || 100;
          const percentage = Math.round((score / maxScore) * 100);
          const status: ResultRecord['status'] = sub.status === 'Verified' ? (percentage >= 75 ? 'Distinction' : 'Passed') : sub.status === 'Rejected' ? 'Needs Review' : (percentage >= 40 ? 'Passed' : 'Needs Review');
          const grade = percentage >= 85 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' : 'C';

          resultsList.push({
            result_id: sub.id,
            assessment_title: ass?.title || 'HackerRank Challenge',
            type: 'Coding',
            subject: ass?.subject || 'Coding Challenge',
            date: formatDate(sub.submitted_at),
            score,
            max_score: maxScore,
            percentage,
            grade,
            status,
          });
        }
      }
    }
  } catch (extErr) {
    console.warn('Error loading external submissions for results:', extErr);
  }

  // Also check student_attempts (MCQ attempts)
  try {
    const { data: mcqAttempts } = await supabase
      .from('student_attempts')
      .select('*')
      .in('student_id', ids)
      .order('submitted_at', { ascending: false });

    if (mcqAttempts && mcqAttempts.length > 0) {
      for (const att of mcqAttempts) {
        if (!processedAssessmentIds.has(att.assessment_id)) {
          processedAssessmentIds.add(att.assessment_id);
          const ass = assMap.get(att.assessment_id);
          const score = Number(att.score) || 0;
          const maxScore = Number(att.max_score || ass?.max_marks) || 100;
          const percentage = Number(att.percentage) || (maxScore > 0 ? Math.round((score / maxScore) * 100) : 0);
          const isPassed = percentage >= 40;

          resultsList.push({
            result_id: att.id,
            assessment_title: ass?.title || 'MCQ Examination',
            type: 'MCQ',
            subject: ass?.subject || 'Assessment',
            date: formatDate(att.submitted_at || att.created_at),
            score,
            max_score: maxScore,
            percentage,
            grade: percentage >= 85 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' : 'C',
            status: !isPassed ? 'Needs Review' : percentage >= 85 ? 'Distinction' : 'Passed',
          });
        }
      }
    }
  } catch (attErr) {
    console.warn('Error loading attempts for results:', attErr);
  }

  initialResults = resultsList;

  // Attach scores to the matching assessments.
  for (const res of initialResults) {
    const a = initialAssessments.find((x) => x.title === res.assessment_title || x.assessment_id === res.result_id);
    if (a) {
      a.score = res.score;
      a.percentage = res.percentage;
      a.grade = res.grade;
      a.status = 'Completed';
    }
  }

  window.dispatchEvent(new CustomEvent('dudex_results_changed'));
}

async function loadAnnouncements(studentBatch?: string): Promise<void> {
  let data: any[] | null = null;
  const res = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (res.error) {
    const fallback = await supabase.from('announcements').select('*');
    if (fallback.error) {
      console.warn('Could not load announcements:', fallback.error.message);
      initialAnnouncements = [];
      return;
    }
    data = fallback.data;
  } else {
    data = res.data;
  }

  const now = Date.now();
  initialAnnouncements = (data || [])
    .filter((row: any) => {
      const exp = row.expiry_date || row.expires_at;
      return !exp || new Date(exp).getTime() >= now;
    })
    .filter((row: any) => {
      const pub = row.date || row.publish_date || row.publish_at;
      return !pub || new Date(pub).getTime() <= now + 86400000;
    })
    .filter((row: any) => {
      if (!studentBatch) return true;
      const targetClass = String(row.target_class || row.scope || '').trim().toLowerCase();
      const batches: string[] = Array.isArray(row.batches) ? row.batches : [];
      if (
        batches.length === 0 ||
        targetClass === 'all students' ||
        targetClass === 'all batches' ||
        targetClass === 'all' ||
        batches.some((b) => b.toLowerCase().includes('all'))
      ) {
        return true;
      }
      const sBatchNorm = studentBatch.toLowerCase().trim();
      return (
        batches.some((b) => b.toLowerCase().trim() === sBatchNorm) ||
        targetClass.includes(sBatchNorm)
      );
    })
    .map((row: any) => {
      const senderName = row.sender_name || 'Faculty / Admin';
      const rawPriority = String(row.priority || 'Normal').toLowerCase();
      const priority = rawPriority === 'high' || rawPriority === 'urgent' ? 'High' : rawPriority === 'low' ? 'Low' : 'Normal';
      const pubDate = row.date || row.publish_date || row.publish_at || row.created_at;
      return {
        announcement_id: row.id,
        title: row.title || '',
        sender_name: senderName,
        sender_role: (row.sender_role || 'Faculty') as any,
        date: formatDate(pubDate as string),
        priority: priority as AnnouncementItem['priority'],
        content: row.content || '',
        target_class: String(row.target_class || row.scope || 'All Students'),
      };
    });
}

async function loadNotifications(userId: string): Promise<void> {
  let data: any[] | null = null;
  // Primary: query notifications for this user or broadcast notifications (user_id is null)
  const res1 = await supabase
    .from('notifications')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (!res1.error && res1.data) {
    data = res1.data;
  } else {
    const res2 = await supabase
      .from('notifications')
      .select('*')
      .or(`recipient_id.eq.${userId},recipient_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(100);
    if (!res2.error && res2.data) {
      data = res2.data;
    } else {
      console.warn('Could not load notifications:', res1.error?.message || res2.error?.message);
      data = [];
    }
  }

  const existingNotifs = (data || []).map((row: any) => ({
    notification_id: row.id,
    type: toNotificationType(row.type || row.notification_type),
    title: row.title || '',
    message: row.message || '',
    timestamp: formatDate(row.created_at || row.timestamp) || row.created_at || '',
    read: Boolean(row.read || row.is_read || row.read_at),
    action_url: row.action_url || row.link_url || undefined,
  }));

  // Also synthesize notifications for active announcements from Admin and Teacher
  const notifTitles = new Set(existingNotifs.map((n) => n.title.replace(/^📢\s*/, '').toLowerCase().trim()));
  const announcementNotifs: NotificationItem[] = [];

  for (const ann of initialAnnouncements) {
    const cleanTitle = ann.title.toLowerCase().trim();
    if (!notifTitles.has(cleanTitle)) {
      notifTitles.add(cleanTitle);
      announcementNotifs.push({
        notification_id: `ann-${ann.announcement_id}`,
        type: 'announcement',
        title: `📢 ${ann.title}`,
        message: ann.content.substring(0, 300),
        timestamp: ann.date,
        read: false,
      });
    }
  }

  initialNotifications = [...announcementNotifs, ...existingNotifs];
}

// Attempts already used per assessment (for "attempts left" and Completed state).
async function loadAttempts(studentProfileId: string): Promise<void> {
  const { data, error } = await supabase
    .from('student_attempts')
    .select('assessment_id')
    .eq('student_id', studentProfileId)
  if (error) return
  const used = new Map<string, number>()
  for (const row of data || []) used.set(row.assessment_id, (used.get(row.assessment_id) || 0) + 1)
  for (const a of initialAssessments) a.attempts_used = used.get(a.assessment_id) || 0
}

// Sync data from Supabase once a student session exists. Tables are not
// readable anonymously, so this re-runs on sign-in (see the listener below).
export const STUDENT_DATA_SYNCED_EVENT = 'dudex_student_data_synced'

export async function syncStudentData(): Promise<void> {
  {
    try {
      // 1. Live Classes
      let liveRows: any[] | null = null;
      const { data: liveData, error: liveErr } = await supabase
        .from('live_classes')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (liveErr) {
        console.warn('Could not load live classes:', liveErr.message);
      } else {
        liveRows = liveData;
      }

      initialLiveClasses = (liveRows || []).map((row: Record<string, unknown>) => {
        const meetingUrl = (row.meeting_url as string) || '';
        const normalizedStatus = String(row.status || '').toLowerCase();
        // Sessions stay "Upcoming" in the database; past dates are completed.
        const sessionDate = (row.scheduled_date as string) || (row.date as string) || '';
        const nowDate = new Date();
        const todayStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;
        const datedStatus: LiveClassStatus | null =
          (normalizedStatus === 'scheduled' || normalizedStatus === 'upcoming') && sessionDate && sessionDate < todayStr
            ? 'Completed'
            : null;
        const status: LiveClassStatus = datedStatus ?? (
          normalizedStatus === 'live now' || normalizedStatus === 'live'
            ? 'Live Now'
            : normalizedStatus === 'completed' || normalizedStatus === 'ended'
              ? 'Completed'
              : normalizedStatus === 'cancelled'
                ? 'Cancelled'
                : normalizedStatus === 'scheduled' || normalizedStatus === 'upcoming'
                  ? 'Upcoming'
                  : 'Unknown');

        // start_time / end_time are TIME values (HH:MM:SS), not timestamps
        const timeSlice = (v: unknown) => typeof v === 'string' ? v.slice(0, 5) : '';
        const meetingHost = meetingUrl.toLowerCase();
        const mp = String(row.meeting_platform || row.platform || '').toLowerCase();

        const teacherName = (row.teacher_name as string) || '';

        return {
          live_class_id: row.id as string,
          title: (row.title as string) || '',
          teacher_name: teacherName,
          subject: (row.subject as string) || (row.description as string) || 'General',
          topic: (row.topic as string) || (row.title as string) || '',
          date: (row.scheduled_date as string) || (row.date as string) || '',
          start_time: timeSlice(row.start_time),
          end_time: timeSlice(row.end_time),
          platform: meetingHost.includes('zoom') || mp.includes('zoom')
            ? 'Zoom'
            : meetingHost.includes('teams') || mp.includes('teams')
              ? 'Microsoft Teams'
              : meetingHost.includes('meet.google') || mp.includes('meet')
                ? 'Google Meet'
                : 'Unknown',
          meeting_url: meetingUrl,
          status,
          mode: 'Online' as const,
          is_hero: status === 'Live Now',
          location: (row.location as string) || (row.room as string) || undefined,
          room: (row.room as string) || (row.location as string) || undefined,
        };
      });

      // 2. Assessments (RLS returns only published assessments for the
      // student's classes/batch).
      let { data: assData, error: assError } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (assError) {
        console.warn('Could not load assessments:', assError.message);
      }

      const now = Date.now();
      initialAssessments = (assData || []).map((row: any) => {
        const rawStart = row.start_date || row.start_at;
        const rawEnd = row.end_date || row.end_at;
        const startsAt = rawStart ? new Date(rawStart).getTime() : null;
        const endsAt = rawEnd ? new Date(rawEnd).getTime() : null;
        const dbStatus = String(row.status || '').toLowerCase();
        const status: Assessment['status'] =
          dbStatus === 'closed' || dbStatus === 'completed' || dbStatus === 'archived'
            ? 'Completed'
            : endsAt !== null && now > endsAt
              ? 'Expired'
              : startsAt !== null && now < startsAt
                ? 'Upcoming'
                : 'Active';
        const durationMins = typeof row.duration_minutes === 'number' ? row.duration_minutes : typeof row.duration_seconds === 'number' ? Math.round(row.duration_seconds / 60) : 30;
        const rawType = String(row.type || '').toLowerCase();
        const mappedType: Assessment['type'] = rawType.includes('code') || rawType === 'coding' ? 'Coding' : rawType === 'hybrid' ? 'Mixed' : 'MCQ';
        return {
          assessment_id: row.id,
          title: row.title || '',
          type: mappedType,
          subject: row.subject || row.subject_name || row.course_name || 'General',
          description: row.description || '',
          duration_minutes: durationMins,
          total_questions: typeof row.total_questions === 'number' ? row.total_questions : null,
          max_marks: typeof row.max_marks === 'number' ? row.max_marks : null,
          start_date: rawStart || '',
          end_date: rawEnd || '',
          attempts_allowed: typeof row.attempts_allowed === 'number' ? row.attempts_allowed : 1,
          attempts_used: 0,
          status,
          score: undefined,
          percentage: undefined,
          grade: undefined,
          provider: row.provider || 'internal',
          external_url: row.external_url || undefined,
        };
      });

      // 3. Per-student data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sp } = await supabase
          .from('student_profiles')
          .select('id, register_number, roll_number, profiles(full_name)')
          .eq('user_id', user.id)
          .maybeSingle();
        const studentProfileId = (sp as Record<string, unknown> | null)?.id as string | undefined;
        const studentRrn = ((sp as any)?.register_number || (sp as any)?.roll_number) as string | undefined;
        const studentName = ((sp as any)?.profiles?.full_name || user.user_metadata?.full_name) as string | undefined;

        await loadAttendance(user.id);
        await loadAnnouncements((sp as any)?.batch_name);
        await loadNotifications(user.id);
        await loadResults(studentProfileId || user.id, user.id, studentRrn, studentName);
        if (studentProfileId) {
          await loadAttempts(studentProfileId);
        }
      }

      // 3. Notes
      let notesData: any[] | null = null;
      let { data: primaryNotes, error: notesResError } = await supabase
        .from('notes')
        .select(`
          *,
          classes (name),
          note_attachments (*)
        `)
        .order('created_at', { ascending: false });

      if (notesResError) {
        const notesFallback = await supabase
          .from('notes')
          .select('*, note_attachments(*)')
          .order('created_at', { ascending: false });
        if (notesFallback.error) {
          const directFallback = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false });
          notesData = directFallback.data || [];
        } else {
          notesData = notesFallback.data;
        }
      } else {
        notesData = primaryNotes;
      }

      if (Array.isArray(notesData)) {
        initialDailyNotes = (notesData || []).map((row: any) => {
          const attachments = Array.isArray(row.note_attachments) ? row.note_attachments : [];
          const images = attachments
            .filter((attachment: any) => attachment.file_type?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(attachment.file_name || ''))
            .map((attachment: any) => attachment.file_url || attachment.file_path || '');
          const documents = attachments
            .filter((attachment: any) => !attachment.file_type?.startsWith('image/') && !/\.(png|jpe?g|gif|webp)$/i.test(attachment.file_name || ''))
            .map((attachment: any) => ({
              id: attachment.id,
              name: attachment.file_name || '',
              type: attachment.file_type?.includes('pdf') || /\.pdf$/i.test(attachment.file_name || '') ? 'pdf' : 'doc',
              url: attachment.file_url || attachment.file_path || '',
            }));
          const pdfDoc = attachments.find((attachment: any) => attachment.file_type?.includes('pdf') || /\.pdf$/i.test(attachment.file_name || ''));
          const dateObj = row.date || row.created_at ? new Date(row.date || row.created_at) : null;
          const dateStr = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '';
          const formattedDate = dateObj && !Number.isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : '';
          const teacherName = row.teacher_name || row.teacher_profiles?.profiles?.full_name || 'Faculty Member';

          return {
            note_id: row.id,
            title: row.title || '',
            subject: row.subject || (row.classes as { name?: string } | null)?.name || 'General',
            teacher_name: teacherName,
            description: row.description || '',
            date: dateStr,
            formatted_date: formattedDate,
            images: images.length > 0 ? images : (Array.isArray(row.images) ? row.images : (row.image_url ? [row.image_url] : [])),
            pdf_url: pdfDoc?.file_url || documents[0]?.url || row.pdf_url || undefined,
            pdf_name: pdfDoc?.file_name || documents[0]?.name || row.pdf_name || undefined,
            documents,
            attachments_count: attachments.length,
            tags: [(row.classes as { name?: string } | null)?.name || 'General'].filter(Boolean),
          };
        });
        initialDailyNotes = await signNoteAttachmentUrls(initialDailyNotes);
        window.dispatchEvent(new CustomEvent('dudex_notes_changed'));
      }

      // Calendar Events sync
      try {
        const { data: calData } = await supabase.from('calendar_events').select('*').order('start_date', { ascending: true });
        initialCalendarEvents = (calData || []).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          title: (row.title as string) || 'Event',
          type: (row.type as string) || (row.event_type as string) || 'Event',
          date: ((row.start_date as string) || (row.date as string) || '').split('T')[0],
          start_time: (row.start_time as string) || undefined,
          end_time: (row.end_time as string) || undefined,
          location: (row.location as string) || (row.room as string) || undefined,
          room: (row.room as string) || (row.location as string) || undefined,
          description: (row.description as string) || undefined,
        }));
      } catch (calErr) {
        console.warn('Could not load calendar events:', calErr);
      }
    } catch (err) {
      console.error('Student portal background sync failed:', err);
      initialLiveClasses = [];
      initialAssessments = [];
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STUDENT_DATA_SYNCED_EVENT))
  }
}

if (typeof window !== 'undefined') {
  // Sync once per signed-in user; SIGNED_IN also fires on every tab focus.
  let syncedForUser: string | null = null
  supabase.auth.onAuthStateChange((event, session) => {
    if (!session) {
      syncedForUser = null
      return
    }
    if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session.user.id !== syncedForUser) {
      syncedForUser = session.user.id
      setTimeout(() => void syncStudentData(), 0)
    }
  })

  // Realtime subscription for announcements and notifications
  try {
    supabase
      .channel('student-portal-announcements-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          void syncStudentData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          void syncStudentData()
        }
      )
      .subscribe()
  } catch (err) {
    console.error('Failed to subscribe to realtime announcements:', err)
  }

  // Cross-portal / cross-tab broadcast listeners
  window.addEventListener('dudex_announcements_changed', () => {
    void syncStudentData()
  })
  window.addEventListener('storage', (event) => {
    if (event.key === 'dudex_announcements_sync') {
      void syncStudentData()
    }
  })

  // Periodic polling fallback (every 8 seconds) so announcements always show up even if Realtime reconnects
  setInterval(() => {
    void syncStudentData()
  }, 8000)
}

// Questions of the assessment currently being taken. Loaded from the
// student-safe views, which never include the correct answers; grading
// happens on the server in submit_assessment_attempt.
export let mcqQuestionsList: McqQuestion[] = [];
let mcqQuestionIds: string[] = [];
let mcqOptionIds: string[][] = [];
export let initialCodingProblems: CodingProblem[] = [];
export let initialCodingProblem: CodingProblem | undefined = undefined

export interface ExternalSubmission {
  id: string
  assessment_id: string
  reported_score: number
  screenshot_path: string
  screenshot_url: string | null
  status: 'Pending' | 'Verified' | 'Rejected'
  verified_score: number | null
  review_note: string | null
  submitted_at: string
}

export interface McqSubmissionResult {
  score: number
  max_score: number
  percentage: number
  grade: string
  status: string
  correct: number
  wrong: number
  unanswered: number
  time_used: string
}

async function loadAssessmentQuestions(assessmentId: string): Promise<McqQuestion[]> {
  const { data: questions, error } = await supabase
    .from('student_assessment_questions')
    .select('id, question_text, code_snippet, order_index')
    .eq('assessment_id', assessmentId)
    .order('order_index', { ascending: true })
  if (error) throw new Error(`Could not load questions: ${error.message}`)

  const ids = (questions || []).map((q) => q.id as string)
  const { data: options, error: optError } = ids.length
    ? await supabase
        .from('student_question_options')
        .select('id, question_id, option_label, option_text')
        .in('question_id', ids)
        .order('option_label', { ascending: true })
    : { data: [], error: null }
  if (optError) throw new Error(`Could not load answer options: ${optError.message}`)

  mcqQuestionIds = ids
  mcqOptionIds = ids.map((qid) => (options || []).filter((o) => o.question_id === qid).map((o) => o.id as string))
  mcqQuestionsList = (questions || []).map((q, idx) => ({
    id: idx + 1,
    question: q.question_text || '',
    codeSnippet: q.code_snippet || undefined,
    options: (options || [])
      .filter((o) => o.question_id === q.id)
      .map((o) => ({ label: o.option_label || '', text: o.option_text || '' })),
  }))
  return mcqQuestionsList
}

async function loadCodingProblems(assessmentId?: string): Promise<CodingProblem[]> {
  let query = supabase
    .from('student_coding_problems')
    .select('id, assessment_id, title, description, difficulty, language, starter_code, public_examples')
  if (assessmentId) query = query.eq('assessment_id', assessmentId)
  const { data, error } = await query
  if (error) throw new Error(`Could not load coding problems: ${error.message}`)
  initialCodingProblems = (data || []).map((row) => {
    const examples = Array.isArray(row.public_examples) ? row.public_examples : []
    const difficulty = String(row.difficulty || 'Medium')
    return {
      problem_id: row.id,
      title: row.title || '',
      difficulty: (['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium') as CodingProblem['difficulty'],
      description: row.description || '',
      input_format: '',
      output_format: '',
      constraints: [],
      examples: examples.map((e: { input?: string; output?: string; explanation?: string }) => ({
        input: String(e.input ?? ''),
        output: String(e.output ?? ''),
        explanation: e.explanation,
      })),
      starter_code: row.starter_code ? { [row.language || 'javascript']: row.starter_code } : {},
      // Hidden test cases stay on the server; only public examples are shown.
      test_cases: [],
    }
  })
  initialCodingProblem = initialCodingProblems[0]
  return initialCodingProblems
}

export interface EnrolledClass {
  id: string;
  name: string;
  collegeName: string;
  department: string;
  batch: string;
  section: string;
  academicYear: string;
  teacherName?: string;
  teacherEmail?: string;
}

// Service Layer Abstractions (Supabase Ready)
export const studentService = {
  syncStudentData,
  // Enrolled Classes from Supabase
  async getEnrolledClasses(): Promise<EnrolledClass[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: memberships, error } = await supabase
        .from('class_memberships')
        .select(`
          class_id,
          classes (
            id,
            name,
            college_name,
            department,
            batch,
            section,
            academic_year,
            teacher_id,
            profiles (full_name, email)
          )
        `)
        .eq('student_id', user.id);

      if (error) {
        console.warn('Could not load class memberships directly, trying direct classes query:', error.message);
      }

      const enrolled: EnrolledClass[] = [];
      const seen = new Set<string>();

      (memberships || []).forEach((m: any) => {
        const cls = m.classes;
        if (cls && !seen.has(cls.id)) {
          seen.add(cls.id);
          enrolled.push({
            id: cls.id,
            name: cls.name || 'Enrolled Class',
            collegeName: cls.college_name || '',
            department: cls.department || '',
            batch: cls.batch || '',
            section: cls.section || '',
            academicYear: cls.academic_year || '',
            teacherName: cls.profiles?.full_name || 'Faculty Lead',
            teacherEmail: cls.profiles?.email || '',
          });
        }
      });

      // If memberships yielded no rows, query classes table directly (allowed by RLS)
      if (enrolled.length === 0) {
        const { data: directClasses } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            college_name,
            department,
            batch,
            section,
            academic_year,
            teacher_id,
            profiles (full_name, email)
          `);

        (directClasses || []).forEach((cls: any) => {
          if (cls && !seen.has(cls.id)) {
            seen.add(cls.id);
            enrolled.push({
              id: cls.id,
              name: cls.name || 'Enrolled Class',
              collegeName: cls.college_name || '',
              department: cls.department || '',
              batch: cls.batch || '',
              section: cls.section || '',
              academicYear: cls.academic_year || '',
              teacherName: cls.profiles?.full_name || 'Faculty Lead',
              teacherEmail: cls.profiles?.email || '',
            });
          }
        });
      }

      return enrolled;
    } catch (err) {
      console.error('Could not fetch enrolled classes:', err);
      return [];
    }
  },

  // Profile - delegated to AuthContext via Supabase
  getProfile(): StudentProfile {
    return initialProfile
  },
  saveProfile(profile: Partial<StudentProfile>): StudentProfile {
    return { ...initialProfile, ...profile }
  },

  // Live Classes
  getLiveClasses(): LiveClass[] {
    return initialLiveClasses
  },
  getHeroLiveClass(): LiveClass | undefined {
    return initialLiveClasses.find((c) => c.status === 'Live Now') || initialLiveClasses.find((c) => c.status === 'Upcoming') || initialLiveClasses[0]
  },

  // Daily Notes
  getCalendarEvents(): PortalCalendarEvent[] {
    return initialCalendarEvents;
  },
  getDailyNotes(): DailyNote[] {
    return initialDailyNotes
  },
  async fetchDailyNotes(): Promise<DailyNote[]> {
    try {
      let notesData: any = null;
      let { data: primaryNotes, error: notesError } = await supabase
        .from('notes')
        .select(`
          *,
          classes (name),
          note_attachments (*)
        `)
        .order('created_at', { ascending: false });

      if (notesError) {
        const fallback = await supabase
          .from('notes')
          .select('*, note_attachments(*)')
          .order('created_at', { ascending: false });
        if (fallback.error) {
          const directFallback = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false });
          notesData = directFallback.data || [];
        } else {
          notesData = fallback.data;
        }
      } else {
        notesData = primaryNotes;
      }

      if (Array.isArray(notesData)) {
        initialDailyNotes = notesData.map((row: any) => {
          const attachments = Array.isArray(row.note_attachments) ? row.note_attachments : [];
          const images = attachments
            .filter((a: any) => a.file_type?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(a.file_name || ''))
            .map((a: any) => a.file_url || a.file_path || '');
          const documents = attachments
            .filter((a: any) => !a.file_type?.startsWith('image/') && !/\.(png|jpe?g|gif|webp)$/i.test(a.file_name || ''))
            .map((a: any) => ({
              name: a.file_name || '',
              type: a.file_type?.includes('pdf') || /\.pdf$/i.test(a.file_name || '') ? 'PDF' : 'DOC',
              url: a.file_url || a.file_path || '',
            }));
          const pdfDoc = attachments.find((a: any) => a.file_type?.includes('pdf') || /\.pdf$/i.test(a.file_name || ''));

          const dateObj = row.date || row.created_at ? new Date(row.date || row.created_at) : null;
          const dateStr = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '';
          const formattedDate = dateObj && !Number.isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : '';
          const teacherName = row.teacher_name || row.teacher_profiles?.profiles?.full_name || 'Faculty Member';

          return {
            note_id: row.id,
            title: row.title || '',
            subject: row.subject || (row.classes as { name?: string } | null)?.name || 'General',
            teacher_name: teacherName,
            description: row.description || '',
            date: dateStr,
            formatted_date: formattedDate,
            images: images.length > 0 ? images : (Array.isArray(row.images) ? row.images : (row.image_url ? [row.image_url] : [])),
            pdf_url: pdfDoc?.file_url || (documents[0]?.url) || row.pdf_url || undefined,
            pdf_name: pdfDoc?.file_name || (documents[0]?.name) || row.pdf_name || undefined,
            documents,
            attachments_count: attachments.length,
            tags: [(row.classes as { name?: string } | null)?.name || 'General'].filter(Boolean),
          };
        });
        initialDailyNotes = await signNoteAttachmentUrls(initialDailyNotes);
        window.dispatchEvent(new CustomEvent('dudex_notes_changed'));
      } else {
        initialDailyNotes = [];
      }
    } catch (err) {
      console.error('fetchDailyNotes failed:', err);
      initialDailyNotes = [];
      throw err instanceof Error ? err : new Error('Could not load student notes.');
    }
    return initialDailyNotes;
  },
  getNoteById(id: string): DailyNote | undefined {
    return initialDailyNotes.find((n) => n.note_id === id)
  },

  // Attendance
  getSubjectAttendance(): SubjectAttendance[] {
    return initialSubjectAttendance
  },
  getTeacherAttendance(): TeacherAttendance[] {
    return initialTeacherAttendance
  },
  getAttendanceRecords(): AttendanceRecord[] {
    return initialAttendanceRecords
  },
  getCorrectionRequests(): AttendanceCorrectionRequest[] {
    return initialCorrectionRequests
  },
  submitCorrectionRequest(req: Omit<AttendanceCorrectionRequest, 'request_id' | 'status' | 'submitted_at'>): AttendanceCorrectionRequest {
    const newReq: AttendanceCorrectionRequest = {
      ...req,
      request_id: `cr_${Date.now()}`,
      status: 'Pending',
      submitted_at: new Date().toLocaleDateString('en-GB'),
    }
    return newReq
  },

  // Assessments
  getAssessments(): Assessment[] {
    return initialAssessments
  },
  getAssessmentById(id: string): Assessment | undefined {
    return initialAssessments.find((a) => a.assessment_id === id)
  },
  getMcqQuestions(): McqQuestion[] {
    return mcqQuestionsList
  },
  fetchAssessmentQuestions(assessmentId: string): Promise<McqQuestion[]> {
    return loadAssessmentQuestions(assessmentId)
  },
  /**
   * Submits answers (question index -> option index) to the server, which
   * grades them and records the attempt and result.
   */
  async submitMcqAttempt(
    assessmentId: string,
    answers: Record<number, number>,
    timeUsedSec: number
  ): Promise<McqSubmissionResult> {
    const payload: Record<string, string> = {}
    for (const [qIdx, optIdx] of Object.entries(answers)) {
      const questionId = mcqQuestionIds[Number(qIdx)]
      const optionId = mcqOptionIds[Number(qIdx)]?.[optIdx]
      if (questionId && optionId) payload[questionId] = optionId
    }
    const { data, error } = await supabase.rpc('submit_assessment_attempt', {
      p_assessment_id: assessmentId,
      p_answers: payload,
      p_time_used_seconds: Math.max(0, Math.round(timeUsedSec)),
    })
    if (error) throw new Error(error.message)

    const result = data as { attempt_id: string; score: number; max_score: number; percentage: number; grade: string; status: string }
    const { data: row } = await supabase
      .from('results')
      .select('correct_count, wrong_count, unanswered_count, time_used')
      .eq('attempt_id', result.attempt_id)
      .maybeSingle()
    void syncStudentData()
    return {
      score: Number(result.score) || 0,
      max_score: Number(result.max_score) || 0,
      percentage: Number(result.percentage) || 0,
      grade: result.grade,
      status: result.status,
      correct: row?.correct_count ?? 0,
      wrong: row?.wrong_count ?? 0,
      unanswered: row?.unanswered_count ?? 0,
      time_used: row?.time_used || '',
    }
  },
  getCodingProblems(): CodingProblem[] {
    return initialCodingProblems
  },
  getCodingProblem(): CodingProblem | undefined {
    return initialCodingProblem
  },
  fetchCodingProblems(assessmentId?: string): Promise<CodingProblem[]> {
    return loadCodingProblems(assessmentId)
  },
  /** The student's own self-reported result for an external (HackerRank) assessment. */
  async getExternalSubmission(assessmentId: string): Promise<ExternalSubmission | null> {
    const { data, error } = await supabase
      .from('external_assessment_submissions')
      .select('id, assessment_id, reported_score, screenshot_path, status, verified_score, review_note, submitted_at')
      .eq('assessment_id', assessmentId)
      .maybeSingle()
    if (error) throw new Error(`Could not load your submission: ${error.message}`)
    if (!data) return null
    let screenshotUrl: string | null = null;
    if (data.screenshot_path) {
      if (data.screenshot_path.startsWith('http://') || data.screenshot_path.startsWith('https://')) {
        screenshotUrl = data.screenshot_path;
      } else {
        const { data: signed } = await supabase.storage
          .from('hackerrank-results')
          .createSignedUrl(data.screenshot_path, 60 * 60 * 24);
        screenshotUrl = signed?.signedUrl || null;
        if (!screenshotUrl) {
          const { data: pub } = supabase.storage
            .from('hackerrank-results')
            .getPublicUrl(data.screenshot_path);
          screenshotUrl = pub?.publicUrl || null;
        }
      }
    }
    return { ...(data as ExternalSubmission), screenshot_url: screenshotUrl };
  },
  /**
   * Uploads the HackerRank result screenshot (private bucket, folder = user id)
   * and records the self-reported score for teacher verification.
   */
  async submitExternalResult(assessmentId: string, score: number, screenshot: File): Promise<ExternalSubmission> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Sign in again to submit your result.')
    const ext = (screenshot.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `${user.id}/${assessmentId}-${Date.now()}.${ext || 'png'}`
    const { error: uploadError } = await supabase.storage
      .from('hackerrank-results')
      .upload(path, screenshot, { contentType: screenshot.type, upsert: false })
    if (uploadError) throw new Error(`Could not upload the screenshot: ${uploadError.message}`)

    const { error } = await supabase.from('external_assessment_submissions').insert({
      assessment_id: assessmentId,
      student_id: user.id,
      reported_score: score,
      screenshot_path: path,
    })
    if (error) {
      await supabase.storage.from('hackerrank-results').remove([path])
      throw new Error(
        error.code === '23505' ? 'You have already submitted a result for this assessment.' : `Could not submit your result: ${error.message}`
      )
    }
    const saved = await this.getExternalSubmission(assessmentId)
    if (!saved) throw new Error('Your result was submitted but could not be reloaded. Refresh the page.')
    return saved
  },
  /** Saves a coding solution for teacher evaluation (code_submissions). */
  async submitCode(problemId: string, _assessmentId: string | null, language: string, sourceCode: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Sign in again to submit your solution.')

    const { data: sp } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    const studentProfileId = (sp as Record<string, unknown> | null)?.id as string | undefined
    if (!studentProfileId) throw new Error('Student profile not found.')

    const normalizedLang = (language.toLowerCase() === 'python' ? 'python' :
      language.toLowerCase() === 'javascript' ? 'javascript' :
      language.toLowerCase() === 'typescript' ? 'typescript' :
      language.toLowerCase() === 'java' ? 'java' :
      language.toLowerCase() === 'c' ? 'c' :
      language.toLowerCase() === 'sql' ? 'sql' : 'cpp') as any

    const { error } = await supabase.from('code_submissions').insert({
      coding_problem_id: problemId,
      student_id: studentProfileId,
      language: normalizedLang,
      code: sourceCode,
      status: 'pending',
    })
    if (error) throw new Error(`Could not submit solution: ${error.message}`)
  },

  // Results & Performance
  getResults(): ResultRecord[] {
    return initialResults
  },

  // Notifications & Announcements
  getAnnouncements(): AnnouncementItem[] {
    return initialAnnouncements
  },
  getNotifications(): NotificationItem[] {
    return initialNotifications
  },
  async markNotificationRead(id: string): Promise<void> {
    const isAnn = id.startsWith('ann-');
    const annId = isAnn ? id.replace(/^ann-/, '') : null;
    if (!isAnn) {
      await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', id);
    }
    let targetAnnId = annId;
    if (!targetAnnId) {
      const notif = initialNotifications.find((n) => n.notification_id === id);
      if (notif) {
        const cleanNotifTitle = notif.title.replace(/^[\u{1F4E2}\s]+/u, '').trim().toLowerCase();
        const found = initialAnnouncements.find((a) => a.title.trim().toLowerCase() === cleanNotifTitle);
        if (found) targetAnnId = found.announcement_id;
      }
    }
    if (targetAnnId) {
      try {
        const { data: currentAnn } = await supabase.from('announcements').select('views_count').eq('id', targetAnnId).maybeSingle();
        const nextViews = (Number(currentAnn?.views_count) || 0) + 1;
        await supabase.from('announcements').update({ views_count: nextViews }).eq('id', targetAnnId);
      } catch {}
    }
    initialNotifications = initialNotifications.map((n) => (n.notification_id === id ? { ...n, read: true } : n));
  },
  async markAllNotificationsRead(): Promise<NotificationItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('user_id', user.id).is('read_at', null);
      await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('recipient_id', user.id).is('read_at', null);
    }
    for (const ann of initialAnnouncements) {
      try {
        const { data: currentAnn } = await supabase.from('announcements').select('views_count').eq('id', ann.announcement_id).maybeSingle();
        const nextViews = (Number(currentAnn?.views_count) || 0) + 1;
        await supabase.from('announcements').update({ views_count: nextViews }).eq('id', ann.announcement_id);
      } catch {}
    }
    initialNotifications = initialNotifications.map((n) => ({ ...n, read: true }));
    return initialNotifications;
  },
  async recordAnnouncementView(announcementId: string): Promise<void> {
    try {
      const key = `dudex_viewed_ann_${announcementId}`;
      if (typeof window !== "undefined" && window.sessionStorage.getItem(key)) return;
      if (typeof window !== "undefined") window.sessionStorage.setItem(key, "1");
      const { data: currentAnn } = await supabase.from('announcements').select('views_count').eq('id', announcementId).maybeSingle();
      const nextViews = (Number(currentAnn?.views_count) || 0) + 1;
      await supabase.from('announcements').update({ views_count: nextViews }).eq('id', announcementId);
    } catch {}
  },
}
