import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { studentService } from '../../services'
import { AttendanceSubjectSelect } from './AttendanceSubjectSelect'

export function AttendanceView() {
  const [selectedTeacher, setSelectedTeacher] = useState('')

  const teacherAttendance = studentService.getTeacherAttendance()
  const records = studentService.getAttendanceRecords()

  const totalConducted = records.length
  const totalAttended = records.filter(
    (r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Excused'
  ).length
  const totalAbsences = Math.max(0, totalConducted - totalAttended)
  const overallRate = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 0
  const isSafe = overallRate >= 75

  const filteredRecords = selectedTeacher && selectedTeacher !== 'All Faculty'
    ? records.filter((record) => record.teacher === selectedTeacher)
    : records

  const teacherOptions = Array.from(new Set(records.map((r) => r.teacher || 'Faculty Member'))).filter(Boolean)

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
          <div className="metric-card-value">
            {totalConducted > 0 ? `${overallRate}%` : '—'}
          </div>
          <span
            className={isSafe && totalConducted > 0 ? 'badge-safe' : 'badge-status absent'}
            style={{ alignSelf: 'flex-start' }}
          >
            {totalConducted > 0
              ? isSafe
                ? 'Safe Attendance'
                : 'Below Threshold (<75%)'
              : 'No Records'}
          </span>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>Conducted</span>
          </div>
          <div className="metric-card-value">{totalConducted}</div>
          <div className="metric-card-detail">Total academic sessions</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>Attended</span>
          </div>
          <div className="metric-card-value">{totalAttended}</div>
          <div className="metric-card-detail">Present &amp; on time</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>Absences / Late</span>
          </div>
          <div className="metric-card-value">{totalAbsences}</div>
          <div className="metric-card-detail">Recorded absences</div>
        </div>
      </section>

      {/* Faculty-Wise Attendance Progress */}
      <div className="content-card" style={{ marginBottom: '28px' }}>
        <div className="card-heading">
          <h3>Faculty-Wise Attendance Breakdown</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Minimum Requirement: 75%</span>
        </div>

        {teacherAttendance.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No faculty attendance records available.
          </div>
        ) : (
          <div className="subject-progress-list">
            {teacherAttendance.map((item) => (
              <div key={item.teacher} className="subject-progress-item">
                <div>
                  <strong>{item.teacher}</strong>
                  <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>
                    {item.present} of {item.conducted} sessions
                  </small>
                </div>
                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${item.percentage < 75 ? 'danger' : ''}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span>{item.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Tracker with Faculty Selection */}
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
            <label htmlFor="attendance-subject-select">Faculty</label>
            <AttendanceSubjectSelect
              value={selectedTeacher}
              options={['All Faculty', ...teacherOptions]}
              onChange={setSelectedTeacher}
              placeholder="Select a faculty member"
            />
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="attendance-empty-state">
            {selectedTeacher
              ? `No attendance records found for ${selectedTeacher}.`
              : 'No attendance records available.'}
          </div>
        ) : (
          <div className="data-table-container">
            <table className="dudex-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Faculty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.record_id}>
                    <td><strong>{r.formatted_date}</strong></td>
                    <td>{r.teacher || 'Faculty Member'}</td>
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
