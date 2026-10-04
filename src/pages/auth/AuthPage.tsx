import { useState } from 'react'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import type { RegistrationDetails } from '../../types'

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
  const [email, setEmail] = useState('')
  const [loginOtp, setLoginOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [verificationOtp, setVerificationOtp] = useState('')
  const [verificationOtpSent, setVerificationOtpSent] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [verifiedCollegeEmail, setVerifiedCollegeEmail] = useState('')

  // Demo verification credential. Replace this with your backend/API verification later.

  if (mode === 'landing') {
    return (
      <div className="auth-shell dudex-landing-responsive">
        <style>{`
          .dudex-landing-responsive {
            width: 100%;
            min-height: 100vh;
            min-height: 100dvh;
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

          .dudex-landing-actions button {
            min-width: 0;
          }

          .dudex-landing-features {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
            text-align: left;
            width: 100%;
          }

          .dudex-landing-feature {
            min-width: 0;
            width: 100%;
          }

          @media (max-width: 700px) {
            .dudex-landing-responsive {
              align-items: flex-start;
              padding: 28px 16px 32px;
            }

            .dudex-landing-inner {
              max-width: 100%;
            }

            .dudex-landing-responsive .brand-mark {
              width: 50px !important;
              height: 50px !important;
              margin-bottom: 16px !important;
            }

            .dudex-landing-responsive h1 {
              font-size: clamp(30px, 9vw, 42px) !important;
              line-height: 1.08 !important;
              margin: 14px 0 !important;
              overflow-wrap: anywhere;
            }

            .dudex-landing-responsive .eyebrow {
              font-size: 10px !important;
              line-height: 1.4;
            }

            .dudex-landing-responsive .landing-copy {
              font-size: 15px !important;
              line-height: 1.5 !important;
              margin-bottom: 24px !important;
            }

            .dudex-landing-actions {
              width: 100%;
              flex-direction: column;
              gap: 10px;
              margin-bottom: 30px;
            }

            .dudex-landing-actions button {
              width: 100%;
              min-height: 46px;
              justify-content: center;
              padding: 12px 16px !important;
              font-size: 14px !important;
            }

            .dudex-landing-features {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .dudex-landing-feature {
              padding: 16px !important;
            }

            .dudex-landing-feature h4 {
              font-size: 15px;
            }

            .dudex-landing-feature p {
              font-size: 12.5px !important;
              line-height: 1.5;
              margin-bottom: 0;
            }
          }

          @media (max-width: 420px) {
            .dudex-landing-responsive {
              padding: 22px 12px 28px;
            }

            .dudex-landing-responsive h1 {
              font-size: clamp(27px, 9vw, 36px) !important;
            }

            .dudex-landing-responsive .landing-copy {
              font-size: 14px !important;
            }

            .dudex-landing-feature {
              padding: 14px !important;
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

        .dudex-auth-responsive .auth-card input,
        .dudex-auth-responsive .auth-card select,
        .dudex-auth-responsive .auth-card textarea {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .dudex-auth-responsive .auth-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 18px;
          width: 100%;
        }

        .dudex-auth-responsive .auth-form-grid .form-group {
          min-width: 0;
          margin: 0;
        }

        .dudex-auth-responsive .auth-form-grid input {
          min-height: 42px;
        }

        .dudex-auth-responsive .auth-card form > .btn-primary,
        .dudex-auth-responsive .auth-card form > button {
          width: 100%;
          box-sizing: border-box;
        }

        .dudex-auth-responsive .verification-error {
          overflow-wrap: anywhere;
        }

        .dudex-auth-responsive input[readonly] {
          background: #f7f4ef;
          color: var(--text-secondary);
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .dudex-auth-responsive {
            padding: 20px 14px;
            align-items: flex-start;
          }

          .dudex-auth-responsive .auth-card {
            width: 100%;
            max-width: 100%;
            padding: 24px 18px;
            border-radius: 14px;
          }

          .dudex-auth-responsive .auth-form-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .dudex-auth-responsive .auth-card h2 {
            font-size: 24px;
            line-height: 1.2;
          }

          .dudex-auth-responsive .auth-card .page-copy {
            font-size: 13px;
          }
        }

        @media (max-width: 420px) {
          .dudex-auth-responsive {
            padding: 12px 10px;
          }

          .dudex-auth-responsive .auth-card {
            padding: 20px 14px;
          }

          .dudex-auth-responsive .auth-card > div:first-child {
            margin-bottom: 14px !important;
          }

          .dudex-auth-responsive .auth-card input,
          .dudex-auth-responsive .auth-card select,
          .dudex-auth-responsive .auth-card textarea {
            font-size: 14px;
          }

          .dudex-auth-responsive .auth-card .btn-link {
            font-size: 13px;
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
              Back
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
          <div
            className="brand-mark"
            style={{ width: '32px', height: '32px', fontSize: '14px' }}
          >
            D
          </div>
          <strong>DudeX Smart Academy</strong>
        </div>

        {mode === 'verify' && (
          <div className="fade-in">
            <div className="eyebrow">Student Verification</div>
            <h2>Verify Your Student Account</h2>
            <p className="page-copy" style={{ marginBottom: '20px' }}>
              Enter your college mail ID to receive a verification OTP and continue to the registration details.
            </p>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()

                const demoEmail = verificationEmail.trim()
                if (!demoEmail) {
                  setVerificationError('Please enter your college mail ID.')
                  return
                }

                if (!verificationOtpSent) {
                  setVerificationError('')
                  setVerificationOtp('')
                  setVerificationOtpSent(true)
                  return
                }

                // Demo OTP flow. Replace with a backend-generated OTP in production.
                if (verificationOtp.trim() !== '123456') {
                  setVerificationError('Invalid OTP. Please enter the 6-digit OTP sent to your college mail ID.')
                  return
                }

                setVerificationError('')
                setVerifiedCollegeEmail(demoEmail)
                setVerificationOtp('')
                setVerificationOtpSent(false)
                setMode('signup')
              }}
            >
              <div className="form-group">
                <label>College Mail ID</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={verificationEmail}
                  disabled={verificationOtpSent}
                  onChange={(e) => {
                    setVerificationEmail(e.target.value)
                    if (verificationError) setVerificationError('')
                  }}
                  placeholder="you@college.edu"
                  required
                />
              </div>

              {verificationOtpSent && (
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationOtp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setVerificationOtp(value)
                      if (verificationError) setVerificationError('')
                    }}
                    placeholder="Enter 6-digit OTP"
                    required
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    OTP sent to <strong>{verificationEmail}</strong>.
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Demo OTP: 123456
                  </div>
                </div>
              )}

              {verificationError && (
                <div
                  role="alert"
                  style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5b9b9',
                    background: '#fff6f6',
                    color: '#a33a3a',
                    fontSize: '12px',
                    lineHeight: 1.45,
                  }}
                >
                  {verificationError}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '16px' }}
              >
                {verificationOtpSent ? 'Verify OTP & Continue' : 'Send OTP'} <ArrowUpRight size={16} />
              </button>

              {verificationOtpSent && (
                <button
                  type="button"
                  className="btn-link"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={() => {
                    setVerificationOtp('')
                    setVerificationError('')
                    setVerificationOtpSent(false)
                  }}
                >
                  Change College Mail ID
                </button>
              )}
            </form>

            <p
              style={{
                margin: '14px 0 0',
                textAlign: 'center',
                fontSize: '11px',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              Verification is required before the registration form can be opened.
            </p>
          </div>
        )}

        {mode === 'login' && (
          <div>
            <div className="eyebrow">Student Authentication</div>
            <h2>Sign In to Portal</h2>
            <p className="page-copy" style={{ marginBottom: '20px' }}>
              Enter your registered college mail ID to receive a one-time password (OTP).
            </p>

            {!otpSent ? (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()

                  const enteredEmail = email.trim()
                  if (!enteredEmail) return

                  setOtpError('')
                  setLoginOtp('')
                  setOtpSent(true)
                }}
              >
                <div className="form-group">
                  <label>College Mail ID</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '14px' }}
                >
                  Send OTP <ArrowUpRight size={16} />
                </button>
              </form>
            ) : (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()

                  if (loginOtp.trim() !== '123456') {
                    setOtpError('Invalid OTP. Please enter the 6-digit OTP sent to your college mail ID.')
                    return
                  }

                  setOtpError('')
                  onLogin()
                }}
              >
                <div className="form-group">
                  <label>College Mail ID</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    autoComplete="email"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={loginOtp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setLoginOtp(value)
                      if (otpError) setOtpError('')
                    }}
                    placeholder="Enter 6-digit OTP"
                    autoComplete="one-time-code"
                    required
                  />
                </div>

                {otpError && (
                  <div
                    role="alert"
                    style={{
                      marginTop: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5b9b9',
                      background: '#fff6f6',
                      color: '#a33a3a',
                      fontSize: '12px',
                      lineHeight: 1.45,
                    }}
                  >
                    {otpError}
                  </div>
                )}

                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#f7f4ef',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    lineHeight: 1.45,
                  }}
                >
                  OTP has been sent to <strong>{email}</strong>.
                  <br />
                  <span style={{ color: 'var(--text-muted)' }}>Demo OTP: 123456</span>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '14px' }}
                >
                  Verify OTP & Sign In <ArrowUpRight size={16} />
                </button>

                <button
                  type="button"
                  className="btn-link"
                  style={{ width: '100%', marginTop: '14px' }}
                  onClick={() => {
                    setOtpSent(false)
                    setLoginOtp('')
                    setOtpError('')
                  }}
                >
                  Change College Mail ID / Resend OTP
                </button>
              </form>
            )}

            <button
              type="button"
              className="btn-outline"
              style={{
                width: '100%',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              onClick={() => {
                window.alert('Google sign-in is not available in the demo. Please sign in using your college mail ID and password.')
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.79-.07-1.54-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.5Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.09.31-1.59V7.88H3.3A9.5 9.5 0 0 0 2.25 12c0 1.48.35 2.88 1.05 4.12l3.24-2.53Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.38c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.83 3.49 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38Z"
                />
              </svg>
              Continue with Google
            </button>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '20px',
                fontSize: '12.5px',
              }}
            >
              <button
                className="btn-link"
                onClick={() => setMode('signup')}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            {!verifiedCollegeEmail ? (
              <div className="fade-in">
                <div className="eyebrow">Verification Required</div>
                <h2>Verify Your College Email</h2>
                <p className="page-copy" style={{ marginBottom: '18px' }}>
                  Student verification must be completed before the registration details can be entered.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => setMode('verify')}
                >
                  Go to Verification <ArrowUpRight size={16} />
                </button>
              </div>
            ) : (
              <>
            <div className="eyebrow">Registration</div>
            <h2>Create Student Account</h2>
            <p className="page-copy" style={{ marginBottom: '20px' }}>
              Enter your academic and contact details to create your student
              account.
            </p>

            <div
              style={{
                marginBottom: '18px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cfe2d4',
                background: '#f4faf5',
                color: '#2f6b3d',
                fontSize: '12px',
                lineHeight: 1.45,
              }}
            >
              <strong>Student verified.</strong> Your college mail ID has been verified and is locked to this registration.
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const data = new FormData(form)

                const submittedCollegeEmail = String(data.get('collegeEmail') || '').trim()

                if (!verifiedCollegeEmail || submittedCollegeEmail.toLowerCase() !== verifiedCollegeEmail.trim().toLowerCase()) {
                  setVerificationError('Please complete student verification before creating your account.')
                  setMode('verify')
                  return
                }

                const details: RegistrationDetails = {
                  full_name: String(data.get('fullName') || ''),
                  college_name: String(data.get('collegeName') || ''),
                  college_email: submittedCollegeEmail,
                  register_number: String(data.get('registerNumber') || ''),
                  phone_number: String(data.get('phoneNumber') || ''),
                  course: String(data.get('course') || ''),
                  specialization: String(data.get('specialization') || ''),
                  section: String(data.get('section') || ''),
                }

                onRegistrationSave(details)
                setMode('status')
              }}
            >
              <div className="auth-form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    required
                    name="fullName"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label>College Name</label>
                  <input
                    required
                    name="collegeName"
                    placeholder="Enter your college name"
                  />
                </div>

                <div className="form-group">
                  <label>College Mail ID</label>
                  <input
                    type="email"
                    required
                    name="collegeEmail"
                    value={verifiedCollegeEmail}
                    readOnly
                    placeholder="you@college.edu"
                  />
                </div>

                <div className="form-group">
                  <label>College Register Number</label>
                  <input
                    required
                    name="registerNumber"
                    placeholder="Enter register number"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    required
                    name="phoneNumber"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Course</label>
                  <input
                    required
                    name="course"
                    placeholder="e.g. B.E. / B.Tech"
                  />
                </div>

                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    required
                    name="specialization"
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div className="form-group">
                  <label>Section</label>
                  <input
                    required
                    name="section"
                    placeholder="e.g. A"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                Create Student Account <ArrowUpRight size={16} />
              </button>
            </form>

            <div
              style={{
                textAlign: 'center',
                marginTop: '20px',
                fontSize: '12.5px',
              }}
            >
              Already have an account?{' '}
              <button
                className="btn-link"
                onClick={() => setMode('login')}
              >
                Sign In
              </button>
            </div>
              </>
            )}
          </div>
        )}

        {mode === 'status' && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <div
              className="brand-mark"
              style={{
                width: '48px',
                height: '48px',
                fontSize: '20px',
                margin: '0 auto 16px',
              }}
            >
              ✓
            </div>

            <div
              className="eyebrow"
              style={{ justifyContent: 'center' }}
            >
              Registration Complete
            </div>

            <h2>Account Verified</h2>

            <p
              className="page-copy"
              style={{ margin: '14px auto 24px' }}
            >
              Your profile has been approved for DudeX Smart Academy. You can
              now access your live classes, daily notes, and assessments.
            </p>

            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={onLogin}
            >
              Enter Student Dashboard <ArrowUpRight size={16} />
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="fade-in">
            <div className="eyebrow">Password Reset</div>
            <h2>Reset Your Access</h2>

            <p className="page-copy" style={{ marginBottom: '20px' }}>
              Enter your email to receive recovery instructions.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                alert('Password reset link sent.')
                setMode('login')
              }}
            >
              <div className="form-group">
                <label>College Mail ID</label>
                <input
                  type="email"
                  required
                  placeholder="you@college.edu"
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                Send Reset Link
              </button>
            </form>

            <button
              className="btn-link"
              style={{ marginTop: '16px' }}
              onClick={() => setMode('login')}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )

}

export const AuthPage = PublicApp
export default AuthPage
