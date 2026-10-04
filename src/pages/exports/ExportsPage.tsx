import { Download } from 'lucide-react'

export function ExportsPage() {
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academic Records</div>
          <h1>Exports & Reports</h1>
          <p className="page-copy">Download your academic statements, attendance summaries, and assessment scorecards.</p>
        </div>
      </div>
      <div className="content-card" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '16px' }}>Download Documents</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--cream-secondary)', borderRadius: '10px' }}>
            <div>
              <strong>Semester Attendance Certificate</strong>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Verified attendance report (PDF)</p>
            </div>
            <button className="btn-outline" style={{ padding: '8px 14px', fontSize: '13px' }}>
              <Download size={14} style={{ marginRight: '6px' }} /> Download
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--cream-secondary)', borderRadius: '10px' }}>
            <div>
              <strong>MCQ & Assessment Scorecard</strong>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Complete performance transcript (PDF)</p>
            </div>
            <button className="btn-outline" style={{ padding: '8px 14px', fontSize: '13px' }}>
              <Download size={14} style={{ marginRight: '6px' }} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportsPage
