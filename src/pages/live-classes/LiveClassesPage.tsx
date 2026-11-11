import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { studentService } from '../../services'
import { STUDENT_DATA_SYNCED_EVENT, syncStudentData } from '../../services/studentService'

export function LiveClassesView() {
  const [tab, setTab] = useState<'All' | 'Live Now' | 'Today'>('All')
  const [, setTick] = useState(0)

  useEffect(() => {
    const handleSync = () => setTick((v) => v + 1)
    window.addEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    syncStudentData().catch(() => {})
    return () => {
      window.removeEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    }
  }, [])

  const classes = studentService.getLiveClasses()
  const todayIso = new Date().toISOString().split('T')[0]

  const filtered = classes.filter((c) => {
    if (tab === 'Live Now') return c.status === 'Live Now'
    if (tab === 'Today') return c.date === todayIso || c.date.includes('Today')
    return true
  })

  return (
    <div className="page fade-in live-classes-page">
      <div className="page-header live-classes-header">
        <div>
          <div className="eyebrow">Live Academy</div>
          <h1>Live Classes</h1>
          <p className="page-copy">
            Daily placement training and cohort masterclasses conducted via external meeting links (Google Meet).
          </p>
        </div>
      </div>

      <div className="live-classes-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {(['All', 'Live Now', 'Today'] as const).map((t) => (
          <button
            key={t}
            className={tab === t ? 'btn-primary' : 'btn-outline'}
            onClick={() => setTab(t)}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="live-classes-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.length === 0 ? (
          <div
            className="content-card"
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            No live classes scheduled for {tab.toLowerCase()}.
          </div>
        ) : (
          filtered.map((item) => (
          <div
            key={item.live_class_id}
            className="content-card live-class-card"
            style={{
              background: item.status === 'Live Now' ? 'linear-gradient(135deg, #1B1C1E 0%, #242527 100%)' : '#FFFFFF',
              color: item.status === 'Live Now' ? '#FFFFFF' : 'var(--text-primary)',
              borderColor: item.status === 'Live Now' ? '#33353A' : 'var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div className="live-class-content" style={{ maxWidth: '650px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    backgroundColor: item.status === 'Live Now' ? 'rgba(176, 142, 103, 0.25)' : 'var(--cream-secondary)',
                    color: item.status === 'Live Now' ? 'var(--gold-light)' : 'var(--gold-dark)',
                    border: item.status === 'Live Now' ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)',
                  }}
                >
                  {item.status === 'Live Now' && <span className="pulse-indicator" style={{ display: 'inline-block', marginRight: '6px' }} />}
                  {item.status}
                </span>
                <span style={{ fontSize: '12px', color: item.status === 'Live Now' ? '#A09B94' : 'var(--text-muted)' }}>
                  {item.date} · {item.start_time} - {item.end_time}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', color: item.status === 'Live Now' ? '#FFF' : 'var(--text-primary)', marginBottom: '6px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', color: item.status === 'Live Now' ? 'var(--beige-light)' : 'var(--text-secondary)', marginBottom: '12px' }}>
                Topic: {item.topic}
              </p>
              <div style={{ fontSize: '12px', color: item.status === 'Live Now' ? '#A09B94' : 'var(--text-muted)' }}>
                Faculty: <strong>{item.teacher_name}</strong> · Platform: <strong>{item.platform}</strong>
              </div>
            </div>

            <div className="live-class-action" style={{ minWidth: 0 }}>
              {item.status === 'Live Now' ? (
                <button
                  className="btn-gold"
                  onClick={() => window.open(item.meeting_url, '_blank', 'noopener,noreferrer')}
                >
                  JOIN LIVE CLASS <ExternalLink size={16} />
                </button>
              ) : item.status === 'Upcoming' ? (
                <button
                  className="btn-outline"
                  onClick={() => window.open(item.meeting_url, '_blank', 'noopener,noreferrer')}
                >
                  Open Meeting Link <ExternalLink size={14} />
                </button>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Class Completed
                </span>
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  )
}

export const LiveClassesPage = LiveClassesView
export default LiveClassesPage
