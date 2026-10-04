import React, { createContext, useContext, useState } from 'react'
import type { StudentProfile, RegistrationDetails, AuthViewMode } from '../types'
import { authService } from '../services'

interface AuthContextType {
  authView: AuthViewMode
  setAuthView: (mode: AuthViewMode) => void
  profile: StudentProfile
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>
  updateProfile: (profile: Partial<StudentProfile>) => StudentProfile
  registrationDetails: RegistrationDetails
  setRegistrationDetails: React.Dispatch<React.SetStateAction<RegistrationDetails>>
  saveRegistrationDetails: (details: RegistrationDetails) => void
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authView, setAuthView] = useState<AuthViewMode>('landing')
  const [profile, setProfile] = useState<StudentProfile>(() => authService.getProfile())
  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetails>(() =>
    authService.getRegistrationDetails()
  )

  const updateProfile = (updated: Partial<StudentProfile>) => {
    const saved = authService.saveProfile(updated)
    setProfile(saved)
    return saved
  }

  const saveRegistrationDetails = (details: RegistrationDetails) => {
    setRegistrationDetails(details)
    authService.saveRegistrationDetails(details)
  }

  const login = () => {
    setAuthView('portal')
  }

  const logout = () => {
    setAuthView('landing')
  }

  return (
    <AuthContext.Provider
      value={{
        authView,
        setAuthView,
        profile,
        setProfile,
        updateProfile,
        registrationDetails,
        setRegistrationDetails,
        saveRegistrationDetails,
        login,
        logout,
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
