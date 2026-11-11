import { useState } from 'react'
export function SettingsView() {
  const [preferences, setPreferences] = useState({
    liveAlerts: true,
    noteAlerts: true,
    assessmentReminders: true,
    emailDigest: false,
  })

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Preferences</div>
          <h1>Settings & Privacy</h1>
          <p className="page-copy">Customize alerts, email notifications, and active session security.</p>
        </div>
      </div>

      <div className="note-viewer-layout">
        <div className="content-card">
          <h3 style={{ marginBottom: '16px' }}>Notification Preferences</h3>

          {[
            { key: 'liveAlerts', title: 'Live Class Reminders', desc: 'Notify 15 minutes before meeting starts on Google Meet.' },
            { key: 'noteAlerts', title: 'New Daily Notes', desc: 'Alert when faculty shares code sheets and lecture handouts.' },
            { key: 'assessmentReminders', title: ' Deadlines', desc: 'Reminders before active test windows expire.' },
            { key: 'emailDigest', title: 'Weekly Progress Digest', desc: 'Receive performance score breakdown via email.' },
          ].map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid var(--cream-secondary)',
              }}
            >
              <div>
                <strong style={{ fontSize: '13.5px', display: 'block' }}>{item.title}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
              <input
                type="checkbox"
                checked={preferences[item.key as keyof typeof preferences]}
                onChange={() => setPreferences({
                  ...preferences,
                  [item.key]: !preferences[item.key as keyof typeof preferences],
                })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-black)' }}
              />
            </div>
          ))}
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '16px' }}>Account Security</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Keep your password and active login sessions secure.
          </p>
          <button className="btn-outline" style={{ width: '100%', marginBottom: '10px' }} onClick={() => alert('Password reset email sent.')}>
            Change Password
          </button>
          <button className="btn-danger" style={{ width: '100%' }} onClick={() => alert('All active sessions logged out.')}>
            Log Out All Other Devices
          </button>
        </div>
      </div>
    </div>
  )
}

export const SettingsPage = SettingsView
export default SettingsPage
