import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { StudentProfile, RegistrationDetails } from '../../types'
import { defaultStudentProfile } from '../../services'

export function ProfileView({
  profile,
  registrationDetails,
  onSave,
  onRegistrationSave,
}: {
  profile: StudentProfile
  registrationDetails: RegistrationDetails
  onSave: (p: Partial<StudentProfile>) => void
  onRegistrationSave: (details: RegistrationDetails) => void
}) {
  const [formData, setFormData] = useState(profile)
  const [collegeData, setCollegeData] = useState(registrationDetails)
  const [personalEditing, setPersonalEditing] = useState(false)
  const [collegeEditing, setCollegeEditing] = useState(false)
  const [savedCard, setSavedCard] = useState<'personal' | 'college' | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>(() => {
    return localStorage.getItem('dudex_profile_photo') || ''
  })

  const getProfileInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'U'
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
  }

  const profileInitials = getProfileInitials(formData.full_name)

  const removeProfilePhoto = () => {
    localStorage.removeItem('dudex_profile_photo')
    setPhotoUrl('')

    const input = document.getElementById('profile-photo-upload') as HTMLInputElement | null
    if (input) input.value = ''
  }

  const showSaved = (card: 'personal' | 'college') => {
    setSavedCard(card)
    window.setTimeout(() => setSavedCard(null), 2500)
  }

  const handlePersonalSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setPersonalEditing(false)
    showSaved('personal')
  }

  const handleCollegeSave = (e: React.FormEvent) => {
    e.preventDefault()

    onRegistrationSave({
      ...collegeData,
      college_email: registrationDetails.college_email,
    })

    setCollegeEditing(false)
    showSaved('college')
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (result) {
        try {
          localStorage.setItem('dudex_profile_photo', result)
          setPhotoUrl(result)
        } catch {
          alert('This image is too large to save in the browser. Please choose a smaller image.')
        }
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Student Identity</div>
          <h1>My Profile</h1>
          <p className="page-copy">Manage your personal information and registered college details.</p>
        </div>
      </div>

      <div
        className="profile-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left: Personal Details */}
        <form onSubmit={handlePersonalSave} className="content-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
              <div
                className="avatar large"
                style={{
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${formData.full_name} profile`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  profileInitials
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <h3 style={{ marginBottom: '4px' }}>{formData.full_name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {formData.career_interest || defaultStudentProfile.career_interest}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginTop: '8px',
                  }}
                >
                  <label
                    htmlFor="profile-photo-upload"
                    className="btn-outline"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    Change Profile Photo
                  </label>

                  {photoUrl && (
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={removeProfilePhoto}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        color: 'var(--status-danger)',
                        borderColor: 'rgba(173, 79, 79, 0.35)',
                      }}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn-outline"
              onClick={() => setPersonalEditing((value) => !value)}
            >
              {personalEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {savedCard === 'personal' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(94, 128, 101, 0.12)',
                color: 'var(--status-success)',
                marginBottom: '16px',
                fontSize: '12px',
              }}
            >
              <CheckCircle2 size={15} />
              Personal details saved successfully.
            </div>
          )}

          <h4
            style={{
              margin: '8px 0 12px',
              fontSize: '14px',
              borderBottom: '1px solid var(--cream-secondary)',
              paddingBottom: '6px',
            }}
          >
            Personal & Contact Details
          </h4>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input
                disabled={!personalEditing}
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Personal Email</label>
              <input
                disabled={!personalEditing}
                type="email"
                value={formData.personal_email}
                onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <input
                disabled={!personalEditing}
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Alternate Phone</label>
              <input
                disabled={!personalEditing}
                value={formData.alternate_phone || ''}
                onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Current Address</label>
            <textarea
              disabled={!personalEditing}
              rows={2}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <h4
            style={{
              margin: '24px 0 12px',
              fontSize: '14px',
              borderBottom: '1px solid var(--cream-secondary)',
              paddingBottom: '6px',
            }}
          >
            Professional Portfolio Links
          </h4>

          <div className="form-grid-2">
            <div className="form-group">
              <label>GitHub URL</label>
              <input
                disabled={!personalEditing}
                value={formData.github || ''}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>LinkedIn URL</label>
              <input
                disabled={!personalEditing}
                value={formData.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              />
            </div>
          </div>

          {personalEditing && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn-primary">
                <CheckCircle2 size={16} /> Save Personal Details
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setFormData(profile)
                  setPersonalEditing(false)
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        {/* Right: Registered College Details */}
        <form onSubmit={handleCollegeSave} className="content-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 style={{ margin: '0' }}>College Information</h3>
            </div>

            <button
              type="button"
              className="btn-outline"
              onClick={() => setCollegeEditing((value) => !value)}
            >
              {collegeEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {savedCard === 'college' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(94, 128, 101, 0.12)',
                color: 'var(--status-success)',
                marginBottom: '16px',
                fontSize: '12px',
              }}
            >
              <CheckCircle2 size={15} />
              College details saved successfully.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {[
              ['Full Name', 'full_name'],
              ['College Name', 'college_name'],
              ['College Mail ID', 'college_email'],
              ['College Register Number', 'register_number'],
              ['Course', 'course'],
              ['Specialization', 'specialization'],
              ['Section', 'section'],
            ].map(([label, key]) => (
              <div className="form-group" key={key}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {label}

                  {key === 'college_email' && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                      }}
                    >
                      (Locked)
                    </span>
                  )}
                </label>
                <input
                  disabled={key === 'college_email' || !collegeEditing}
                  value={collegeData[key as keyof RegistrationDetails]}
                  onChange={(e) =>
                    setCollegeData({
                      ...collegeData,
                      [key]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>

          {collegeEditing && (
            <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn-primary">
                <CheckCircle2 size={16} /> Save College Details
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setCollegeData(registrationDetails)
                  setCollegeEditing(false)
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      <style>{`
        .profile-layout input:disabled,
        .profile-layout textarea:disabled {
          opacity: 0.78;
          cursor: default;
          background: var(--cream-primary);
        }

        @media (max-width: 900px) {
          .profile-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .profile-layout .form-grid-2 {
            grid-template-columns: 1fr !important;
          }

          .profile-layout .content-card {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}

export const ProfilePage = ProfileView
export default ProfilePage
