import { Download } from 'lucide-react'

export function MaterialsView() {
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Library</div>
          <h1>Course Materials & Downloads</h1>
          <p className="page-copy">Reference handbooks, syllabus guides, and official placement material.</p>
        </div>
      </div>

      <div className="content-card">
        {[
          { title: 'Python Placement Interview Handbook (2026 Edition)', size: '3.4 MB', date: '08 Sep' },
          { title: 'Data Structures & Algorithms Cheat Sheet', size: '2.1 MB', date: '05 Sep' },
          { title: 'Relational Database Schema & Query Reference', size: '1.8 MB', date: '28 Aug' },
        ].map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              borderBottom: '1px solid var(--cream-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Download size={18} color="var(--gold-primary)" />
              <div>
                <strong>{m.title}</strong>
                <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>
                  PDF · {m.size} · Updated {m.date}
                </small>
              </div>
            </div>
            <button className="btn-outline" onClick={() => alert(`Downloading ${m.title}`)}>
              Download <Download size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export const MaterialsPage = MaterialsView
export default MaterialsPage
