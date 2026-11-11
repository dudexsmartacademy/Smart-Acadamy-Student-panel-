import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface StudentEligibilityResult {
  eligible: boolean
  fullName?: string
  collegeName?: string
  studentId?: string
  department?: string
  /** Batch assigned by the admin when the college mail ID was added. */
  batchName?: string
  source?: string
}

interface StudentRosterProfile {
  full_name: string | null
  college_name: string | null
  student_id: string | null
  department: string | null
  batch_name?: string | null
}

export async function checkStudentEmailEligibility(
  email: string,
): Promise<StudentEligibilityResult> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !isSupabaseConfigured) {
    return { eligible: false }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) {
    throw new Error(`Could not verify the signed-in user: ${userError.message}`)
  }
  if (!user || user.email?.trim().toLowerCase() !== cleanEmail) {
    return { eligible: false }
  }

  const { data, error } = await supabase.rpc('get_my_student_roster_profile')
  if (error) {
    throw new Error(`Could not verify student roster eligibility: ${error.message}`)
  }

  const rosterProfile = (Array.isArray(data) ? data[0] : data) as
    | StudentRosterProfile
    | null
    | undefined

  if (!rosterProfile) {
    return { eligible: false }
  }

  return {
    eligible: true,
    fullName: rosterProfile.full_name ?? undefined,
    collegeName: rosterProfile.college_name ?? undefined,
    studentId: rosterProfile.student_id ?? undefined,
    department: rosterProfile.department ?? undefined,
    batchName: rosterProfile.batch_name ?? undefined,
    source: 'supabase_roster',
  }
}
