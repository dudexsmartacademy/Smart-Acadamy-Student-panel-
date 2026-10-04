import { ExternalLink, ChevronLeft } from 'lucide-react'
import type { View } from '../../types'

const HACKERRANK_CODING_ASSESSMENT_URL =
  'https://www.hackerrank.com/dudexai-coding-challenge-2'

const HACKERRANK_START_DATE = '10 Sep 2026'
const HACKERRANK_START_TIME = '09:00 AM'

export function HackerRankAssessmentView({
  goTo,
}: {
  goTo: (v: View) => void
}) {
  return (
    <div className="page fade-in">

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
      <div className="page-header">
        <div>
          <div className="eyebrow">
            External Coding Assessment · HackerRank
          </div>

          <h1>HackerRank Coding Challenge</h1>

          <p className="page-copy">
            Read all instructions carefully before starting the coding test.
          </p>
        </div>
      </div>

      {/* Assessment Content */}
      <div className="note-viewer-layout">
        <div className="content-card">

          {/* Heading */}
          <h3
            style={{
              marginBottom: '16px',
            }}
          >
            Coding Instructions
          </h3>

          {/* Assessment Information */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '22px',
            }}
          >

            {/* Test Duration */}
            <div
              style={{
                border: '1px solid var(--cream-secondary)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  marginBottom: '5px',
                }}
              >
                TEST DURATION
              </span>

              <strong>45 Minutes</strong>
            </div>

            {/* Total Marks */}
            <div
              style={{
                border: '1px solid var(--cream-secondary)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  marginBottom: '5px',
                }}
              >
                TOTAL MARKS
              </span>

              <strong>100 Marks</strong>
            </div>

            {/* Attempt Limit */}
            <div
              style={{
                border: '1px solid var(--cream-secondary)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  marginBottom: '5px',
                }}
              >
                ATTEMPT LIMIT
              </span>

              <strong>1 Attempt Only</strong>
            </div>

            {/* Start Date */}
            <div
              style={{
                border: '1px solid var(--cream-secondary)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  marginBottom: '5px',
                }}
              >
                START DATE
              </span>

              <strong>{HACKERRANK_START_DATE}</strong>
            </div>

            {/* Start Time */}
            <div
              style={{
                border: '1px solid var(--cream-secondary)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  marginBottom: '5px',
                }}
              >
                START TIME
              </span>

              <strong>{HACKERRANK_START_TIME}</strong>
            </div>
          </div>

          {/* Before You Start */}
          <div
            style={{
              background: '#F8F3EA',
              border: '1px solid #E8DDCE',
              borderRadius: '10px',
              padding: '16px 18px',
              marginBottom: '20px',
            }}
          >
            <h4
              style={{
                margin: '0 0 10px',
                fontSize: '14px',
              }}
            >
              Before You Start
            </h4>

            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                color: 'var(--text-secondary)',
                lineHeight: '1.8',
                fontSize: '13px',
              }}
            >
              <li>
                Read every coding problem carefully before writing your
                solution.
              </li>

              <li>
                Use the HackerRank editor to write, run, and test your code.
              </li>

              <li>
                Make sure your solution handles the required test cases and
                edge cases.
              </li>

              <li>
                Use the programming language supported by each challenge.
              </li>

              <li>
                Keep track of the remaining time and submit all solutions
                before the 45-minute limit.
              </li>

              <li>
                Do not refresh or close the HackerRank assessment window while
                the test is in progress.
              </li>

              <li>
                Check your code before final submission because the assessment
                can be attempted only once.
              </li>
            </ul>
          </div>

          {/* HackerRank Test Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
              paddingTop: '4px',
            }}
          >
            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: '12px',
              }}
            >
              Click the button to open the HackerRank coding test.
            </span>

            <a
              href={HACKERRANK_CODING_ASSESSMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
              style={{
                minWidth: '230px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              Open HackerRank Test
              <ExternalLink size={15} />
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

export const HackerRankAssessmentPage = HackerRankAssessmentView

export default HackerRankAssessmentPage