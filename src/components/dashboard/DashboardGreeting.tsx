import { Sparkles } from 'lucide-react'

export function DashboardGreeting({
  name,
  department,
  section,
  batch,
  rrn,
}: {
  name: string
  department: string
  section: string
  batch: string
  rrn: string
}) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">
          <Sparkles size={13} /> {department} · {section} · {batch}
        </div>
        <h1>Good Morning, {name}</h1>
        <p className="page-copy">
          RRN: <strong>{rrn}</strong> · Welcome to your personal learning & placement training workspace.
        </p>
      </div>
    </div>
  )
}

export default DashboardGreeting
