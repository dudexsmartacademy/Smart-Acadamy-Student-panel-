import { studentService, defaultStudentProfile } from './studentService'
import type { StudentProfile, RegistrationDetails } from '../types'

export const authService = {
  getProfile(): StudentProfile {
    return studentService.getProfile()
  },
  saveProfile(profile: Partial<StudentProfile>): StudentProfile {
    return studentService.saveProfile(profile)
  },
  getRegistrationDetails(): RegistrationDetails {
    const stored = localStorage.getItem('dudex_registration_details')
    if (stored) {
      try {
        return JSON.parse(stored) as RegistrationDetails
      } catch {
        // Fall back to default
      }
    }
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
    localStorage.setItem('dudex_registration_details', JSON.stringify(details))
  },
}
