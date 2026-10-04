import {
  LayoutDashboard,
  Video,
  NotebookPen,
  CalendarDays,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react'
import type { View } from '../types'

export * from './dashboard'
export * from './student'

export const HACKERRANK_CODING_ASSESSMENT_URL =
  'https://www.hackerrank.com/dudexai-coding-challenge-2'

export const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'live', label: 'Live Classes', icon: Video },
  { id: 'notes', label: 'Daily Notes', icon: NotebookPen },
  { id: 'attendance', label: 'Attendance', icon: CalendarDays },
  { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
  { id: 'results', label: 'Results', icon: CheckCircle2 },
]
