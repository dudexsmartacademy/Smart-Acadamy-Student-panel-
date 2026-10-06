import { useState } from 'react'
import { ArrowUpRight, ChevronLeft, Lock, Mail } from 'lucide-react'
import type { RegistrationDetails } from '../../types'
import { useAuth } from '../../context/AuthContext'

export function PublicApp({
  mode,
  setMode,
  onLogin,
  onRegistrationSave,
}: {
  mode: 'landing' | 'verify' | 'login' | 'signup' | 'forgot' | 'status'
  setMode: (m: 'portal' | 'landing' | 'verify' | 'login' | 'signup' | 'forgot' | 'status') => void
  onLogin: () => void
  onRegistrationSave: (details: RegistrationDetails) => void
}) {
  const { loginWithPassword, loginWithOtp, verifyLoginOtp, saveRegistrationDetails, authError, setAuthError, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [usePasswordLogin, setUsePasswordLogin] = useState(true)
  const [loginOtp, setLoginOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [localError, setLocalError] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [verifiedCollegeEmail, setVerifiedCollegeEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both your college mail ID and password.')
      return
    }
    setSubmitting(true)
    setLocalError('')
    setAuthError(null)

    try {
      await loginWithPassword(email.trim(), password.trim())
      onLogin()
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOtpRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setLocalError('Please enter your college mail ID.')
      return
    }
    setSubmitting(true)
    setLocalError('')
    setAuthError(null)

    try {
      await loginWithOtp(email.trim())
      setOtpSent(true)
    } catch (err: any) {
      setLocalError(err.message || 'Could not send OTP to the provided college mail ID.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginOtp.trim()) {
      setLocalError('Please enter the OTP sent to your mail ID.')
      return
    }
    setSubmitting(true)
    setLocalError('')
    setAuthError(null)

    try {
      await verifyLoginOtp(email.trim(), loginOtp.trim())
      onLogin()
    } catch (err: any) {
      setLocalError(err.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (mode === 'landing') {
    return (
      <div className="auth-shell dudex-landing-responsive">
        <style>{`
          .dudex-landing-responsive {
            width: 100%;
            min-height: 100vh;
            box-sizing: border-box;
            padding: clamp(24px, 5vw, 56px) 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-x: hidden;
          }
          .dudex-landing-inner {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
          }
          .dudex-landing-actions {
            display: flex;
            gap: 14px;
            justify-content: center;
            margin-bottom: 48px;
          }
          .dudex-landing-features {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
            text-align: left;
            width: 100%;
          }
          @media (max-width: 700px) {
            .dudex-landing-responsive {
              padding: 28px 16px 32px;
            }
            .dudex-landing-actions {
              flex-direction: column;
              gap: 10px;
            }
            .dudex-landing-features {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <div className="dudex-landing-inner">
          <div className="brand-mark" style={{ width: '54px', height: '54px', fontSize: '24px', margin: '0 auto 20px' }}>
            D
          </div>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>DudeX Innovations · Education Division</div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: '16px 0', lineHeight: '1.1' }}>
            DudeX Smart Academy
          </h1>
          <p className="landing-copy" style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 32px' }}>
            Learn. Grow. Achieve.<br />
            Your personal digital learning and placement-training workspace.
          </p>

          {(authError || localError) && (
            <div
              style={{
                maxWidth: '480px',
                margin: '0 auto 24px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#fff6f6',
                border: '1px solid #e5b9b9',
                color: '#a33a3a',
                fontSize: '13px',
                textAlign: 'center',
              }}
            >
              {authError || localError}
            </div>
          )}

          <div className="dudex-landing-actions">
            <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }} onClick={() => setMode('login')}>
              Enter Student Portal <ArrowUpRight size={16} />
            </button>
            <button className="btn-outline" style={{ padding: '12px 28px', fontSize: '15px' }} onClick={() => setMode('verify')}>
              Register as Student
            </button>
          </div>

          <div className="dudex-landing-features">
            <div className="content-card dudex-landing-feature">
              <strong style={{ color: 'var(--gold-dark)', fontSize: '12px' }}>01 / LIVE ACADEMY</strong>
              <h4 style={{ margin: '8px 0 4px' }}>Real-Time Live Classes</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Join daily placement classes with faculty via Google Meet.</p>
            </div>
            <div className="content-card dudex-landing-feature">
              <strong style={{ color: 'var(--gold-dark)', fontSize: '12px' }}>02 / DAILY NOTES</strong>
              <h4 style={{ margin: '8px 0 4px' }}>Rich Visual Archives</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Multi-image galleries, code breakdowns, and lecture PDFs.</p>
            </div>
            <div className="content-card dudex-landing-feature">
              <strong style={{ color: 'var(--gold-dark)', fontSize: '12px' }}>03 / ASSESSMENTS</strong>
              <h4 style={{ margin: '8px 0 4px' }}>Timed Evaluations</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>MCQs with autosave and sandboxed coding challenge IDE.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell dudex-auth-responsive">
      <style>{`
        .dudex-auth-responsive {
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          padding: 32px 20px;
          overflow-y: auto;
        }
        .dudex-auth-responsive .auth-card {
          width: min(100%, 760px);
          max-width: 760px;
          box-sizing: border-box;
          margin: 0 auto;
          padding: 32px;
        }
        .dudex-auth-responsive .auth-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 18px;
          width: 100%;
        }
        @media (max-width: 700px) {
          .dudex-auth-responsive .auth-card {
            padding: 24px 18px;
          }
          .dudex-auth-responsive .auth-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="auth-card">
        {(mode === 'verify' || mode === 'login' || mode === 'signup') && (
          <div style={{ marginBottom: '18px' }}>
            <button
              type="button"
              className="btn-link"
              onClick={() => setMode('landing')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
              }}
            >
              <ChevronLeft size={15} />
              Back to Home
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            cursor: 'pointer',
          }}
          onClick={() => setMode('landing')}
        >
          <div className="brand-mark" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
            D
          </div>
          <strong>DudeX Smart Academy · Student Portal</strong>
        </div>

        {(authError || localError) && (
          <div
            role="alert"
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #e5b9b9',
              background: '#fff6f6',
              color: '#a33a3a',
              fontSize: '12.5px',
              lineHeight: 1.45,
            }}
          >
            {authError || localError}
          </div>
        )}

        {mode === 'verify' && (
          <div className="fade-in">
            <div className="eyebrow">Student Identity Check</div>
            <h2>Student Account Verification</h2>
            <p className="page-copy" style={{ marginBottom: '20px' }}>
              Enter your official college mail ID to begin your student registration process.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const mail = verificationEmail.trim()
                if (!mail) {
                  setLocalError('Please enter your official college mail ID.')
                  return
                }
                setLocalError('')
                setVerifiedCollegeEmail(mail)
                setMode('signup')
              }}
            >
              <div className="form-group">
                <label>College Mail ID</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={verificationEmail}
                  onChange={(e) => {
                    setVerificationEmail(e.target.value)
                    if (localError) setLocalError('')
                  }}
                  placeholder="student@dudex.edu.in"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '16px' }}
              >
                Continue to Student Form <ArrowUpRight size={16} />
              </button>
            </form>
          </div>
        )}

        {mode === 'login' && (
          <div>
            <div className="eyebrow">Supabase Auth & RLS Protected</div>
            <h2>Sign In to Student Portal</h2>
            <p className="page-copy" style={{ marginBottom: '20px' }}>
              Authentication is authorized against single Supabase backend.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                type="button"
                className={usePasswordLogin ? 'btn-primary' : 'btn-outline'}
                style={{ flex: 1, padding: '8px', fontSize: '13px', justifyContent: 'center' }}
                onClick={() => { setUsePasswordLogin(true); setLocalError(''); }}
              >
                <Lock size={14} /> Password Login
              </button>
              <button
                type="button"
                className={!usePasswordLogin ? 'btn-primary' : 'btn-outline'}
                style={{ flex: 1, padding: '8px', fontSize: '13px', justifyContent: 'center' }}
                onClick={() => { setUsePasswordLogin(false); setLocalError(''); }}
              >
                <Mail size={14} /> Email OTP Login
              </button>
            </div>

            {usePasswordLogin ? (
              <form onSubmit={handlePasswordLoginSubmit}>
                <div className="form-group">
                  <label>College Mail ID</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@dudex.edu.in"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || loading}
                  style={{ width: '100%', marginTop: '18px' }}
                >
                  {submitting ? 'Authenticating...' : 'Sign In as Student'} <ArrowUpRight size={16} />
                </button>
              </form>
            ) : !otpSent ? (
              <form onSubmit={handleOtpRequestSubmit}>
                <div className="form-group">
                  <label>College Mail ID</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@dudex.edu.in"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || loading}
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  {submitting ? 'Sending OTP...' : 'Send Magic OTP Link'} <ArrowUpRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerifySubmit}>
                <div className="form-group">
                  <label>College Mail ID</label>
                  <input type="email" value={email} readOnly />
                </div>

                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>Enter Supabase OTP Code</label>
                  <input
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    placeholder="Enter OTP token"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || loading}
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  {submitting ? 'Verifying...' : 'Verify OTP & Sign In'} <ArrowUpRight size={16} />
                </button>

                <button
                  type="button"
                  className="btn-link"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={() => setOtpSent(false)}
                >
                  Change Email Address
                </button>
              </form>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '24px',
                fontSize: '12.5px',
              }}
            >
              <button className="btn-link" onClick={() => setMode('signup')}>
                New Student? Register Account
              </button>
              <button className="btn-link" onClick={() => setMode('forgot')}>
                Forgot Password?
              </button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div className="fade-in">
            <div className="eyebrow">Student Registration</div>
            <h2>Create Student Account</h2>
            <p className="page-copy" style={{ marginBottom: '20px' }}>
              Account will be initialized in Supabase PostgreSQL (`profiles` and `student_profiles`).
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget
                const data = new FormData(form)

                const submittedEmail = verifiedCollegeEmail || String(data.get('collegeEmail') || '').trim()
                const pass = String(data.get('password') || '').trim()

                const details: RegistrationDetails & { password?: string } = {
                  full_name: String(data.get('fullName') || ''),
                  college_name: String(data.get('collegeName') || ''),
                  college_email: submittedEmail,
                  register_number: String(data.get('registerNumber') || ''),
                  phone_number: String(data.get('phoneNumber') || ''),
                  course: String(data.get('course') || ''),
                  specialization: String(data.get('specialization') || ''),
                  section: String(data.get('section') || ''),
                  password: pass || 'Student@123',
                }

                setSubmitting(true)
                setLocalError('')
                try {
                  await saveRegistrationDetails(details)
                  onRegistrationSave(details)
                  setMode('status')
                } catch (err: any) {
                  setLocalError(err.message || 'Registration failed.')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              <div className="auth-form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input required name="fullName" placeholder="Student Full Name" />
                </div>

                <div className="form-group">
                  <label>College Name</label>
                  <input required name="collegeName" placeholder="DudeX Academy / Institution" />
                </div>

                <div className="form-group">
                  <label>College Mail ID</label>
                  <input
                    type="email"
                    required
                    name="collegeEmail"
                    value={verifiedCollegeEmail || email}
                    onChange={(e) => setVerifiedCollegeEmail(e.target.value)}
                    placeholder="student@dudex.edu.in"
                  />
                </div>

                <div className="form-group">
                  <label>Register / RRN Number</label>
                  <input required name="registerNumber" placeholder="24AIDS001" />
                </div>

                <div className="form-group">
                  <label>WhatsApp / Phone</label>
                  <input required name="phoneNumber" placeholder="+91 98765 43210" />
                </div>

                <div className="form-group">
                  <label>Course / Department</label>
                  <input required name="course" placeholder="B.Tech AI & DS" />
                </div>

                <div className="form-group">
                  <label>Specialization</label>
                  <input required name="specialization" placeholder="Full Stack AI Engineering" />
                </div>

                <div className="form-group">
                  <label>Section</label>
                  <input required name="section" placeholder="Section B" />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Account Password</label>
                  <input
                    type="password"
                    required
                    name="password"
                    placeholder="Create a strong account password"
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ width: '100%', marginTop: '20px' }}
              >
                {submitting ? 'Initializing Account in Supabase...' : 'Complete Student Registration'} <ArrowUpRight size={16} />
              </button>
            </form>
          </div>
        )}

        {mode === 'status' && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Account Registered</div>
            <h2 style={{ margin: '12px 0' }}>Registration Successful!</h2>
            <p className="page-copy" style={{ maxWidth: '480px', margin: '0 auto 24px' }}>
              Your student profile has been created in the Supabase backend. You can now log into your student learning portal.
            </p>

            <button
              className="btn-primary"
              style={{ padding: '12px 32px' }}
              onClick={() => setMode('login')}
            >
              Sign In Now <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export const AuthPage = PublicApp
export default AuthPage
