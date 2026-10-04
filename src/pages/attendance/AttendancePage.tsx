import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { studentService } from '../../services'
import { AttendanceSubjectSelect } from './AttendanceSubjectSelect'

export function AttendanceView() {
  const [selectedSubject, setSelectedSubject] = useState('')

  const subjectAttendance = studentService.getSubjectAttendance()
  const records = studentService.getAttendanceRecords()

  const filteredRecords = selectedSubject
    ? records.filter((record) => record.subject === selectedSubject)
    : []

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academic Records</div>
          <h1>Attendance Management</h1>
          <p className="page-copy">
            Real-time automated tracking across online placement classes and campus hybrid sessions.
          </p>
        </div>
      </div>

      {/* Attendance Summary Banner */}
      <section className="attendance-summary-banner">
        <div className="metric-card accent-gold">
          <div className="metric-card-header">
            <span>Overall Rate</span>
            <CheckCircle2 size={18} color="var(--gold-primary)" />
          </div>
          <div className="metric-card-value">82%</div>
          <span className="badge-safe" style={{ alignSelf: 'flex-start' }}>Safe Attendance</span>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>Conducted</span>
          </div>
          <div className="metric-card-value">50</div>
          <div className="metric-card-detail">Total academic sessions</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>Attended</span>
          </div>
          <div className="metric-card-value">41</div>
          <div className="metric-card-detail">Present & on time</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>Absences / Late</span>
          </div>
          <div className="metric-card-value">09</div>
          <div className="metric-card-detail">1 review pending</div>
        </div>
      </section>

      {/* Subject-Wise Attendance Progress */}
      <div className="content-card" style={{ marginBottom: '28px' }}>
        <div className="card-heading">
          <h3>Subject-Wise Attendance Breakdown</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Minimum Requirement: 75%</span>
        </div>

        <div className="subject-progress-list">
          {subjectAttendance.map((sub) => (
            <div key={sub.subject} className="subject-progress-item">
              <div>
                <strong>{sub.subject}</strong>
                <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>
                  {sub.present} of {sub.conducted} sessions
                </small>
              </div>
              <div className="progress-bar-track">
                <div
                  className={`progress-bar-fill ${sub.percentage < 75 ? 'danger' : ''}`}
                  style={{ width: `${sub.percentage}%` }}
                />
              </div>
              <span>{sub.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Session Log */}
      <div className="content-card attendance-log-card">
        <div
          className="card-heading attendance-log-heading"
          style={{
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <h3>Attendance Tracker</h3>

          <div className="attendance-subject-control">
            <label htmlFor="attendance-subject-select">Subject</label>
            <AttendanceSubjectSelect
              value={selectedSubject}
              options={subjectAttendance.map((sub) => sub.subject)}
              onChange={setSelectedSubject}
            />
          </div>
        </div>

        {!selectedSubject ? (
          <div className="attendance-empty-state">
            Select a subject to view attendance session details.
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="attendance-empty-state">
            No attendance records found for {selectedSubject}.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="dudex-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.record_id}>
                    <td><strong>{r.formatted_date}</strong></td>
                    <td>{r.subject}</td>
                    <td>{r.teacher}</td>
                    <td>{r.mode}</td>
                    <td>
                      <span
                        className={`badge-status ${
                          r.status === 'Present'
                            ? 'present'
                            : r.status === 'Absent'
                            ? 'absent'
                            : r.status === 'Late'
                            ? 'late'
                            : 'excused'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export const AttendancePage = AttendanceView
export default AttendancePage
