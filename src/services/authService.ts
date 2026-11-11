import { studentService, initialProfile } from './studentService'
import type { StudentProfile, RegistrationDetails } from '../types'

export const authService = {
  getProfile(): StudentProfile {
    return studentService.getProfile()
  },
  saveProfile(profile: Partial<StudentProfile>): StudentProfile {
    return studentService.saveProfile(profile)
  },
  getRegistrationDetails(): RegistrationDetails {
    return {
      full_name: initialProfile.full_name,
      college_name: initialProfile.college,
      college_email: initialProfile.college_email,
      register_number: initialProfile.rrn,
      phone_number: initialProfile.whatsapp,
      course: 'B.E. / B.Tech',
      specialization: initialProfile.specialization,
      batch_name: initialProfile.batch,
      section: initialProfile.section,
      academic_year: initialProfile.academic_year,
    }
  },
  saveRegistrationDetails(_details: RegistrationDetails): void {
    // Handled by AuthContext and Supabase
  },
}
