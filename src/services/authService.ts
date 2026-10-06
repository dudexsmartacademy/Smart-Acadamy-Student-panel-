import { supabase } from '../lib/supabase'
import type { StudentProfile, RegistrationDetails } from '../types'
import { defaultStudentProfile } from './studentService'

export const authService = {
  // Get current active session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Get authenticated user profile from Supabase
  async getCurrentStudentProfile(): Promise<{ profile: StudentProfile; isStudent: boolean } | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Check user role from profiles table (Authorization Check)
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const role = profileRow?.role || user.user_metadata?.role || 'student'
    const isStudent = role.toLowerCase() === 'student'

    // Query student details from student_profiles table
    const { data: studentRow } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const studentProfile: StudentProfile = {
      student_id: studentRow?.student_id || studentRow?.id || user.id.slice(0, 8),
      full_name: profileRow?.full_name || studentRow?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
      avatar: profileRow?.avatar_url || studentRow?.avatar,
      dob: studentRow?.dob || '',
      gender: studentRow?.gender || '',
      college: studentRow?.college || studentRow?.college_name || 'DudeX Academy',
      department: studentRow?.department || 'Computer Science & Engineering',
      specialization: studentRow?.specialization || 'Full Stack Software Engineering',
      batch: studentRow?.batch || '2025–2029',
      section: studentRow?.section || 'Section A',
      academic_year: studentRow?.academic_year || '1st Year (Semester 1)',
      rrn: studentRow?.rrn || studentRow?.register_number || 'RRN-001',
      roll_number: studentRow?.roll_number || 'ROLL-001',
      admission_number: studentRow?.admission_number || 'ADM-001',
      account_status: (studentRow?.account_status as any) || 'Approved',
      personal_email: studentRow?.personal_email || user.email || '',
      college_email: studentRow?.college_email || user.email || '',
      whatsapp: studentRow?.whatsapp || studentRow?.phone_number || '',
      alternate_phone: studentRow?.alternate_phone,
      address: studentRow?.address,
      github: studentRow?.github,
      linkedin: studentRow?.linkedin,
      portfolio: studentRow?.portfolio,
      skills: studentRow?.skills || [],
      career_interest: studentRow?.career_interest || '',
    }

    return { profile: studentProfile, isStudent }
  },

  // Real Supabase Email/Password Login
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })
    if (error) throw error

    // Verify role authorization
    const profileInfo = await this.getCurrentStudentProfile()
    if (profileInfo && !profileInfo.isStudent) {
      await supabase.auth.signOut()
      throw new Error('Unauthorized Access: This portal is exclusively for students. Admin & Teachers must use their designated portal.')
    }

    return data
  },

  // Real Supabase OTP Login
  async signInWithOtp(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    })
    if (error) throw error
    return data
  },

  // Real Supabase OTP Verification
  async verifyOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'email',
    })
    if (error) throw error
    return data
  },

  // Real Supabase Sign Up & Student Profile Creation
  async signUpStudent(details: RegistrationDetails & { password?: string }) {
    const email = details.college_email.trim()
    const password = details.password || 'Student@123'

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: details.full_name,
          role: 'student',
        },
      },
    })
    if (authError) throw authError

    const userId = authData.user?.id
    if (userId) {
      // Upsert profile into public.profiles
      await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: details.full_name,
        role: 'student',
        updated_at: new Date().toISOString(),
      })

      // Upsert student_profiles table (shared with Admin/Teacher panels)
      await supabase.from('student_profiles').upsert({
        user_id: userId,
        full_name: details.full_name,
        college: details.college_name,
        college_email: email,
        personal_email: email,
        rrn: details.register_number,
        whatsapp: details.phone_number,
        department: details.course,
        specialization: details.specialization,
        section: details.section,
        account_status: 'Approved',
        created_at: new Date().toISOString(),
      })
    }

    return authData
  },

  // Real Supabase Logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error:', error)
  },

  // Sync profile edits directly to Supabase
  async updateStudentProfile(profile: Partial<StudentProfile>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('student_profiles').upsert({
      user_id: user.id,
      full_name: profile.full_name,
      personal_email: profile.personal_email,
      whatsapp: profile.whatsapp,
      alternate_phone: profile.alternate_phone,
      address: profile.address,
      github: profile.github,
      linkedin: profile.linkedin,
      portfolio: profile.portfolio,
      skills: profile.skills,
      career_interest: profile.career_interest,
      dob: profile.dob,
      gender: profile.gender,
      updated_at: new Date().toISOString(),
    })

    if (profile.full_name) {
      await supabase.from('profiles').update({
        full_name: profile.full_name,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
    }
  },

  // Legacy sync accessors (Clean fallbacks)
  getProfile(): StudentProfile {
    return defaultStudentProfile
  },

  saveProfile(profile: Partial<StudentProfile>): StudentProfile {
    this.updateStudentProfile(profile)
    return { ...defaultStudentProfile, ...profile }
  },

  getRegistrationDetails(): RegistrationDetails {
    return {
      full_name: defaultStudentProfile.full_name,
      college_name: defaultStudentProfile.college,
      college_email: defaultStudentProfile.college_email,
      register_number: defaultStudentProfile.rrn,
      phone_number: defaultStudentProfile.whatsapp,
      course: 'B.E. / B.Tech',
      specialization: defaultStudentProfile.specialization,
      section: defaultStudentProfile.section,
    }
  },

  saveRegistrationDetails(details: RegistrationDetails): void {
    this.signUpStudent(details).catch(console.error)
  },
}
