import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Search,
  X,
  RotateCw,
} from 'lucide-react'
import type { RegistrationDetails } from '../../types'
import {
  fetchColleges,
  getCollegesList,
  getBatchesList,
  getDegreesForCollege,
  getSpecializationsForCollege,
  validateAcademicSelection,
} from '../../services/academicService'
import { checkStudentEmailEligibility } from '../../services/eligibilityService'
/* -------------------------------------------------
   SEARCHABLE DROPDOWN
   Both Degree and Specialization open upwards.
------------------------------------------------- */
interface SearchableDropdownProps {
  id: string
  label: string
  placeholder: string
  options: string[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
}
function SearchableDropdown({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.trim().toLowerCase()),
  )
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])
  useEffect(() => {
    if (open) {
      searchRef.current?.focus()
    }
  }, [open])
  function selectOption(option: string) {
    onChange(option)
    setOpen(false)
    setSearch('')
  }
  return (
    <div
      ref={containerRef}
      className={`dudex-search-select ${open ? 'dropdown-open' : ''} ${disabled ? 'is-disabled' : ''}`}
    >
      <label
        className="dudex-select-label"
        htmlFor={`${id}-search`}
      >
        {label}
      </label>
      {/* Dropdown trigger */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        className={`dudex-select-trigger ${open ? 'is-open' : ''}`}
        style={
          disabled
            ? {
                opacity: 0.65,
                cursor: 'not-allowed',
                backgroundColor: 'var(--cream-secondary, #F3ECE3)',
              }
            : undefined
        }
        onClick={() => {
          if (disabled) return
          setOpen((current) => !current)
          setSearch('')
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? 'dudex-selected-value' : 'dudex-placeholder'}>
          {value || placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Clear ${label}`}
            className="dudex-select-clear"
            onClick={(event) => {
              event.stopPropagation()
              onChange('')
              setSearch('')
              setOpen(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                onChange('')
                setSearch('')
                setOpen(false)
              }
            }}
          >
            <X size={14} />
          </span>
        )}
        <ChevronDown
          size={16}
          className={`dudex-select-chevron ${open ? 'rotated' : ''}`}
        />
      </button>
      {/* Dropdown menu: positioned ABOVE the trigger */}
      {open && (
        <div className="dudex-select-menu">
          <div className="dudex-select-search">
            <Search size={15} />
            <input
              ref={searchRef}
              id={`${id}-search`}
              type="text"
              value={search}
              placeholder={`Search ${label.toLowerCase()}...`}
              onChange={(event) => setSearch(event.target.value)}
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div
            className="dudex-select-options"
            role="listbox"
            aria-label={label}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option}
                  key={option}
                  className={`dudex-select-option ${
                    value === option ? 'selected' : ''
                  }`}
                  onClick={() => selectOption(option)}
                >
                  <span>{option}</span>
                  {value === option && (
                    <span className="dudex-option-check">✓</span>
                  )}
                </button>
              ))
            ) : (
              <p className="dudex-no-options">
                No matching options found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
/* -------------------------------------------------
   AUTHENTICATION PAGE
------------------------------------------------- */
type AuthMode =
  | 'landing'
  | 'verify'
  | 'login'
  | 'signup'
  | 'forgot'
  | 'status'
type SetAuthMode = (mode: AuthMode | 'portal') => void
interface PublicAppProps {
  mode: AuthMode
  setMode: SetAuthMode
  onLogin: () => void
  onRegistrationSave: (details: RegistrationDetails) => void | Promise<void>
}
export function PublicApp({
  mode,
  setMode,
  onLogin,
  onRegistrationSave,
}: PublicAppProps) {
  const { authNotice, setAuthNotice } = useAuth()

  // Login with Password state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Verification state (Email + OTP verification to unlock registration)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [verificationOtp, setVerificationOtp] = useState('')
  const [verificationOtpSent, setVerificationOtpSent] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [verifiedCollegeEmail, setVerifiedCollegeEmail] = useState('')

  // Registration details
  const [fullName, setFullName] = useState('')
  const [isOfficialName, setIsOfficialName] = useState(false)
  const [collegeName, setCollegeName] = useState('')
  const [registerNumber, setRegisterNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [degree, setDegree] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [batchName, setBatchName] = useState('')
  const [, setBatchLocked] = useState(false)
  const [section, setSection] = useState('')
  const [academicYear, setAcademicYear] = useState('')

  // A student who already verified their college email (signed-in session,
  // registration not finished) lands here after a reload: restore the verified
  // state and roster details from the session instead of asking for a new OTP.
  const { isEmailVerified, registrationDetails } = useAuth()
  useEffect(() => {
    if (mode !== 'signup' || verifiedCollegeEmail || !isEmailVerified) return
    const email = registrationDetails.college_email
    if (!email) return
    setVerifiedCollegeEmail(email)
    if (registrationDetails.full_name) {
      setFullName(registrationDetails.full_name)
      setIsOfficialName(true)
    }
    if (registrationDetails.college_name) setCollegeName(registrationDetails.college_name)
    if (registrationDetails.register_number) setRegisterNumber(registrationDetails.register_number)
    if (registrationDetails.phone_number) setPhoneNumber(registrationDetails.phone_number)
    if (registrationDetails.section) setSection(registrationDetails.section)
    if (registrationDetails.academic_year) setAcademicYear(registrationDetails.academic_year)
    if (registrationDetails.batch_name) setBatchName(registrationDetails.batch_name)
    checkStudentEmailEligibility(email)
      .then((eligibility) => {
        if (eligibility.batchName) {
          setBatchName(eligibility.batchName)
          setBatchLocked(true)
        }
      })
      .catch((err: unknown) => console.error('Could not reload roster details:', err))
  }, [mode, isEmailVerified, registrationDetails, verifiedCollegeEmail])

  // Password creation during registration
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [_registrationLoading, setRegistrationLoading] = useState(false)
  const [registrationError, setRegistrationError] = useState('')

  // Password reset state
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // OTP cooldown & attempt limits for verification
  const [verifyCooldown, setVerifyCooldown] = useState(0)
  const [verifyAttempts, setVerifyAttempts] = useState(0)
  const [verifyLockoutUntil, setVerifyLockoutUntil] = useState<number | null>(null)

  useEffect(() => {
    if (verifyCooldown <= 0) return
    const timer = setInterval(() => {
      setVerifyCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [verifyCooldown])


  const [collegesList, setCollegesList] = useState<string[]>(getCollegesList())

  useEffect(() => {
    fetchColleges().then(() => {
      setCollegesList(getCollegesList())
    })
  }, [])

  // collegesList is in the deps so options refresh once the college data has
  // loaded (the college can be pre-filled from the roster before that).
  const availableDegrees = useMemo(() => {
    return getDegreesForCollege(collegeName)
  }, [collegeName, collegesList])

  const availableBatches = useMemo(() => getBatchesList(collegeName), [collegeName, collegesList])

  const availableSpecializations = useMemo(() => {
    return getSpecializationsForCollege(collegeName, degree)
  }, [collegeName, degree, collegesList])

  const handleCollegeChange = (newCollege: string) => {
    setCollegeName(newCollege)
    setRegistrationError('')
    const newDegrees = getDegreesForCollege(newCollege)
    if (degree && !newDegrees.includes(degree)) {
      setDegree('')
      setSpecialization('')
    }
  }

  const handleDegreeChange = (newDegree: string) => {
    setDegree(newDegree)
    setRegistrationError('')
    const newSpecs = getSpecializationsForCollege(collegeName, newDegree)
    if (specialization && !newSpecs.includes(specialization)) {
      setSpecialization('')
    }
  }
  return (
    <div className="auth-shell dudex-auth-responsive">
      <style>{`
        .dudex-auth-responsive {
          box-sizing: border-box;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          padding: 28px 18px;
          overflow-x: clip;
        }
        .dudex-auth-responsive *,
        .dudex-auth-responsive *::before,
        .dudex-auth-responsive *::after {
          box-sizing: border-box;
        }
        .dudex-auth-responsive .auth-card {
          position: relative;
          width: 100%;
          max-width: 650px;
          min-width: 0;
          margin: 0 auto;
          padding: 28px;
        }
        .dudex-auth-responsive .auth-card input,
        .dudex-auth-responsive .auth-card textarea {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }
        .dudex-auth-responsive .auth-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 14px;
          width: 100%;
        }
        .dudex-auth-responsive .auth-form-grid > * {
          min-width: 0;
        }
        .dudex-auth-responsive .form-group {
          min-width: 0;
        }
        .dudex-auth-responsive .auth-form-grid input {
          min-height: 42px;
        }
        /* SEARCHABLE DROPDOWN */
        .dudex-auth-responsive .dudex-search-select {
          position: relative;
          width: 100%;
          min-width: 0;
        }
        .dudex-auth-responsive .dudex-select-label {
          display: block;
          margin-bottom: 7px;
          color: var(--text-primary, #252525);
          font-size: 12px;
          font-weight: 600;
        }
        .dudex-auth-responsive .dudex-select-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          min-width: 0;
          min-height: 42px;
          padding: 9px 11px;
          border: 1px solid #e5d6c7;
          border-radius: 6px;
          background: #fff;
          color: #252525;
          font: inherit;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
        }
        .dudex-auth-responsive .dudex-select-trigger:hover,
        .dudex-auth-responsive .dudex-select-trigger.is-open {
          border-color: #b58a5a;
        }
        .dudex-auth-responsive .dudex-selected-value,
        .dudex-auth-responsive .dudex-placeholder {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .dudex-auth-responsive .dudex-placeholder {
          color: #888;
        }
        .dudex-auth-responsive .dudex-select-chevron {
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }
        .dudex-auth-responsive .dudex-select-chevron.rotated {
          transform: rotate(180deg);
        }
        .dudex-auth-responsive .dudex-select-clear {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #888;
          cursor: pointer;
        }
        /*
         * IMPORTANT FIX:
         * The dropdown opens ABOVE the input.
         * This applies to both Degree and Specialization.
         */
        .dudex-auth-responsive .dudex-select-menu {
          position: absolute;
          z-index: 1000;
          top: auto;
          bottom: calc(100% + 5px);
          left: 0;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          overflow: hidden;
          border: 1px solid #e5d6c7;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        .dudex-auth-responsive .dudex-select-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 10px;
          border-bottom: 1px solid #eee4d9;
          background: #fff;
          color: #888;
        }
        .dudex-auth-responsive .dudex-select-search input {
          flex: 1;
          width: 100%;
          min-width: 0;
          min-height: 28px;
          margin: 0;
          padding: 4px 0;
          border: none;
          outline: none;
          box-shadow: none;
          background: transparent;
          font: inherit;
          font-size: 12px;
        }
        .dudex-auth-responsive .dudex-select-search button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 3px;
          border: none;
          background: transparent;
          color: #777;
          cursor: pointer;
        }
        .dudex-auth-responsive .dudex-select-options {
          max-height: min(190px, 28dvh);
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        .dudex-auth-responsive .dudex-select-option {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          min-width: 0;
          padding: 10px 11px;
          border: none;
          background: #fff;
          color: #292929;
          font: inherit;
          font-size: 12px;
          line-height: 1.45;
          text-align: left;
          white-space: normal;
          overflow-wrap: anywhere;
          cursor: pointer;
        }
        .dudex-auth-responsive .dudex-select-option:hover,
        .dudex-auth-responsive .dudex-select-option:focus-visible {
          background: #f7f0e7;
          outline: none;
        }
        .dudex-auth-responsive .dudex-select-option.selected {
          background: #f2e7d8;
          color: #80572f;
          font-weight: 600;
        }
        .dudex-auth-responsive .dudex-option-check {
          flex-shrink: 0;
        }
        .dudex-auth-responsive .dudex-no-options {
          margin: 0;
          padding: 14px 11px;
          color: #777;
          font-size: 12px;
          overflow-wrap: anywhere;
        }
        .dudex-auth-responsive .dudex-alert {
          margin-top: 12px;
          padding: 10px 12px;
          border: 1px solid #e5b9b9;
          border-radius: 8px;
          background: #fff6f6;
          color: #a33a3a;
          font-size: 12px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }
        .dudex-auth-responsive .dudex-success {
          margin-bottom: 18px;
          padding: 10px 12px;
          border: 1px solid #cfe2d4;
          border-radius: 8px;
          background: #f4faf5;
          color: #2f6b3d;
          font-size: 12px;
          line-height: 1.45;
        }
      .dudex-auth-responsive .google-signin-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: #202124;
        background: #fff;
        border-color: #e5d8ca;
      }

      .dudex-auth-responsive .google-signin-btn:hover {
        background: #f8f9fa;
        border-color: #c8c8c8;
      }

      .dudex-auth-responsive .google-icon {
        display: block;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

        @media (max-width: 700px) {
          .dudex-auth-responsive {
            padding: 16px 12px;
          }
          .dudex-auth-responsive .auth-card {
            max-width: 100%;
            padding: 22px 16px;
          }
          .dudex-auth-responsive .auth-form-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 15px;
          }
          .dudex-auth-responsive .auth-card h2 {
            font-size: 24px;
            line-height: 1.25;
          }
          .dudex-auth-responsive .dudex-select-options {
            max-height: min(175px, 25dvh);
          }
          .dudex-auth-responsive .dudex-select-option {
            font-size: 13px;
            padding: 11px;
          }
        }
        @media (max-width: 420px) {
          .dudex-auth-responsive {
            padding: 10px 8px;
          }
          .dudex-auth-responsive .auth-card {
            padding: 18px 12px;
          }
          .dudex-auth-responsive .dudex-select-trigger {
            font-size: 12px;
          }
        }
      `}</style>
      <div className="auth-card">
        {/* BRAND HEADER */}
        {mode !== 'landing' && (
          <>
            {(mode === 'verify' ||
              mode === 'login' ||
              mode === 'signup') && (
              <div style={{ marginBottom: 18 }}>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setMode('landing')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
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
                gap: 10,
                marginBottom: 20,
                cursor: 'pointer',
              }}
              onClick={() => setMode('landing')}
            >
              <div
                className="brand-mark"
                style={{
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  overflow: 'hidden',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src="/logo.png?v=20261031_0715" alt="DudeX Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <strong>DudeX Smart Academy</strong>
            </div>
          </>
        )}
        {/* LANDING PAGE */}
        {mode === 'landing' && (
          <div className="fade-in">
            <div
              className="brand-mark"
              style={{
                width: 54,
                height: 54,
                fontSize: 24,
                margin: '0 auto 20px',
                overflow: 'hidden',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src="/logo.png?v=20261031_0715" alt="DudeX Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div
              className="eyebrow"
              style={{ justifyContent: 'center' }}
            >
              DudeX Innovations · Education Division
            </div>
            <h1
              style={{
                fontSize: 'clamp(30px, 5vw, 48px)',
                lineHeight: 1.15,
                textAlign: 'center',
                margin: '18px 0',
              }}
            >
              DudeX Smart Academy
            </h1>
            <p
              className="page-copy"
              style={{
                textAlign: 'center',
                marginBottom: 28,
              }}
            >
              Learn. Grow. Achieve.
              <br />
              Your personal digital learning and placement-training workspace.
            </p>
            {authNotice && (
              <div
                className="dudex-alert"
                role="alert"
                style={{
                  maxWidth: 580,
                  margin: '0 auto 20px',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(180, 40, 40, 0.08)',
                  border: '1px solid rgba(180, 40, 40, 0.25)',
                  color: '#b3261e',
                  fontSize: 13,
                  lineHeight: 1.5,
                  textAlign: 'center',
                }}
              >
                {authNotice}
              </div>
            )}
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', marginBottom: 12 }}
              onClick={() => {
                setAuthNotice('')
                setMode('login')
              }}
            >
              Enter Student Portal <ArrowUpRight size={16} />
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ width: '100%' }}
              onClick={() => {
                setAuthNotice('')
                setMode('verify')
              }}
            >
              Register as Student
            </button>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 12,
                marginTop: 24,
              }}
            >
              <div className="content-card">
                <strong>Live Academy</strong>
                <p style={{ fontSize: 12 }}>
                  Real-time classes and faculty sessions.
                </p>
              </div>
              <div className="content-card">
                <strong>Daily Notes</strong>
                <p style={{ fontSize: 12 }}>
                  Learning resources and lecture notes.
                </p>
              </div>
              <div className="content-card">
                <strong>Assessments</strong>
                <p style={{ fontSize: 12 }}>
                  Practice assessments and coding challenges.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* COLLEGE EMAIL VERIFICATION */}
        {mode === 'verify' && (
          <div className="fade-in">
            <div className="eyebrow">Student Verification</div>
            <h2>Verify Your Student Account</h2>
            <p
              className="page-copy"
              style={{ marginBottom: 20 }}
            >
              Enter your college mail ID to continue to registration.
            </p>
            <form
              noValidate
              onSubmit={async (event) => {
                event.preventDefault()
                const enteredEmail = verificationEmail.trim()
                if (!enteredEmail) {
                  setVerificationError('Please enter your college mail ID.')
                  return
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enteredEmail)) {
                  setVerificationError('Please enter a valid email address.')
                  return
                }
                if (verifyLockoutUntil && Date.now() < verifyLockoutUntil) {
                  const remainingMins = Math.ceil((verifyLockoutUntil - Date.now()) / 60000)
                  setVerificationError(
                    `Too many failed attempts. Verification is locked. Please try again in ${remainingMins} minute(s).`
                  )
                  return
                }
                if (!verificationOtpSent) {
                  setVerificationLoading(true)
                  setVerificationError('')

                  const { error } = await supabase.auth.signInWithOtp({
                    email: enteredEmail,
                    options: { shouldCreateUser: true },
                  })
                  setVerificationLoading(false)
                  if (error) {
                    const message = error.message.toLowerCase()
                    setVerificationError(
                      message.includes('database error saving new user') || message.includes('email_not_registered')
                        ? 'This email is not on the college roster. Please contact your administrator.'
                        : error.message,
                    )
                    return
                  }
                  setVerificationOtp('')
                  setVerificationOtpSent(true)
                  setVerifyCooldown(60)
                  return
                }

                setVerificationLoading(true)
                const { error } = await supabase.auth.verifyOtp({
                  email: enteredEmail,
                  token: verificationOtp.trim(),
                  type: 'email',
                })
                setVerificationLoading(false)
                if (error) {
                  const nextAttempts = verifyAttempts + 1
                  setVerifyAttempts(nextAttempts)
                  if (nextAttempts >= 5) {
                    setVerifyLockoutUntil(Date.now() + 5 * 60 * 1000)
                    setVerificationError(
                      'Too many failed OTP attempts. Verification is locked for 5 minutes.'
                    )
                  } else {
                    setVerificationError(
                      `${error.message} (${5 - nextAttempts} attempt(s) remaining)`
                    )
                  }
                  return
                }
                setVerifyAttempts(0)
                setVerifyLockoutUntil(null)
                setVerifiedCollegeEmail(enteredEmail)
                setVerificationError('')
                setVerificationOtp('')
                setVerificationOtpSent(false)

                let eligibility
                try {
                  eligibility = await checkStudentEmailEligibility(enteredEmail)
                } catch (error) {
                  await supabase.auth.signOut()
                  setVerificationError(
                    error instanceof Error
                      ? error.message
                      : 'Could not verify your student roster status.'
                  )
                  setVerificationLoading(false)
                  return
                }
                if (!eligibility.eligible) {
                  await supabase.auth.signOut()
                  setVerificationError(
                    'This verified email is not on the active student roster. Please contact your administrator.'
                  )
                  setVerificationLoading(false)
                  return
                }

                if (eligibility.fullName) {
                  setFullName(eligibility.fullName)
                  setIsOfficialName(true)
                }
                if (eligibility.collegeName) {
                  setCollegeName(eligibility.collegeName)
                }
                if (eligibility.studentId) {
                  setRegisterNumber(eligibility.studentId)
                }
                if (eligibility.department) {
                  setSpecialization(eligibility.department)
                }
                // Batch assigned by the admin is applied automatically and locked.
                if (eligibility.batchName) {
                  setBatchName(eligibility.batchName)
                  setBatchLocked(true)
                }

                try {
                  const {
                    data: { user },
                  } = await supabase.auth.getUser()
                  if (user) {
                    const { data: prof } = await supabase
                      .from('profiles')
                      .select('full_name, phone')
                      .eq('id', user.id)
                      .maybeSingle()
                    // Keep the admin-managed roster name; the profile name is
                    // only the email prefix until registration completes.
                    if (prof?.full_name && !eligibility.fullName) {
                      setFullName(prof.full_name)
                      setIsOfficialName(true)
                    }
                    if (prof?.phone) setPhoneNumber(prof.phone)

                    const { data: sp } = await supabase
                      .from('student_profiles')
                      .select('*')
                      .eq('user_id', user.id)
                      .maybeSingle()
                    if (sp) {
                      if (sp.roll_number || sp.admission_number) {
                        setRegisterNumber(sp.roll_number || sp.admission_number)
                      }
                      if (sp.college || sp.college_name) {
                        setCollegeName(sp.college || sp.college_name)
                      }
                      if (sp.degree) {
                        setDegree(sp.degree)
                      }
                      if (sp.specialization || sp.department) {
                        setSpecialization(sp.specialization || sp.department)
                      }
                    }
                  }
                } catch (error) {
                  console.error('Could not load the verified student profile:', error)
                }

                setVerificationLoading(false)
                setRegistrationError('')
                setMode('signup')
              }}
            >
              <div className="form-group">
                <label htmlFor="verificationEmail">College Mail ID</label>
                <input
                  id="verificationEmail"
                  type="email"
                  value={verificationEmail}
                  disabled={verificationOtpSent}
                  onChange={(event) => {
                    setVerificationEmail(event.target.value)
                    setVerificationError('')
                  }}
                  placeholder="you@college.edu"
                  autoComplete="email"
                  required
                />
              </div>
              {verificationOtpSent && (
                <div className="form-group" style={{ marginTop: 14 }}>
                  <label htmlFor="verificationOtp">Enter OTP</label>
                  <input
                    id="verificationOtp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationOtp}
                    onChange={(event) => {
                      setVerificationOtp(
                        event.target.value.replace(/\D/g, '').slice(0, 6)
                      )
                      setVerificationError('')
                    }}
                    placeholder="Enter 6-digit OTP"
                    required
                  />
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginTop: 8,
                    }}
                  >
                    Check your college email for the 6-digit OTP (valid for 10 minutes).
                  </p>
                </div>
              )}
              {verificationError && (
                <div className="dudex-alert" role="alert">
                  {verificationError}
                </div>
              )}
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: 16 }}
                disabled={verificationLoading}
              >
                {verificationLoading
                  ? 'Please wait…'
                  : verificationOtpSent
                  ? 'Verify OTP & Continue'
                  : 'Send OTP'}{' '}
                <ArrowUpRight size={16} />
              </button>
              {verificationOtpSent && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginTop: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    className="btn-outline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      padding: '8px 12px',
                    }}
                    disabled={verifyCooldown > 0 || verificationLoading}
                    onClick={async () => {
                      if (verifyCooldown > 0) return
                      setVerificationLoading(true)
                      setVerificationError('')
                      const { error } = await supabase.auth.signInWithOtp({
                        email: verificationEmail.trim(),
                        options: { shouldCreateUser: true },
                      })
                      setVerificationLoading(false)
                      if (error) {
                        const message = error.message.toLowerCase()
                        setVerificationError(
                          message.includes('database error saving new user') || message.includes('email_not_registered')
                            ? 'This email is not on the college roster. Please contact your administrator.'
                            : error.message,
                        )
                        return
                      }
                      setVerifyCooldown(60)
                    }}
                  >
                    <RotateCw size={13} />
                    {verifyCooldown > 0 ? `Resend in ${verifyCooldown}s` : 'Resend OTP'}
                  </button>
                  <button
                    type="button"
                    className="btn-link"
                    style={{ fontSize: 12 }}
                    onClick={() => {
                      setVerificationOtp('')
                      setVerificationError('')
                      setVerificationOtpSent(false)
                    }}
                  >
                    Change College Mail ID
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
        {/* LOGIN */}
        {mode === 'login' && (
          <div className="fade-in">
            <div className="eyebrow">Student Authentication</div>
            <h2>Enter Student Portal</h2>
            <p className="page-copy" style={{ marginBottom: 20 }}>
              Sign in with your registered college mail ID and password.
            </p>
            {authNotice && (
              <div
                className="dudex-alert"
                role="alert"
                style={{
                  marginBottom: 16,
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'rgba(180, 40, 40, 0.08)',
                  border: '1px solid rgba(180, 40, 40, 0.25)',
                  color: '#b3261e',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {authNotice}
              </div>
            )}
            <form
              noValidate
              onSubmit={async (event) => {
                event.preventDefault()
                setLoginError('')
                setAuthNotice('')
                if (!loginEmail.trim()) {
                  setLoginError('Please enter your college mail ID.')
                  return
                }
                if (!loginPassword) {
                  setLoginError('Please enter your password.')
                  return
                }
                setLoginLoading(true)
                try {
                  const { data, error } = await supabase.auth.signInWithPassword({
                    email: loginEmail.trim(),
                    password: loginPassword,
                  })
                  setLoginLoading(false)
                  if (error) {
                    if (
                      error.message.toLowerCase().includes('invalid login credentials') ||
                      error.message.toLowerCase().includes('user not found')
                    ) {
                      setLoginError(
                        'Invalid email or password. Please verify your credentials or register as a student.'
                      )
                    } else {
                      setLoginError(error.message)
                    }
                    return
                  }
                  if (data?.session) {
                    onLogin()
                  }
                } catch (err: any) {
                  setLoginLoading(false)
                  setLoginError(
                    err?.message || 'Failed to sign in. Please try again.'
                  )
                }
              }}
            >
              <div className="form-group">
                <label htmlFor="loginEmail">College Mail ID</label>
                <input
                  id="loginEmail"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => {
                    setLoginEmail(event.target.value)
                    setLoginError('')
                    setAuthNotice('')
                  }}
                  placeholder="you@college.edu"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <label htmlFor="loginPassword" style={{ margin: 0 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    className="btn-link"
                    style={{ fontSize: 12 }}
                    onClick={() => {
                      setResetEmail(loginEmail)
                      setResetSent(false)
                      setMode('forgot')
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="loginPassword"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(event) => {
                      setLoginPassword(event.target.value)
                      setLoginError('')
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ paddingRight: 40 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted, #777)',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    aria-label={
                      showLoginPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showLoginPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="dudex-alert" role="alert">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: 18 }}
                disabled={loginLoading}
              >
                {loginLoading ? 'Signing In…' : 'Sign In to Student Portal'}{' '}
                <ArrowUpRight size={16} />
              </button>
            </form>

            <button
              type="button"
              className="btn-outline google-signin-btn"
              style={{ width: '100%', marginTop: 14 }}
              onClick={async () => {
                setAuthNotice('')
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: window.location.origin },
                })
              }}
            >
              <svg
                className="google-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                />
                <path
                  fill="#34A853"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.64 5.93c4.46-4.13 7.14-10.2 7.14-17.58Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
                />
                <path
                  fill="#EA4335"
                  d="M24 48c6.48 0 11.93-2.13 15.9-5.78l-7.64-5.93c-2.13 1.43-4.87 2.28-8.26 2.28-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                marginTop: 20,
                fontSize: 13,
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>
                Don't have an account?
              </span>
              <button
                type="button"
                className="btn-link"
                style={{ fontWeight: 600 }}
                onClick={() => {
                  setAuthNotice('')
                  setMode('verify')
                }}
              >
                Register as Student
              </button>
            </div>
          </div>
        )}
        {/* REGISTRATION FORM */}
        {mode === 'signup' && (
          <div className="fade-in">
            {!verifiedCollegeEmail ? (
              <>
                <div className="eyebrow">Verification Required</div>
                <h2>Verify Your College Email</h2>
                <p className="page-copy">
                  Complete college email verification before registration.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: 16 }}
                  onClick={() => setMode('verify')}
                >
                  Go to Verification <ArrowUpRight size={16} />
                </button>
              </>
            ) : (
              <>
                <div className="eyebrow">Registration</div>
                <h2>Create Student Account</h2>
                <p
                  className="page-copy"
                  style={{ marginBottom: 20 }}
                >
                  Enter your academic and contact details to create
                  your student account.
                </p>
                <div className="dudex-success">
                  <strong>Student verified.</strong> Your college mail ID
                  has been verified and is locked to this registration.
                </div>
                <form
                  noValidate
                  onSubmit={async (event) => {
                    event.preventDefault()
                    setRegistrationError('')
                    if (!fullName.trim()) {
                      setRegistrationError(
                        'Please enter your full name.',
                      )
                      return
                    }
                    if (!collegeName) {
                      setRegistrationError(
                        'Please select your college.',
                      )
                      return
                    }
                    if (collegeName === 'Other') {
                      setRegistrationError(
                        'Please enter a valid college name.',
                      )
                      return
                    }
                    if (!registerNumber.trim()) {
                      setRegistrationError(
                        'Please enter your college register number.',
                      )
                      return
                    }
                    if (!phoneNumber.trim()) {
                      setRegistrationError(
                        'Please enter your phone number.',
                      )
                      return
                    }
                    if (!degree) {
                      setRegistrationError('Please select your degree.')
                      return
                    }
                    if (!specialization) {
                      setRegistrationError('Please select your specialization.')
                      return
                    }
                    const calibratedBatch = (batchName && batchName.trim()) || availableBatches[0] || 'Default Batch'
                    if (!section.trim() || !academicYear.trim()) {
                      setRegistrationError('Please enter your section and academic year.')
                      return
                    }
                    const academicValidation = validateAcademicSelection(
                      collegeName,
                      degree,
                      specialization
                    )
                    if (!academicValidation.valid) {
                      setRegistrationError(
                        academicValidation.reason || 'Please verify your academic selection.'
                      )
                      return
                    }
                    if (!newPassword || newPassword.length < 6) {
                      setRegistrationError('Password must be at least 6 characters long.')
                      return
                    }
                    if (newPassword !== confirmPassword) {
                      setRegistrationError('Passwords do not match. Please verify your password.')
                      return
                    }

                    setRegistrationLoading(true)
                    try {
                      const { error: pwdErr } = await supabase.auth.updateUser({
                        password: newPassword,
                      })
                      // A retry after a failed save re-sends the password that
                      // is already set; that is fine, carry on to the save.
                      if (pwdErr && pwdErr.code !== 'same_password') {
                        throw new Error(`Could not set your password: ${pwdErr.message}`)
                      }

                      const details: RegistrationDetails = {
                        full_name: fullName.trim(),
                        college_name: collegeName,
                        college_email: verifiedCollegeEmail,
                        register_number: registerNumber.trim(),
                        phone_number: phoneNumber.trim(),
                        course: degree,
                        specialization,
                        batch_name: calibratedBatch,
                        section: section.trim(),
                        academic_year: academicYear.trim(),
                      }
                      await onRegistrationSave(details)
                      setMode('status')
                    } catch (error) {
                      setRegistrationError(
                        error instanceof Error
                          ? error.message
                          : 'Registration could not be saved. Please try again.'
                      )
                    } finally {
                      setRegistrationLoading(false)
                    }
                  }}
                >
                  <div className="auth-form-grid">
                    {/* FULL NAME */}
                    <div className="form-group">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}
                      >
                        <label
                          htmlFor="registrationFullName"
                          style={{ margin: 0, fontWeight: 500 }}
                        >
                          Full Name
                        </label>
                        {isOfficialName && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              color: 'var(--gold-dark, #9C7449)',
                              fontWeight: 600,
                            }}
                          >
                            <Lock size={12} /> Managed by Admin
                          </span>
                        )}
                      </div>
                      <input
                        id="registrationFullName"
                        name="fullName"
                        value={fullName}
                        disabled={isOfficialName}
                        readOnly={isOfficialName}
                        onChange={(event) =>
                          setFullName(event.target.value)
                        }
                        placeholder="Enter your full name"
                        autoComplete="name"
                        style={
                          isOfficialName
                            ? {
                                background: 'var(--cream-primary, #FAF7F2)',
                                borderColor: '#E5D8CC',
                                cursor: 'not-allowed',
                                color: 'var(--text-primary, #252525)',
                                fontWeight: 500,
                              }
                            : undefined
                        }
                        required
                      />
                      {isOfficialName && (
                        <small className="dudex-readonly-note">
                          Official student name is managed by the administration.
                        </small>
                      )}
                    </div>
                    {/* COLLEGE NAME */}
                    <SearchableDropdown
                      id="registrationCollege"
                      label="College Name"
                      placeholder="Search your college..."
                      options={collegesList}
                      value={collegeName}
                      onChange={handleCollegeChange}
                      required
                    />
                    {/* COLLEGE EMAIL (LOCKED) */}
                    <div className="form-group">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}
                      >
                        <label
                          htmlFor="registrationEmail"
                          style={{ margin: 0, fontWeight: 500 }}
                        >
                          College Mail ID
                        </label>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            color: 'var(--gold-dark, #9C7449)',
                            fontWeight: 600,
                          }}
                        >
                          <Lock size={12} /> Verified &amp; Locked
                        </span>
                      </div>
                      <input
                        id="registrationEmail"
                        type="email"
                        value={verifiedCollegeEmail}
                        readOnly
                        tabIndex={-1}
                        style={{
                          backgroundColor: 'var(--cream-secondary, #F3ECE3)',
                          cursor: 'not-allowed',
                          color: 'var(--text-secondary, #625D57)',
                          borderColor: 'var(--border-color, #E7DED3)',
                          fontWeight: 500,
                        }}
                        autoComplete="email"
                        required
                      />
                      <small
                        style={{
                          display: 'block',
                          marginTop: 5,
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}
                      >
                        Verified email is locked to this registration and cannot be changed.
                      </small>
                    </div>
                    {/* REGISTER NUMBER */}
                    <div className="form-group">
                      <label htmlFor="registrationNumber">
                        College Register Number
                      </label>
                      <input
                        id="registrationNumber"
                        value={registerNumber}
                        onChange={(event) =>
                          setRegisterNumber(event.target.value)
                        }
                        placeholder="Enter register number"
                        required
                      />
                    </div>
                    {/* PHONE NUMBER */}
                    <div className="form-group">
                      <label htmlFor="registrationPhone">
                        Phone Number
                      </label>
                      <input
                        id="registrationPhone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(event) =>
                          setPhoneNumber(event.target.value)
                        }
                        placeholder="Enter phone number"
                        autoComplete="tel"
                        required
                      />
                    </div>
                    {/* DEGREE */}
                    <SearchableDropdown
                      id="registrationDegree"
                      label="Degree"
                      placeholder={collegeName ? "Select a degree" : "Select college first"}
                      options={availableDegrees}
                      value={degree}
                      onChange={handleDegreeChange}
                      disabled={!collegeName}
                      required
                    />
                    {/* SPECIALIZATION */}
                    <SearchableDropdown
                      id="registrationSpecialization"
                      label="Specialization"
                      placeholder={degree ? "Select specialization" : "Select degree first"}
                      options={availableSpecializations}
                      value={specialization}
                      onChange={(value) => {
                        setSpecialization(value)
                        setRegistrationError('')
                      }}
                      disabled={!degree}
                      required
                    />
                    <input type="hidden" id="registrationBatch" value={batchName || (availableBatches[0] || 'Default Batch')} />
                    <div className="form-group">
                      <label htmlFor="registrationSection">Section</label>
                      <input
                        id="registrationSection"
                        value={section}
                        onChange={(event) => setSection(event.target.value)}
                        placeholder="Enter section"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="registrationAcademicYear">Academic Year</label>
                      <input
                        id="registrationAcademicYear"
                        value={academicYear}
                        onChange={(event) => setAcademicYear(event.target.value)}
                        placeholder="e.g. 2025-2026"
                        required
                      />
                    </div>

                    {/* CREATE PASSWORD */}
                    <div className="form-group">
                      <label htmlFor="registrationPassword">
                        Create Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="registrationPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value)
                            setRegistrationError('')
                          }}
                          placeholder="Create password (min 6 chars)"
                          autoComplete="new-password"
                          style={{ paddingRight: 40 }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted, #777)',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <small style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                        Minimum 6 characters. Used to sign in to your student portal.
                      </small>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="form-group">
                      <label htmlFor="registrationConfirmPassword">
                        Confirm Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="registrationConfirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setRegistrationError('')
                          }}
                          placeholder="Re-enter password"
                          autoComplete="new-password"
                          style={{ paddingRight: 40 }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted, #777)',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {registrationError && (
                    <div className="dudex-alert" role="alert">
                      {registrationError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      width: '100%',
                      marginTop: 18,
                    }}
                  >
                    Create Student Account{' '}
                    <ArrowUpRight size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
        {/* REGISTRATION STATUS */}
        {mode === 'status' && (
          <div
            className="fade-in"
            style={{ textAlign: 'center' }}
          >
            <div
              className="brand-mark"
              style={{
                width: 48,
                height: 48,
                fontSize: 22,
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
              Your registration details have been saved. Continue to
              access the student portal.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={onLogin}
            >
              Enter Student Dashboard <ArrowUpRight size={16} />
            </button>
          </div>
        )}
        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <div className="fade-in">
            <div className="eyebrow">Password Reset</div>
            <h2>Reset Your Access</h2>
            <p
              className="page-copy"
              style={{ marginBottom: 20 }}
            >
              Enter your college mail ID to continue.
            </p>
            <form
              onSubmit={async (event) => {
                event.preventDefault()
                if (!resetEmail.trim()) return
                setResetLoading(true)
                const { error } = await supabase.auth.resetPasswordForEmail(
                  resetEmail.trim(),
                  { redirectTo: `${window.location.origin}/reset-password` },
                )
                setResetLoading(false)
                if (error) {
                  window.alert(error.message)
                  return
                }
                setResetSent(true)
              }}
            >
              <div className="form-group">
                <label htmlFor="resetEmail">
                  College Mail ID
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(event) =>
                    setResetEmail(event.target.value)
                  }
                  placeholder="you@college.edu"
                  autoComplete="email"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: 16 }}
                disabled={resetLoading || resetSent}
              >
                {resetLoading ? 'Sending…' : resetSent ? 'Reset Link Sent ✔' : 'Send Reset Link'}
              </button>
              {resetSent && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                  Check your email for the password reset link.
                </p>
              )}
            </form>
            <button
              type="button"
              className="btn-link"
              style={{ marginTop: 16 }}
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
