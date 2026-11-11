import { useState, useMemo, useEffect } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { View } from '../../types'
import { studentService, syncStudentData, STUDENT_DATA_SYNCED_EVENT } from '../../services/studentService'

export function CalendarView({ goTo }: { goTo: (v: View) => void }) {
  const today = new Date()
  const todayDay = today.getDate()
  const year = today.getFullYear()
  const month = today.getMonth()
  const monthName = today.toLocaleDateString('en-US', { month: 'long' })

  const [selectedDay, setSelectedDay] = useState(todayDay)
  const [dataVersion, setDataVersion] = useState(0)

  useEffect(() => {
    const handleSync = () => setDataVersion((v) => v + 1)
    window.addEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    syncStudentData().catch(() => {})
    const handleCalSync = () => syncStudentData().catch(() => {})
    window.addEventListener("dudex_calendar_events_changed", handleCalSync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dudex_calendar_sync") syncStudentData().catch(() => {})
    }
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener(STUDENT_DATA_SYNCED_EVENT, handleSync)
    }
  }, [])

  const events = useMemo(() => {
    const evs: { day: number; time: string; title: string; type: string; location?: string }[] = []
    const liveClasses = studentService.getLiveClasses()
    const assessments = studentService.getAssessments()

    liveClasses.forEach((lc) => {
      if (lc.date) {
        const cleanDateStr = lc.date.includes('T') ? lc.date.split('T')[0] : lc.date;
        const parts = cleanDateStr.split('-').map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          const [y, m, day] = parts;
          if (y === year && (m - 1) === month) {
            evs.push({
              day,
              time: lc.start_time || 'Scheduled',
              title: lc.topic || lc.title || 'Live Class',
              type: 'Live Class',
              location: (lc as any).location || (lc as any).room || undefined,
            })
          }
        }
      }
    })

    assessments.forEach((ass) => {
      const rawDate = (ass.start_date || (ass as any).date || '').split('T')[0];
      if (rawDate) {
        const parts = rawDate.split('-').map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          const [y, m, day] = parts;
          if (y === year && (m - 1) === month) {
            evs.push({
              day,
              time: 'Exam',
              title: ass.title || 'Assessment',
              type: ass.type === 'Coding' ? 'Coding Assessment' : 'MCQ Assessment',
            })
          }
        }
      }
    })

    const calEvents = studentService.getCalendarEvents()
    calEvents.forEach((ce) => {
      if (ce.date) {
        const parts = ce.date.split('-').map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          const [y, m, day] = parts;
          if (y === year && (m - 1) === month) {
            evs.push({
              day,
              time: ce.start_time ? `${ce.start_time}${ce.end_time ? ' - ' + ce.end_time : ''}` : 'Scheduled',
              title: ce.title,
              type: ce.type || 'Academic Event',
              location: ce.location || ce.room || undefined,
            });
          }
        }
      }
    });

    return evs
  }, [month, year, dataVersion])

  const dayEvents = events.filter((e) => e.day === selectedDay)

  const selectedDateLabel =
    selectedDay === todayDay
      ? `Today, ${String(todayDay).padStart(2, '0')} ${monthName}`
      : `${monthName} ${selectedDay}`
  const firstWeekdayOffset = (() => {
    const weekday = new Date(year, month, 1).getDay()
    return weekday === 0 ? 6 : weekday - 1
  })()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const jumpToToday = () => {
    setSelectedDay(todayDay)
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Academic Schedule</div>
          <h1>Calendar & Milestones</h1>
          <p className="page-copy">
            Live classes, deadline trackers, and academy announcements.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-outline" onClick={jumpToToday}>
            Jump to Today
          </button>
        </div>
      </div>

      <div className="coding-ide-grid">
        <div className="content-card">
          <div className="card-heading">
            <h3>{monthName} {year}</h3>
          </div>

          <div
            className="calendar-month-grid"
            style={{
              display: 'grid',
              gap: '8px',
              textAlign: 'center',
            }}
          >
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <strong
                key={d}
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}
              >
                {d}
              </strong>
            ))}

            {Array.from({ length: firstWeekdayOffset }, (_, i) => (
              <span key={`empty-${i}`} aria-hidden="true" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const hasEv = events.some((e) => e.day === day)
              const isSelected = day === selectedDay
              const isToday = day === todayDay

              return (
                <button
                  key={day}
                  style={{
                    padding: '12px 0',
                    borderRadius: '8px',
                    backgroundColor: isSelected
                      ? 'var(--brand-black)'
                      : 'var(--cream-bg)',
                    color: isSelected
                      ? '#FFF'
                      : 'var(--text-primary)',
                    fontWeight: isToday ? 800 : 600,
                    border: hasEv
                      ? '1px solid var(--gold-primary)'
                      : '1px solid transparent',
                    position: 'relative',
                    boxShadow: isToday
                      ? 'inset 0 0 0 1px var(--gold-primary)'
                      : 'none',
                    minWidth: 0,
                  }}
                  onClick={() => setSelectedDay(day)}
                  aria-label={
                    isToday
                      ? `${monthName} ${day}, today`
                      : `${monthName} ${day}`
                  }
                >
                  {day}

                  {hasEv && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: isSelected
                          ? 'var(--gold-light)'
                          : 'var(--gold-primary)',
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className="content-card"
          style={{
            background: '#1B1C1E',
            color: '#FFF',
            borderColor: '#333',
          }}
        >
          <h3
            style={{
              color: '#FFF',
              marginBottom: '16px',
            }}
          >
            Agenda for {selectedDateLabel}
          </h3>

          {dayEvents.length > 0 ? (
            dayEvents.map((ev, i) => (
              <div
                key={i}
                style={{
                  borderBottom: '1px solid #333',
                  paddingBottom: '12px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--gold-light)',
                    textTransform: 'uppercase',
                  }}
                >
                  {ev.type} · {ev.time}
                </span>

                <h4
                  style={{
                    color: '#FFF',
                    margin: '4px 0',
                  }}
                >
                  {ev.title}
                </h4>
                {ev.location && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--gold-light)',
                      margin: '2px 0 6px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>📍 Location / Room:</span>
                    <strong style={{ color: '#FFF' }}>{ev.location}</strong>
                  </p>
                )}

                {ev.type === 'Live Class' && (
                  <button
                    className="btn-link"
                    style={{ color: 'var(--gold-light)' }}
                    onClick={() => goTo('live')}
                  >
                    Open Class Details <ArrowUpRight size={13} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p
              style={{
                color: '#888',
                fontSize: '13px',
              }}
            >
              No events scheduled for this day.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export const CalendarPage = CalendarView
export default CalendarPage
