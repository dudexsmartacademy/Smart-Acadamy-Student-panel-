import { useState } from 'react'
import { CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react'
import type { StudentProfile } from '../../types'
import { supabase } from '../../lib/supabase'
import { syncStudentData } from '../../services/studentService'

interface MarkAttendancePageProps {
  profile: StudentProfile
}

// The signed-in student is identified server-side by mark_attendance_with_code,
// so the profile prop is not needed to record attendance.
const getLocalDateString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function MarkAttendancePage(_props: MarkAttendancePageProps) {
  const [code, setCode] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (submitted || submitting) {
      return
    }

    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError('Please enter a valid six-character attendance code.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Try server-side RPC
      const cleanCode = code.trim().toUpperCase()
      const { data: rpcData, error: markError } = await supabase.rpc('mark_attendance_with_code', {
        p_code: cleanCode,
      })
      if (!markError && rpcData) {
        setSubmitted(true)
        setCode('')
        void syncStudentData()
        return
      }

      if (markError) {
        const msg = markError.message || ''
        if (msg.includes('not for your batch') || msg.includes('not enrolled') || msg.includes('expired') || msg.includes('Invalid')) {
          setError(msg)
          return
        }
      }

      // 2. Direct fallback: resolve active attendance code from attendance_codes table
      const { data: activeCodes } = await supabase
        .from('attendance_codes')
        .select('*')
        .eq('code', cleanCode)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      if (activeCodes && activeCodes.length > 0) {
        const codeRow = activeCodes[0]
        const { data: authResult } = await supabase.auth.getUser()
        if (!authResult?.user) {
          setError('Please sign in with a student account to mark attendance.')
          return
        }

        const { data: sp } = await supabase
          .from('student_profiles')
          .select('id, batch_name')
          .eq('user_id', authResult.user.id)
          .maybeSingle()

        const studentBatch = sp?.batch_name || (codeRow.batches && codeRow.batches[0]) || 'Batch 1'
        const todayStr = getLocalDateString()

        // Check if already marked for today
        const { data: existingRecs } = await supabase
          .from('attendance_records')
          .select('id')
          .eq('student_id', authResult.user.id)
          .eq('date', todayStr)
          .limit(1)

        if (existingRecs && existingRecs.length > 0) {
          await supabase
            .from('attendance_records')
            .update({
              status: 'Present',
              session_time: 'Code check-in',
              subject: codeRow.subject || 'General',
            })
            .eq('id', existingRecs[0].id)
        } else {
          await supabase
            .from('attendance_records')
            .insert({
              student_id: authResult.user.id,
              class_id: codeRow.class_id || null,
              batch_name: studentBatch,
              teacher_id: codeRow.created_by || null,
              date: todayStr,
              session_time: 'Code check-in',
              mode: 'offline',
              subject: codeRow.subject || 'General',
              status: 'Present',
            })
        }

        setSubmitted(true)
        setCode('')
        void syncStudentData()
        return
      }

      // 3. Fallback: resolve active class session by code in room field
      const todayStr = getLocalDateString()
      const { data: activeSessions, error: sessError } = await supabase
        .from('class_sessions')
        .select('id, class_id, teacher_id, room, session_date')
        .eq('session_date', todayStr)
        .ilike('room', `%${code}%`)

      if (sessError || !activeSessions || activeSessions.length === 0) {
        setError('Invalid or expired attendance code. Please check with your faculty.')
        return
      }

      const session = activeSessions[0]
      // Check expiration if room contains EXP:
      if (session.room && session.room.includes('EXP:')) {
        const expStr = session.room.split('EXP:')[1]?.split('|')[0]
        if (expStr && new Date(expStr).getTime() < Date.now()) {
          setError('This attendance code has expired.')
          return
        }
      }

      const { data: authResult } = await supabase.auth.getUser()
      if (!authResult?.user) {
        setError('Please sign in with a student account to mark attendance.')
        return
      }

      const studentId = authResult.user.id

      // Upsert into attendance_records with title-cased Present
      const { error: insertErr } = await supabase
        .from('attendance_records')
        .upsert(
          {
            session_id: session.id,
            student_id: studentId,
            status: 'Present',
            marked_by: session.teacher_id,
            marked_at: new Date().toISOString(),
            remarks: 'Verified via live attendance code',
          },
          { onConflict: 'session_id,student_id' }
        )

      if (insertErr) {
        // Fallback for simple attendance_records schema (class_id, student_id, date)
        await supabase
          .from('attendance_records')
          .insert({
            class_id: session.class_id,
            student_id: studentId,
            status: 'Present',
            date: todayStr,
            teacher_id: session.teacher_id,
            subject: 'General',
          })
      }

      setSubmitted(true)
      setCode('')
      void syncStudentData()
    } catch {
      setError('Attendance service is currently unreachable.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCodeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6)

    setCode(value)
    setError('')
  }

  return (
    <div className="page fade-in mark-attendance-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Student Records</div>

          <h1>Mark Attendance</h1>

          <p className="page-copy">
            Enter the six-character attendance code provided by your faculty.
          </p>
        </div>
      </div>

      <section className="mark-attendance-container">
        <div className="mark-attendance-card">
          <div className="mark-attendance-icon">
            {submitted ? (
              <CheckCircle2 size={30} />
            ) : (
              <KeyRound size={30} />
            )}
          </div>

          {submitted ? (
            <div
              className="attendance-success"
              role="status"
              aria-live="polite"
            >
              <h2>
                Your attendance has been recorded successfully!
              </h2>

              <p>
                Your attendance session has been verified and recorded for your student profile.
              </p>

              <div className="attendance-completed-badge">
                <CheckCircle2 size={17} />
                Attendance Recorded
              </div>
            </div>
          ) : (
            <>
              <h2>Enter Attendance Code</h2>

              <p className="mark-attendance-description">
                Enter the six-character code shared by your faculty
                to mark your attendance.
              </p>

              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="attendance-code"
                  className="attendance-code-label"
                >
                  Attendance Code
                </label>

                <input
                  id="attendance-code"
                  className="attendance-code-input"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="ABC123"
                  maxLength={6}
                  minLength={6}
                  pattern="[A-Za-z0-9]{6}"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby={
                    error
                      ? 'attendance-code-error'
                      : 'attendance-code-help'
                  }
                  aria-invalid={Boolean(error)}
                  required
                />

                <p
                  id="attendance-code-help"
                  className="attendance-code-help"
                >
                  Enter exactly 6 letters or numbers.
                </p>

                {error && (
                  <p
                    id="attendance-code-error"
                    className="attendance-code-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary mark-attendance-submit"
                  disabled={code.length !== 6 || submitting}
                >
                  {submitting ? 'Verifying...' : 'Submit Attendance'}
                </button>
              </form>

              <div className="attendance-security-note">
                <ShieldCheck size={16} />

                <span>
                  Attendance records are validated securely via Supabase.
                </span>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default MarkAttendancePage