import { useEffect, useState, useRef, type ChangeEvent } from 'react'
import {
  ExternalLink,
  ChevronLeft,
  Lock,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  ShieldCheck,
} from 'lucide-react'
import type { View } from '../../types'
import { studentService } from '../../services'
import type { ExternalSubmission } from '../../services/studentService'

interface HackerRankSubmission {
  score: number
  screenshotName: string
  screenshotUrl: string
  submittedAt: string
  status: ExternalSubmission['status']
  verifiedScore: number | null
  reviewNote: string
}

const toView = (s: ExternalSubmission): HackerRankSubmission => ({
  score: s.verified_score ?? s.reported_score,
  screenshotName: s.screenshot_path.split('/').pop() || 'screenshot',
  screenshotUrl: s.screenshot_url || '',
  submittedAt: new Date(s.submitted_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
  status: s.status,
  verifiedScore: s.verified_score,
  reviewNote: s.review_note || '',
})

export function HackerRankAssessmentView({
  goTo,
  assessmentId,
}: {
  goTo: (v: View) => void
  assessmentId: string
}) {
  // Link and schedule come from the HackerRank assessment the teacher published.
  const assessment = studentService.getAssessmentById(assessmentId)
  const startAt = assessment?.start_date ? new Date(assessment.start_date) : null
  const validStart = startAt && !Number.isNaN(startAt.getTime()) ? startAt : null
  const fmtTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const HACKERRANK_CODING_ASSESSMENT_URL = assessment?.external_url || ''
  const HACKERRANK_START_DATE = validStart
    ? validStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not scheduled'
  const HACKERRANK_START_TIME = validStart ? fmtTime(validStart) : '—'
  const HACKERRANK_UNLOCK_TIME = validStart ? fmtTime(new Date(validStart.getTime() - 10 * 60 * 1000)) : '—'

  // Test access: button is not clickable until 10 mins before start time
  const isWithin10Mins = Boolean(
    validStart && HACKERRANK_CODING_ASSESSMENT_URL && Date.now() >= validStart.getTime() - 10 * 60 * 1000
  )

  // Result submission state
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [markInput, setMarkInput] = useState<string>('')
  const [inputError, setInputError] = useState<string>('')
  const [submission, setSubmission] = useState<HackerRankSubmission | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Show the existing (single, locked) submission if the student already submitted.
  useEffect(() => {
    if (!assessmentId) return
    studentService
      .getExternalSubmission(assessmentId)
      .then((existing) => {
        if (existing) setSubmission(toView(existing))
      })
      .catch((err: unknown) => console.error(err))
  }, [assessmentId])

  // Handle Screenshot file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setInputError('Please upload an image file (PNG, JPG, JPEG, WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setInputError('File size must be under 5MB.')
      return
    }

    setInputError('')
    setScreenshotFile(file)
    const previewUrl = URL.createObjectURL(file)
    setScreenshotPreview(previewUrl)
  }

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null)
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview)
    }
    setScreenshotPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle Numeric Score input - strictly allow numbers only
  const handleScoreChange = (val: string) => {
    // Strip any non-digit characters
    const cleanNum = val.replace(/\D/g, '')

    if (cleanNum === '') {
      setMarkInput('')
      setInputError('')
      return
    }

    const num = parseInt(cleanNum, 10)
    if (num > 100) {
      setInputError('Score cannot exceed 100 marks.')
      setMarkInput('100')
    } else {
      setInputError('')
      setMarkInput(cleanNum)
    }
  }

  // Handle Final Submission (Single submission only, locked permanently)
  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!screenshotFile && !screenshotPreview) {
      setInputError('Please upload a screenshot of your HackerRank result.')
      return
    }

    if (!screenshotFile) {
      setInputError('Please upload a screenshot of your HackerRank result.')
      return
    }

    if (markInput === '') {
      setInputError('Please enter the marks obtained on HackerRank.')
      return
    }

    const numericScore = parseInt(markInput, 10)
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      setInputError('Please enter a valid numeric mark between 0 and 100.')
      return
    }

    setSubmitting(true)
    try {
      const saved = await studentService.submitExternalResult(assessmentId, numericScore, screenshotFile)
      setSubmission(toView(saved))
    } catch (err) {
      setInputError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page fade-in">
      <style>{`
        .hr-layout-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .hr-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 22px;
        }

        .hr-spec-card {
          border: 1px solid var(--cream-secondary, #EFECE6);
          border-radius: 10px;
          padding: 14px;
          background: #FAF8F5;
        }

        .hr-spec-card span {
          display: block;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 5px;
        }

        .hr-spec-card strong {
          font-size: 15px;
          color: var(--text-primary);
        }

        .hr-instructions-box {
          background: #FDF9F2;
          border: 1px solid #EADBCC;
          border-radius: 12px;
          padding: 20px 22px;
          margin-bottom: 24px;
        }

        .hr-instructions-box h4 {
          margin: 0 0 12px;
          font-size: 15px;
          font-weight: 700;
          color: var(--brand-black, #1B1C1E);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hr-instructions-list {
          margin: 0;
          padding-left: 20px;
          color: var(--text-secondary);
          line-height: 1.85;
          font-size: 13.5px;
        }

        .hr-instructions-list li {
          margin-bottom: 6px;
        }

        .hr-important-callout {
          margin-top: 14px;
          padding: 12px 16px;
          background: #FFF5F5;
          border: 1px solid #FECDCD;
          border-radius: 8px;
          font-size: 13px;
          color: #991B1B;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .hr-submission-card {
          background: var(--surface-white);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg, 16px);
          padding: 26px;
          box-sizing: border-box;
          margin-top: 8px;
        }

        .hr-upload-dropzone {
          border: 2px dashed #D6CFBE;
          border-radius: 12px;
          padding: 28px 20px;
          text-align: center;
          background: #FAF8F4;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .hr-upload-dropzone:hover {
          border-color: var(--brand-gold, #B18B5E);
          background: #F5EFE6;
        }

        .hr-preview-container {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 14px 18px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .hr-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(6px);
          display: grid;
          place-items: center;
          z-index: 99999;
          padding: 20px;
        }

        .hr-modal-content {
          max-width: 90vw;
          max-height: 90vh;
          position: relative;
        }

        .hr-modal-content img {
          max-width: 100%;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 10px;
        }
      `}</style>

      {/* Back to Assessments */}
      <button
        className="btn-link"
        onClick={() => goTo('assessments')}
        style={{ marginBottom: '18px' }}
      >
        <ChevronLeft size={16} />
        Back to Assessments
      </button>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '22px' }}>
        <div>
          <div className="eyebrow">
            External Coding Assessment · HackerRank
          </div>

          <h1 style={{ margin: '8px 0' }}>HackerRank Coding Challenge</h1>

          <p className="page-copy" style={{ color: 'var(--text-secondary)' }}>
            Read all instructions carefully before starting the coding test.
          </p>
        </div>
      </div>

      <div className="hr-layout-grid">
        {/* Top Instructions Card */}
        <div className="content-card">
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
            Coding Instructions &amp; Parameters
          </h3>

          {/* Assessment Parameter Tiles */}
          <div className="hr-specs-grid">
            <div className="hr-spec-card">
              <span>TEST DURATION</span>
              <strong>45 Minutes</strong>
            </div>

            <div className="hr-spec-card">
              <span>TOTAL MARKS</span>
              <strong>100 Marks</strong>
            </div>

            <div className="hr-spec-card">
              <span>ATTEMPT LIMIT</span>
              <strong>1 Attempt Only</strong>
            </div>

            <div className="hr-spec-card">
              <span>START DATE</span>
              <strong>{HACKERRANK_START_DATE}</strong>
            </div>

            <div className="hr-spec-card">
              <span>START TIME</span>
              <strong>{HACKERRANK_START_TIME}</strong>
            </div>

            <div className="hr-spec-card" style={{ background: '#FFF8EE', borderColor: '#EBD5BA' }}>
              <span style={{ color: 'var(--brand-gold, #B18B5E)' }}>ACCESS OPENS</span>
              <strong style={{ color: 'var(--brand-gold, #B18B5E)' }}>{HACKERRANK_UNLOCK_TIME}</strong>
            </div>
          </div>

          {/* Important Instructions Box */}
          <div className="hr-instructions-box">
            <h4>
              <ShieldCheck size={18} color="var(--brand-gold, #B18B5E)" />
              Important Instructions Before &amp; After Test
            </h4>

            <ul className="hr-instructions-list">
              <li>
                <strong>Access Window:</strong> The <strong>"Start Test"</strong> button is strictly locked and will become clickable only <strong>10 minutes before</strong> the scheduled assessment start time ({HACKERRANK_UNLOCK_TIME} on {HACKERRANK_START_DATE}).
              </li>
              <li>
                Read every coding problem carefully before writing your solution in the HackerRank editor.
              </li>
              <li>
                Make sure your code compiles and handles all required test cases and boundary conditions before submitting on HackerRank.
              </li>
              <li>
                <strong>Result Screenshot:</strong> After completing the HackerRank assessment, immediately <strong>take a clear screenshot</strong> of the final scorecard showing your name, marks, and test completion summary.
              </li>
              <li>
                <strong>Manual Mark Entry:</strong> Upload the result screenshot and enter your obtained score in the submission box below.
              </li>
            </ul>

            <div className="hr-important-callout">
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>⚠️ Strict Single Submission Policy:</strong> Once you click <strong>"Submit Assessment Result"</strong>, your score and screenshot are permanently locked and cannot be resubmitted or edited.
              </div>
            </div>
          </div>

          {/* Start Test Action Row (Renamed to Start Test, disabled until 10 mins before start) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              paddingTop: '6px',
              borderTop: '1px solid var(--cream-secondary, #EFECE6)',
            }}
          >
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>
                {isWithin10Mins ? '✅ Assessment is Active' : '🔒 Assessment Locked'}
              </strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {isWithin10Mins
                  ? 'Click "Start Test" to launch the external HackerRank testing environment.'
                  : `The "Start Test" button will unlock 10 minutes prior to scheduled start time (${HACKERRANK_UNLOCK_TIME}).`}
              </span>
            </div>

            {/* Start Test Button */}
            {isWithin10Mins ? (
              <a
                href={HACKERRANK_CODING_ASSESSMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
                style={{
                  minWidth: '220px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                Start Test
                <ExternalLink size={16} />
              </a>
            ) : (
              <button
                disabled
                className="btn-outline"
                style={{
                  minWidth: '220px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'not-allowed',
                  opacity: 0.65,
                  background: '#E9E5DE',
                  color: '#888888',
                  borderColor: '#D6D0C5',
                }}
                title={`Locked until ${HACKERRANK_UNLOCK_TIME}`}
              >
                <Lock size={16} />
                Start Test
              </button>
            )}
          </div>
        </div>

        {/* Bottom Submission Card: Upload Screenshot & Enter Marks */}
        <div className="hr-submission-card">
          <div style={{ marginBottom: '20px' }}>
            <div className="eyebrow" style={{ color: 'var(--brand-gold, #B18B5E)' }}>
              Step 2 · Scorecard Submission
            </div>
            <h3 style={{ margin: '4px 0 6px', fontSize: '19px', fontWeight: 700 }}>
              Submit Assessment Result &amp; Marks
            </h3>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              Upload your HackerRank completion screenshot and enter your score to register your placement marks.
            </p>
          </div>

          {/* If already submitted, show locked verified scorecard */}
          {submission ? (
            <div
              style={{
                background: '#F9FAF7',
                border: '1px solid #D4E2CD',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <CheckCircle2 size={24} color="#16A34A" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '17px', color: '#15803D' }}>
                    Assessment Result Successfully Submitted
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Submitted on {submission.submittedAt} · {submission.status === 'Pending' ? 'Awaiting teacher verification' : submission.status === 'Verified' ? 'Verified by teacher' : 'Rejected by teacher'}{submission.reviewNote ? ` · ${submission.reviewNote}` : ''}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    REGISTERED SCORE
                  </span>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--brand-black, #1B1C1E)' }}>
                    {submission.score} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      background: submission.score >= 70 ? '#DCFCE7' : '#FEF3C7',
                      color: submission.score >= 70 ? '#166534' : '#92400E',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '20px',
                    }}
                  >
                    {submission.score >= 90 ? 'Grade A+ · Outstanding' : submission.score >= 75 ? 'Grade A · Qualified' : 'Completed'}
                  </span>
                </div>

                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      VERIFICATION SCREENSHOT
                    </span>
                    <strong style={{ fontSize: '13px', display: 'block', wordBreak: 'break-all' }}>
                      {submission.screenshotName}
                    </strong>
                  </div>
                  {(submission.screenshotUrl || screenshotPreview) && (
                    <div
                      onClick={() => setPreviewModalOpen(true)}
                      style={{
                        marginTop: '10px',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid #CBD5E1',
                        maxHeight: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#00000008',
                      }}
                      title="Click to view full screenshot"
                    >
                      <img
                        src={submission.screenshotUrl || screenshotPreview || ''}
                        alt="Screenshot thumbnail"
                        style={{ width: '100%', maxHeight: '120px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setPreviewModalOpen(true)}
                    style={{ marginTop: '12px', fontSize: '12px', padding: '8px 12px', justifyContent: 'center' }}
                  >
                    <Eye size={14} /> View Uploaded Screenshot
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid #E2E8F0',
                }}
              >
                <Lock size={14} color="#64748B" />
                <span>
                  This assessment submission is finalized in the DudeX Smart Academy student records. Resubmission is disabled.
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitResult}>
              {/* 1. Upload Screenshot of Result */}
              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  1. Upload Screenshot of Result <span style={{ color: '#DC2626' }}>*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="hr-screenshot-upload"
                />

                {screenshotPreview ? (
                  <div className="hr-preview-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#111',
                          flexShrink: 0,
                          cursor: 'pointer',
                        }}
                        onClick={() => setPreviewModalOpen(true)}
                      >
                        <img
                          src={screenshotPreview}
                          alt="Result Screenshot Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            fontSize: '13.5px',
                            display: 'block',
                            wordBreak: 'break-all',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {screenshotFile?.name || 'result_screenshot.png'}
                        </strong>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {screenshotFile ? `${(screenshotFile.size / (1024 * 1024)).toFixed(2)} MB · Click to enlarge` : 'Screenshot attached'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => setPreviewModalOpen(true)}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626', borderColor: '#FCA5A5' }}
                        onClick={handleRemoveScreenshot}
                      >
                        <X size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="hr-upload-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    <UploadCloud size={36} color="var(--brand-gold, #B18B5E)" style={{ margin: '0 auto 8px' }} />
                    <strong style={{ display: 'block', fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Click to upload or drag &amp; drop result screenshot
                    </strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Supports PNG, JPG, WebP (Max 5MB)
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Enter Your Mark (Fix: Numbers Only) */}
              <div style={{ marginBottom: '22px' }}>
                <label
                  htmlFor="hr-mark-input"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  2. Enter Your Mark Obtained (0 - 100) <span style={{ color: '#DC2626' }}>*</span>
                </label>

                <div style={{ position: 'relative', maxWidth: '320px' }}>
                  <input
                    id="hr-mark-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 95"
                    value={markInput}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    onKeyDown={(e) => {
                      // Allow backspace, delete, tab, arrows
                      if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
                      // Prevent non-digit characters (e, E, +, -, .)
                      if (!/^\d$/.test(e.key)) {
                        e.preventDefault()
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 50px 12px 14px',
                      fontSize: '16px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: '#FFF',
                      boxSizing: 'border-box',
                      color: 'var(--brand-black, #1B1C1E)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}
                  >
                    / 100
                  </span>
                </div>
                <span style={{ display: 'block', marginTop: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Enter only numeric whole numbers matching the score displayed on your HackerRank result screen.
                </span>
              </div>

              {/* Validation Error Message */}
              {inputError && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    color: '#B91C1C',
                    fontSize: '13px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{inputError}</span>
                </div>
              )}

              {/* Submit Assessment Button */}
              <div style={{ paddingTop: '8px', borderTop: '1px solid var(--cream-secondary, #EFECE6)' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !screenshotPreview || markInput === ''}
                  style={{
                    padding: '12px 32px',
                    fontSize: '15px',
                    fontWeight: 700,
                    minWidth: '240px',
                    cursor: (!screenshotPreview || markInput === '') ? 'not-allowed' : 'pointer',
                    opacity: (!screenshotPreview || markInput === '') ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'Submitting Result...' : 'Submit Assessment Result'}
                </button>
                <span
                  style={{
                    display: 'block',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  ⚠️ Note: Once submitted, you cannot resubmit or alter this score.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Full Screenshot Modal Lightbox */}
      {previewModalOpen && (submission?.screenshotUrl || screenshotPreview) && (
        <div className="hr-modal-overlay" onClick={() => setPreviewModalOpen(false)}>
          <div className="hr-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewModalOpen(false)}
              style={{
                position: 'absolute',
                top: '-36px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
              }}
            >
              <X size={20} /> Close Preview
            </button>
            <img src={submission?.screenshotUrl || screenshotPreview || ''} alt="HackerRank Result Verification" />
          </div>
        </div>
      )}
    </div>
  )
}

export const HackerRankAssessmentPage = HackerRankAssessmentView
export default HackerRankAssessmentPage