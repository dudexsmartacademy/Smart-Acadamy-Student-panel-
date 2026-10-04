import { ProfileView } from '../profile/ProfilePage'
import { authService } from '../../services'

export function StudentsPage() {
  const profile = authService.getProfile()
  const registrationDetails = authService.getRegistrationDetails()

  return (
    <div className="page fade-in">
      <ProfileView
        profile={profile}
        registrationDetails={registrationDetails}
        onSave={(p) => authService.saveProfile(p)}
        onRegistrationSave={(d) => authService.saveRegistrationDetails(d)}
      />
    </div>
  )
}

export default StudentsPage
