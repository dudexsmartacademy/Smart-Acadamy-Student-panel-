import React, { createContext, useContext, useState, useEffect } from 'react'
import type { StudentProfile, RegistrationDetails, AuthViewMode } from '../types'
import { authService, defaultStudentProfile } from '../services'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  authView: AuthViewMode
  setAuthView: (mode: AuthViewMode) => void
  session: Session | null
  profile: StudentProfile
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>
  updateProfile: (profile: Partial<StudentProfile>) => Promise<StudentProfile>
  registrationDetails: RegistrationDetails
  setRegistrationDetails: React.Dispatch<React.SetStateAction<RegistrationDetails>>
  saveRegistrationDetails: (details: RegistrationDetails) => Promise<void>
  loginWithPassword: (email: string, pass: string) => Promise<void>
  loginWithOtp: (email: string) => Promise<void>
  verifyLoginOtp: (email: string, token: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  authError: string | null
  setAuthError: (err: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authView, setAuthView] = useState<AuthViewMode>('landing')
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<StudentProfile>(defaultStudentProfile)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetails>({
    full_name: '',
    college_name: '',
    college_email: '',
    register_number: '',
    phone_number: '',
    course: '',
    specialization: '',
    section: '',
  })

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (!mounted) return

        if (currentSession) {
          setSession(currentSession)
          const studentInfo = await authService.getCurrentStudentProfile()
          if (studentInfo) {
            if (studentInfo.isStudent) {
              setProfile(studentInfo.profile)
              setAuthView('portal')
            } else {
              setAuthError('Unauthorized: Account is not assigned a Student role.')
              await authService.signOut()
              setAuthView('landing')
            }
          } else {
            setAuthView('portal')
          }
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      if (event === 'SIGNED_IN' && newSession) {
        setAuthError(null)
        const studentInfo = await authService.getCurrentStudentProfile()
        if (studentInfo) {
          if (studentInfo.isStudent) {
            setProfile(studentInfo.profile)
            setAuthView('portal')
          } else {
            setAuthError('Unauthorized: Account is assigned an Admin/Teacher role.')
            await authService.signOut()
            setAuthView('landing')
          }
        } else {
          setAuthView('portal')
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(defaultStudentProfile)
        setAuthView('landing')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const updateProfile = async (updated: Partial<StudentProfile>) => {
    const newProf = { ...profile, ...updated }
    setProfile(newProf)
    await authService.updateStudentProfile(updated)
    return newProf
  }

  const saveRegistrationDetails = async (details: RegistrationDetails) => {
    setRegistrationDetails(details)
    setLoading(true)
    try {
      await authService.signUpStudent(details)
    } finally {
      setLoading(false)
    }
  }

  const loginWithPassword = async (email: string, pass: string) => {
    setAuthError(null)
    setLoading(true)
    try {
      await authService.signInWithPassword(email, pass)
      setAuthView('portal')
    } catch (err: any) {
      setAuthError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginWithOtp = async (email: string) => {
    setAuthError(null)
    setLoading(true)
    try {
      await authService.signInWithOtp(email)
    } catch (err: any) {
      setAuthError(err.message || 'OTP dispatch failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyLoginOtp = async (email: string, token: string) => {
    setAuthError(null)
    setLoading(true)
    try {
      await authService.verifyOtp(email, token)
      setAuthView('portal')
    } catch (err: any) {
      setAuthError(err.message || 'Invalid OTP code')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setSession(null)
      setProfile(defaultStudentProfile)
      setAuthView('landing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authView,
        setAuthView,
        session,
        profile,
        setProfile,
        updateProfile,
        registrationDetails,
        setRegistrationDetails,
        saveRegistrationDetails,
        loginWithPassword,
        loginWithOtp,
        verifyLoginOtp,
        logout,
        loading,
        authError,
        setAuthError,
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

export default AuthContext
