import { ProfileView } from '../profile/ProfilePage'
import { useAuth } from '../../context/AuthContext'

export function StudentsPage() {
  const {
    profile,
    registrationDetails,
    saveStudentProfile,
    saveRegistrationDetails,
  } = useAuth()

  return (
    <div className="page fade-in">
      <ProfileView
        profile={profile}
        registrationDetails={registrationDetails}
        onSave={saveStudentProfile}
        onRegistrationSave={saveRegistrationDetails}
      />
    </div>
  )
}

export default StudentsPage
