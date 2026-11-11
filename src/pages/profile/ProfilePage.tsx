import React, { useEffect, useState } from 'react'
import { CheckCircle2, Camera, X, Lock } from 'lucide-react'

import type {
  StudentProfile,
  RegistrationDetails,
} from '../../types'



interface ProfileViewProps {
  profile: StudentProfile
  registrationDetails: RegistrationDetails
  onSave: (profile: Partial<StudentProfile>) => Promise<void>
  onRegistrationSave: (details: RegistrationDetails) => Promise<void>
}

/* --------------------------------------------------
   PROFILE VIEW
-------------------------------------------------- */

export function ProfileView({
  profile,
  registrationDetails,
  onSave,
  onRegistrationSave: _onRegistrationSave,
}: ProfileViewProps) {
  const [formData, setFormData] = useState<StudentProfile>(profile)

  const [collegeData, setCollegeData] =
    useState<RegistrationDetails>(registrationDetails)

  const [personalEditing, setPersonalEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [savedCard, setSavedCard] = useState<
    'personal' | 'college' | null
  >(null)

  const [photoUrl, setPhotoUrl] = useState<string>(profile.avatar || '')

  /* --------------------------------------------------
     KEEP PROFILE DATA SYNCHRONIZED WITH APP STATE
  -------------------------------------------------- */

  useEffect(() => {
    setFormData(profile)
    if (profile.avatar !== undefined) {
      setPhotoUrl(profile.avatar || '')
    }
  }, [profile])

  useEffect(() => {
    setCollegeData(registrationDetails)
  }, [registrationDetails])

  /* --------------------------------------------------
     SUCCESS MESSAGE
  -------------------------------------------------- */

  const showSaved = (card: 'personal' | 'college') => {
    setSavedCard(card)

    window.setTimeout(() => {
      setSavedCard((current) => (current === card ? null : current))
    }, 2500)
  }

  const saveProfileUpdates = async (
    updates: Partial<StudentProfile>
  ): Promise<boolean> => {
    if (isSaving) return false
    setIsSaving(true)
    setSaveError('')
    setSavedCard(null)
    try {
      await onSave(updates)
      return true
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Could not save profile changes.'
      )
      return false
    } finally {
      setIsSaving(false)
    }
  }

  /* --------------------------------------------------
     PERSONAL DETAILS SAVE
  -------------------------------------------------- */

  const handlePersonalSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const saved = await saveProfileUpdates({ ...formData, avatar: photoUrl })
    if (!saved) return

    setPersonalEditing(false)
    showSaved('personal')
  }

  /* --------------------------------------------------
     PROFILE PHOTO
  -------------------------------------------------- */

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      window.alert('Please select an image file.')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert('Please select an image smaller than 2 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = async () => {
      const result =
        typeof reader.result === 'string' ? reader.result : ''

      if (!result) return

      if (!(await saveProfileUpdates({ avatar: result }))) return
      setPhotoUrl(result)
      setFormData((prev) => ({ ...prev, avatar: result }))
    }

    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = async () => {
    if (!(await saveProfileUpdates({ avatar: '' }))) return
    setPhotoUrl('')
    setFormData((prev) => ({ ...prev, avatar: '' }))
  }

  const effectiveCollegeName = collegeData.college_name || profile.college || ''

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */

  return (
    <div className="page fade-in dudex-profile-page">
      <style>{`
        .dudex-profile-page {
          width: 100%;
          min-width: 0;
        }

        .dudex-profile-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(0, 0.85fr);
          gap: 20px;
          align-items: start;
        }

        .dudex-profile-card {
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .dudex-profile-card input,
        .dudex-profile-card textarea,
        .dudex-profile-card select {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
        }

        .dudex-profile-card input:disabled,
        .dudex-profile-card textarea:disabled,
        .dudex-profile-card select:disabled {
          opacity: 0.85;
          cursor: not-allowed;
          background: var(--cream-primary);
          color: var(--text-secondary);
        }

        .dudex-profile-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .dudex-profile-field {
          min-width: 0;
        }

        .dudex-profile-field label {
          display: block;
          margin-bottom: 6px;
        }

        .dudex-profile-section-title {
          margin: 24px 0 12px;
          padding-bottom: 8px;
          font-size: 14px;
          border-bottom: 1px solid var(--cream-secondary);
        }

        .dudex-profile-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .dudex-profile-card-header h3 {
          margin: 0;
        }

        .dudex-profile-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .dudex-readonly-note {
          display: block;
          margin-top: 5px;
          font-size: 10px;
          color: var(--text-muted);
        }

        .dudex-profile-select-disabled {
          opacity: 0.85;
          pointer-events: none;
        }

        .dudex-profile-photo-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .dudex-profile-photo-actions button,
        .dudex-profile-photo-actions label {
          font-size: 11px;
        }

        .dudex-student-batch-badge {
          display: inline-flex;
          align-items: center;
          margin-top: 7px;
          padding: 4px 9px;
          border-radius: 5px;
          background: #f2e7d8;
          color: #8b6238;
          font-size: 11px;
          font-weight: 600;
        }

        @media (max-width: 1000px) {
          .dudex-profile-layout {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 640px) {
          .dudex-profile-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .dudex-profile-card {
            padding: 16px !important;
          }

          .dudex-profile-card-header {
            flex-wrap: wrap;
          }

          .dudex-profile-actions button {
            flex: 1 1 auto;
          }
        }
      `}</style>

      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <div className="eyebrow">Student Identity</div>

          <h1>My Profile</h1>

          <p className="page-copy">
            Manage your personal information and registered college details.
          </p>
        </div>
      </div>

      <div className="dudex-profile-layout">
        {/* ==========================================
            PERSONAL DETAILS
        ========================================== */}

        <form
          onSubmit={handlePersonalSave}
          className="content-card dudex-profile-card"
        >
          <div className="dudex-profile-card-header">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                minWidth: 0,
              }}
            >
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
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  (formData.full_name || 'S')
                    .split(' ')
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <h3 style={{ marginBottom: '4px' }}>
                  {formData.full_name || 'Student'}
                </h3>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    margin: 0,
                  }}
                >
                  {formData.career_interest || 'Student Profile'}
                </p>

                {/* STUDENT BATCH NUMBER */}
                {profile.batch && (
                  <span className="dudex-student-batch-badge">
                    {profile.batch}
                  </span>
                )}

                <div className="dudex-profile-photo-actions">
                  <label
                    htmlFor="dudex-profile-photo"
                    className="btn-outline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 9px',
                      cursor: 'pointer',
                    }}
                  >
                    <Camera size={13} />
                    Change Photo
                  </label>

                  {photoUrl && (
                    <button
                      type="button"
                      className="btn-outline"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 9px',
                      }}
                      onClick={handleRemovePhoto}
                    >
                      <X size={13} />
                      Remove
                    </button>
                  )}
                </div>

                <input
                  id="dudex-profile-photo"
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
              onClick={() => {
                if (personalEditing) {
                  setFormData(profile)
                  setPersonalEditing(false)
                } else {
                  setFormData(profile)
                  setPersonalEditing(true)
                }
              }}
            >
              {personalEditing ? 'Cancel' : 'Edit Personal Details'}
            </button>
          </div>

          {saveError && (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(163, 58, 58, 0.1)',
                color: 'var(--status-error, #a33a3a)',
                marginBottom: '16px',
                fontSize: '12px',
              }}
            >
              {saveError}
            </div>
          )}

          {savedCard === 'personal' && (
            <div
              role="status"
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

          <h4 className="dudex-profile-section-title">
            Personal & Contact Details
          </h4>

          <div className="dudex-profile-grid">
            <div className="form-group dudex-profile-field">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <label htmlFor="profileFullName" style={{ margin: 0 }}>
                  Full Name
                </label>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--gold-dark, #9C7449)',
                    fontWeight: 600,
                  }}
                >
                  <Lock size={12} /> Managed by Admin
                </span>
              </div>

              <input
                id="profileFullName"
                disabled={true}
                readOnly={true}
                value={formData.full_name || ''}
                style={{
                  background: 'var(--cream-primary, #FAF7F2)',
                  borderColor: '#E5D8CC',
                  cursor: 'not-allowed',
                  color: 'var(--text-primary, #252525)',
                  fontWeight: 500,
                }}
              />
              <small className="dudex-readonly-note">
                Official student name is managed by the administration.
              </small>
            </div>

            <div className="form-group dudex-profile-field">
              <label htmlFor="profilePersonalEmail">
                Personal Email
              </label>

              <input
                id="profilePersonalEmail"
                type="email"
                disabled={!personalEditing}
                value={formData.personal_email || ''}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    personal_email: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-group dudex-profile-field">
              <label htmlFor="profileWhatsapp">
                WhatsApp Number
              </label>

              <input
                id="profileWhatsapp"
                disabled={!personalEditing}
                value={formData.whatsapp || ''}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    whatsapp: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-group dudex-profile-field">
              <label htmlFor="profileAlternatePhone">
                Alternate Phone
              </label>

              <input
                id="profileAlternatePhone"
                disabled={!personalEditing}
                value={formData.alternate_phone || ''}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    alternate_phone: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <div
            className="form-group"
            style={{ marginTop: '14px' }}
          >
            <label htmlFor="profileAddress">Current Address</label>

            <textarea
              id="profileAddress"
              disabled={!personalEditing}
              rows={3}
              value={formData.address || ''}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  address: event.target.value,
                })
              }
            />
          </div>

          <h4 className="dudex-profile-section-title">
            Professional Portfolio Links
          </h4>

          <div className="dudex-profile-grid">
            <div className="form-group dudex-profile-field">
              <label htmlFor="profileGithub">GitHub URL</label>

              <input
                id="profileGithub"
                type="url"
                disabled={!personalEditing}
                value={formData.github || ''}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    github: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-group dudex-profile-field">
              <label htmlFor="profileLinkedin">LinkedIn URL</label>

              <input
                id="profileLinkedin"
                type="url"
                disabled={!personalEditing}
                value={formData.linkedin || ''}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    linkedin: event.target.value,
                  })
                }
              />
            </div>
          </div>

          {personalEditing && (
            <div className="dudex-profile-actions">
              <button type="submit" className="btn-primary" disabled={isSaving}>
                <CheckCircle2 size={16} />
                {isSaving ? 'Saving...' : 'Save Personal Details'}
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

        {/* ==========================================
            COLLEGE INFORMATION
        ========================================== */}

        <div className="content-card dudex-profile-card">
          <div className="dudex-profile-card-header">
            <div>
              <div
                className="eyebrow"
                style={{ color: 'var(--gold-dark)' }}
              >
                Registration Details
              </div>

              <h3 style={{ margin: '8px 0 4px' }}>
                College Information
              </h3>

              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  margin: 0,
                }}
              >
                Official academic records registered with DudeX Smart Academy.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--gold-dark, #9c7449)',
                background: 'rgba(181, 138, 90, 0.12)',
                padding: '6px 10px',
                borderRadius: 6,
              }}
            >
              <Lock size={13} /> Managed by Admin
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: '14px',
            }}
          >
            {/* COLLEGE NAME — READ-ONLY */}
            <div className="form-group">
              <label htmlFor="collegeInfoCollegeName">
                College Name
              </label>

              <input
                id="collegeInfoCollegeName"
                disabled
                readOnly
                value={effectiveCollegeName || ''}
                placeholder="College name"
                style={{
                  background: 'var(--cream-primary, #FAF7F2)',
                  borderColor: '#E5D8CC',
                  cursor: 'not-allowed',
                  color: 'var(--text-primary, #252525)',
                }}
              />

              <small className="dudex-readonly-note">
                Locked to the college selected during registration.
              </small>
            </div>

            {/* COLLEGE EMAIL — READ-ONLY */}
            <div className="form-group">
              <label htmlFor="collegeInfoEmail">
                College Mail ID{' '}
                <span style={{ color: 'var(--text-muted)' }}>
                  (Locked)
                </span>
              </label>

              <input
                id="collegeInfoEmail"
                type="email"
                value={collegeData.college_email || profile.college_email || profile.personal_email || ''}
                readOnly
                disabled
                aria-readonly="true"
                style={{
                  background: 'var(--cream-primary, #FAF7F2)',
                  borderColor: '#E5D8CC',
                  cursor: 'not-allowed',
                  color: 'var(--text-primary, #252525)',
                }}
              />

              <small className="dudex-readonly-note">
                Your verified college email cannot be changed here.
              </small>
            </div>

            {/* REGISTER NUMBER — READ-ONLY */}
            <div className="form-group">
              <label htmlFor="collegeInfoRegisterNumber">
                College Register Number
              </label>

              <input
                id="collegeInfoRegisterNumber"
                disabled
                readOnly
                value={collegeData.register_number || profile.roll_number || profile.rrn || ''}
                style={{
                  background: 'var(--cream-primary, #FAF7F2)',
                  borderColor: '#E5D8CC',
                  cursor: 'not-allowed',
                  color: 'var(--text-primary, #252525)',
                }}
              />

              <small className="dudex-readonly-note">
                Managed by the college administration.
              </small>
            </div>

            {/* DEGREE — READ-ONLY */}
            <div className="form-group">
              <label htmlFor="collegeInfoCourse">Degree</label>

              <input
                id="collegeInfoCourse"
                disabled
                readOnly
                value={collegeData.course || (profile as any).course || (profile.department ? 'B.Tech' : '') || ''}
                style={{
                  background: 'var(--cream-primary, #FAF7F2)',
                  borderColor: '#E5D8CC',
                  cursor: 'not-allowed',
                  color: 'var(--text-primary, #252525)',
                }}
              />
            </div>

            {/* SPECIALIZATION — READ-ONLY */}
            <div className="form-group">
              <label htmlFor="collegeInfoSpecialization">
                Specialization
              </label>

              <input
                id="collegeInfoSpecialization"
                disabled
                readOnly
                value={collegeData.specialization || profile.specialization || profile.department || ''}
                style={{
                  background: 'var(--cream-primary, #FAF7F2)',
                  borderColor: '#E5D8CC',
                  cursor: 'not-allowed',
                  color: 'var(--text-primary, #252525)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileView