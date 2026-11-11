import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { StudentProfile, RegistrationDetails, AuthViewMode, AccountStatus } from '../types'
import { supabase } from '../lib/supabase'
import { checkStudentEmailEligibility } from '../services/eligibilityService'

// Empty profile; displayed as placeholders while loading
const EMPTY_PROFILE: StudentProfile = {
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

interface AuthContextType {
  authView: AuthViewMode
  setAuthView: (mode: AuthViewMode) => void
  session: Session | null
  profile: StudentProfile
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>
  profileLoading: boolean
  sessionChecked: boolean
  registrationDetails: RegistrationDetails
  setRegistrationDetails: React.Dispatch<React.SetStateAction<RegistrationDetails>>
  saveStudentProfile: (updates: Partial<StudentProfile>) => Promise<void>
  saveRegistrationDetails: (details: RegistrationDetails) => Promise<void>
  logout: () => Promise<void>
  authNotice: string
  setAuthNotice: (msg: string) => void
  isEmailVerified: boolean
  setIsEmailVerified: (val: boolean) => void
  evaluateAccess: (currentSession: Session) => Promise<void>
}

const EMPTY_REG: RegistrationDetails = {
  full_name: '',
  college_name: '',
  college_email: '',
  register_number: '',
  phone_number: '',
  course: '',
  specialization: '',
  batch_name: '',
  section: '',
  academic_year: '',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authView, setAuthView] = useState<AuthViewMode>('landing')
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE)
  const [profileLoading, setProfileLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetails>(EMPTY_REG)
  const [authNotice, setAuthNotice] = useState<string>('')
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false)
  // The user whose access was last evaluated; Supabase repeats SIGNED_IN on
  // tab focus, which must not re-run the whole check.
  const evaluatedUserId = useRef<string | null>(null)

  // Load student_profile from Supabase
  const loadProfile = useCallback(async (userId: string, collegeName: string) => {
    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          *,
          profiles(
            id,
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        throw new Error(`Could not load the student profile: ${error.message}`)
      }
      if (!data) {
        throw new Error('The student profile is missing. Please contact your administrator.')
      }

      const p = (data as any)?.profiles as Record<string, unknown> | null
      const sp = data as Record<string, any>
      const courseName = typeof sp.course_name === 'string' ? sp.course_name : ''
      const specializationParts = courseName.split(' - ').slice(1)
      const careerInterests = sp.career_interests
      const careerInterest = Array.isArray(careerInterests)
        ? careerInterests.join(', ')
        : typeof careerInterests === 'string'
          ? careerInterests
          : ''

      const resolvedCollege = (sp?.college_name as string) || collegeName || ''
      const coursePart = (typeof sp?.course_name === 'string' && sp.course_name.includes(' - '))
        ? sp.course_name.split(' - ')[0]
        : (sp?.course_name as string) || 'B.Tech'
      const specPart = specializationParts.join(' - ') || (sp?.specialization as string) || (sp?.department as string) || ''

      const mapped: StudentProfile = {
        student_id: userId,
        full_name: (p?.full_name as string) ?? '',
        avatar: (p?.avatar_url as string) ?? undefined,
        dob: (sp?.dob as string) ?? '',
        gender: (sp?.gender as string) ?? '',
        college: resolvedCollege,
        department: (sp?.department as string) ?? '',
        specialization: specPart,
        batch: (sp?.batch_name as string) ?? '',
        section: (sp?.section as string) ?? '',
        academic_year: (sp?.academic_year as string) ?? '',
        rrn: (sp?.roll_number as string) || (sp?.register_number as string) || '',
        roll_number: (sp?.roll_number as string) || (sp?.register_number as string) || '',
        admission_number: '',
        account_status: ((sp?.status as string) ?? 'Active') as AccountStatus,
        personal_email: (p?.email as string) ?? '',
        college_email: (p?.email as string) ?? '',
        whatsapp: (p?.phone as string) ?? '',
        alternate_phone: (sp?.alternate_phone as string) ?? undefined,
        address: (sp?.address as string) ?? undefined,
        github: (sp?.github_url as string) ?? undefined,
        linkedin: (sp?.linkedin_url as string) ?? undefined,
        portfolio: (sp?.portfolio_url as string) ?? undefined,
        skills: (sp?.skills as string[]) ?? [],
        career_interest: careerInterest,
      }
      setProfile(mapped)

      setRegistrationDetails({
        full_name: (p?.full_name as string) ?? '',
        college_name: resolvedCollege,
        college_email: (p?.email as string) ?? '',
        register_number: (sp?.roll_number as string) || (sp?.register_number as string) || '',
        phone_number: (p?.phone as string) || (sp?.alternate_phone as string) || '',
        course: coursePart,
        specialization: specPart,
        batch_name: (sp?.batch_name as string) ?? '',
        section: (sp?.section as string) ?? '',
        academic_year: (sp?.academic_year as string) ?? '',
      })
    } finally {
      setProfileLoading(false)
    }
  }, [])

  // Centralized security & eligibility gate
  const evaluateAccess = useCallback(
    async (currentSession: Session) => {
      const user = currentSession.user
      if (!user) {
        setAuthView('landing')
        return
      }

      evaluatedUserId.current = user.id
      setProfileLoading(true)
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'student')
          .maybeSingle()

        if (roleError) {
          throw new Error(`Student permissions could not be verified: ${roleError.message}`)
        }
        if (!roleData) {
          await supabase.auth.signOut()
          setSession(null)
          setProfile(EMPTY_PROFILE)
          setAuthView('landing')
          setAuthNotice('This account is not assigned the student role.')
          return
        }

        const eligibilityCheck = user.email
          ? await checkStudentEmailEligibility(user.email)
          : { eligible: false }
        if (!eligibilityCheck.eligible) {
          await supabase.auth.signOut()
          setSession(null)
          setProfile(EMPTY_PROFILE)
          setAuthView('landing')
          setAuthNotice(
            'This verified email is not on the active student roster. Please contact your administrator.'
          )
          return
        }

        const { data: profileRecord, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, avatar_url')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          throw new Error(`Could not load the account profile: ${profileError.message}`)
        }

        const { data: studentProfileRecord, error: studentProfileError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (studentProfileError) {
          throw new Error(`Could not load the student profile: ${studentProfileError.message}`)
        }

        const status = String(studentProfileRecord?.status || 'active').toLowerCase()
        if (status === 'suspended' || status === 'inactive') {
          setAuthView('status')
          setAuthNotice(
            'Your student account is currently inactive or suspended. Please contact the college administrator.'
          )
          return
        }

        if (!profileRecord) {
          throw new Error('The account profile is missing. Please contact your administrator.')
        }

        const resolvedCollege = (studentProfileRecord?.college_name as string) || eligibilityCheck.collegeName || ''
        const hasCollege = Boolean(resolvedCollege)
        const hasId = Boolean(studentProfileRecord?.roll_number || (studentProfileRecord as any)?.register_number || eligibilityCheck.studentId)
        const isRegistrationComplete =
          hasCollege &&
          hasId &&
          Boolean(studentProfileRecord?.course_name) &&
          Boolean(studentProfileRecord?.batch_name) &&
          Boolean(studentProfileRecord?.section) &&
          Boolean(studentProfileRecord?.academic_year)

        if (isRegistrationComplete) {
          await loadProfile(user.id, resolvedCollege)
          setAuthView('portal')
        } else {
          setRegistrationDetails({
            // The roster name is admin-managed; the profile name defaults to the
            // email prefix at sign-up, so it only applies when the roster has none.
            full_name:
              eligibilityCheck?.fullName ||
              profileRecord?.full_name ||
              user.user_metadata?.full_name ||
              '',
            college_name:
              resolvedCollege ||
              '',
            college_email: user.email || profileRecord?.email || '',
            register_number:
              studentProfileRecord?.roll_number ||
              eligibilityCheck?.studentId ||
              '',
            phone_number:
              profileRecord?.phone ||
              studentProfileRecord?.alternate_phone ||
              '',
            course:
              (typeof studentProfileRecord?.course_name === 'string'
                ? studentProfileRecord.course_name.split(' - ')[0]
                : '') ||
              '',
            specialization: (typeof studentProfileRecord?.course_name === 'string'
              ? studentProfileRecord.course_name.split(' - ').slice(1).join(' - ')
              : '') ||
              eligibilityCheck?.department ||
              '',
            batch_name: studentProfileRecord?.batch_name || '',
            section: studentProfileRecord?.section || '',
            academic_year:
              studentProfileRecord?.academic_year || '',
          })
          setIsEmailVerified(true)
          setAuthView('signup')
        }
      } catch (err) {
        // Network or lookup failures keep the session (no forced sign-out);
        // the check runs again on the next sign-in event or page load.
        console.error('[AuthContext] Error in evaluateAccess:', err)
        evaluatedUserId.current = null
        setAuthNotice(
          err instanceof Error
            ? err.message
            : 'Your account could not be verified. Please contact your administrator.'
        )
      } finally {
        setProfileLoading(false)
      }
    },
    [loadProfile]
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('Could not restore the student session:', error.message)
        setAuthNotice('Could not restore your session. Please sign in again.')
        setSession(null)
        setSessionChecked(true)
        return
      }
      setSession(currentSession)
      if (currentSession?.user) {
        evaluateAccess(currentSession).finally(() => setSessionChecked(true))
      } else {
        setSessionChecked(true)
      }
    }).catch((error: unknown) => {
      console.error('Could not restore the student session:', error)
      setAuthNotice('Could not restore your session. Please sign in again.')
      setSession(null)
      setSessionChecked(true)
    })

    // Listen to auth changes (including Google OAuth redirects and sign-ins)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (s?.user) {
        if ((event === 'SIGNED_IN' && s.user.id !== evaluatedUserId.current) || event === 'USER_UPDATED') {
          setTimeout(() => {
            void evaluateAccess(s)
          }, 0)
        }
      } else {
        evaluatedUserId.current = null
        setAuthView('landing')
        setProfile(EMPTY_PROFILE)
      }
    })

    return () => subscription.unsubscribe()
  }, [evaluateAccess])

  const saveStudentProfile = async (updates: Partial<StudentProfile>) => {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError) throw new Error(`Could not verify your account: ${authError.message}`)
    if (!authData.user) throw new Error('Sign in before saving your profile.')

    const { data: role, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authData.user.id)
      .eq('role', 'student')
      .maybeSingle()
    if (roleError || !role) {
      throw new Error(
        roleError?.message || 'This account is not authorized to update a student profile.'
      )
    }

    const profilePayload: { phone?: string | null; avatar_url?: string | null } = {}
    if (updates.whatsapp !== undefined) profilePayload.phone = updates.whatsapp || null
    if (updates.avatar !== undefined) profilePayload.avatar_url = updates.avatar || null

    const studentPayload: {
      dob?: string | null
      gender?: string | null
      address?: string | null
      alternate_phone?: string | null
      github_url?: string | null
      linkedin_url?: string | null
      portfolio_url?: string | null
      skills?: string[]
      career_interests?: string | string[] | null
      personal_email?: string | null
    } = {}
    if (updates.dob !== undefined) studentPayload.dob = updates.dob || null
    if (updates.gender !== undefined) studentPayload.gender = updates.gender || null
    if (updates.address !== undefined) studentPayload.address = updates.address || null
    if (updates.alternate_phone !== undefined) {
      studentPayload.alternate_phone = updates.alternate_phone || null
    }
    if (updates.github !== undefined) studentPayload.github_url = updates.github || null
    if (updates.linkedin !== undefined) studentPayload.linkedin_url = updates.linkedin || null
    if (updates.portfolio !== undefined) studentPayload.portfolio_url = updates.portfolio || null
    if (updates.skills !== undefined) studentPayload.skills = updates.skills
    if (updates.career_interest !== undefined) {
      studentPayload.career_interests = updates.career_interest || null
    }
    // student_profiles has no personal_email column in the live schema, so it
    // is not persisted.

    let profileSaved = false
    if (Object.keys(profilePayload).length > 0) {
      const { data, error } = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('id', authData.user.id)
        .select('id')
        .maybeSingle()
      if (error) throw new Error(`Could not save account details: ${error.message}`)
      if (!data) throw new Error('The account profile was not updated. Reload and try again.')
      profileSaved = true
    }

    if (Object.keys(studentPayload).length > 0) {
      const { data, error } = await supabase
        .from('student_profiles')
        .update(studentPayload)
        .eq('user_id', authData.user.id)
        .select('user_id')
        .maybeSingle()
      if (error) {
        throw new Error(
          profileSaved
            ? `Some account details were saved, but student details failed: ${error.message}. Reload before retrying.`
            : `Could not save student details: ${error.message}`
        )
      }
      if (!data) {
        throw new Error(
          profileSaved
            ? 'Some account details were saved, but the student profile was not updated. Reload before retrying.'
            : 'The student profile was not updated. Reload and try again.'
        )
      }
    }

    const safeUpdates: Partial<StudentProfile> = {}
    if (updates.avatar !== undefined) safeUpdates.avatar = updates.avatar
    if (updates.dob !== undefined) safeUpdates.dob = updates.dob
    if (updates.gender !== undefined) safeUpdates.gender = updates.gender
    if (updates.address !== undefined) safeUpdates.address = updates.address
    if (updates.alternate_phone !== undefined) {
      safeUpdates.alternate_phone = updates.alternate_phone
    }
    if (updates.github !== undefined) safeUpdates.github = updates.github
    if (updates.linkedin !== undefined) safeUpdates.linkedin = updates.linkedin
    if (updates.portfolio !== undefined) safeUpdates.portfolio = updates.portfolio
    if (updates.skills !== undefined) safeUpdates.skills = updates.skills
    if (updates.career_interest !== undefined) {
      safeUpdates.career_interest = updates.career_interest
    }
    if (updates.personal_email !== undefined) {
      safeUpdates.personal_email = updates.personal_email
    }
    if (updates.whatsapp !== undefined) safeUpdates.whatsapp = updates.whatsapp
    setProfile((previous) => ({ ...previous, ...safeUpdates }))
  }

  const saveRegistrationDetails = async (details: RegistrationDetails) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: role, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'student')
          .maybeSingle()
        if (roleError || !role) {
          throw new Error(
            roleError?.message || 'This account is not authorized to register as a student.'
          )
        }

        const eligibility = await checkStudentEmailEligibility(user.email || '')
        if (!eligibility.eligible) {
          throw new Error('This email is not on the active student roster.')
        }

        const { error: registrationError } = await supabase.rpc(
          'complete_my_student_registration',
          {
            p_full_name: details.full_name,
            p_phone: details.phone_number,
            p_register_number: details.register_number,
            p_course: details.course,
            p_specialization: details.specialization,
            p_batch_name: details.batch_name,
            p_section: details.section,
            p_academic_year: details.academic_year,
          },
        )
        if (registrationError) {
          throw new Error(`Could not complete student registration: ${registrationError.message}`)
        }

        await loadProfile(user.id, eligibility.collegeName || '')
        setRegistrationDetails(details)
        setAuthView('portal')
      } else {
        throw new Error('A signed-in account is required to complete registration.')
      }
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error('Failed to persist registration details to Supabase.')
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(EMPTY_PROFILE)
    setAuthNotice('')
    setIsEmailVerified(false)
    setAuthView('landing')
  }

  return (
    <AuthContext.Provider
      value={{
        authView,
        setAuthView,
        session,
        profile,
        setProfile,
        profileLoading,
        sessionChecked,
        registrationDetails,
        setRegistrationDetails,
        saveStudentProfile,
        saveRegistrationDetails,
        logout,
        authNotice,
        setAuthNotice,
        isEmailVerified,
        setIsEmailVerified,
        evaluateAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
