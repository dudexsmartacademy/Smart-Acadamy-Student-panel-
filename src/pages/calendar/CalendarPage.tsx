import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { View } from '../../types'

export function CalendarView({ goTo }: { goTo: (v: View) => void }) {
  // The calendar UI is currently fixed to September 2026.
  // Use the real current date so "Jump to Today" never falls back to day 8.
  const today = new Date()
  const todayDay = today.getDate()
  const isTodayInDisplayedMonth =
    today.getFullYear() === 2026 && today.getMonth() === 8

  const [selectedDay, setSelectedDay] = useState(
    isTodayInDisplayedMonth ? todayDay : 1
  )

  const events = [
    {
      day: todayDay,
      time: '10:00 AM - 11:30 AM',
      title: 'Python Interview Preparation',
      type: 'Live Class',
    },
    {
      day: todayDay,
      time: '06:00 PM',
      title: 'Python Fundamentals  Closes',
      type: ' Deadline',
    },
    {
      day: 12,
      time: '02:00 PM - 03:30 PM',
      title: 'Aptitude Probability Basics',
      type: 'Live Class',
    },
    {
      day: 14,
      time: '09:00 AM',
      title: 'SQL Relational Lab Opens',
      type: '',
    },
  ]

  const dayEvents = events.filter((e) => e.day === selectedDay)

  const selectedDateLabel =
    selectedDay === todayDay && isTodayInDisplayedMonth
      ? `Today, ${String(todayDay).padStart(2, '0')} September`
      : `September ${selectedDay}`
  const firstWeekdayOffset = (() => {
    const weekday = new Date(2026, 8, 1).getDay()
    return weekday === 0 ? 6 : weekday - 1
  })()

  const jumpToToday = () => {
    if (isTodayInDisplayedMonth) {
      setSelectedDay(todayDay)
    }
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
            <h3>September 2026</h3>
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

            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1
              const hasEv = events.some((e) => e.day === day)
              const isSelected = day === selectedDay
              const isToday = isTodayInDisplayedMonth && day === todayDay

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
                      ? `September ${day}, today`
                      : `September ${day}`
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
