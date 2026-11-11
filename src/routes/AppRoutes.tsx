
import type {
  View,
  DailyNote,
  PortalNotification,
} from '../types'
import { useAuth } from '../context/AuthContext'

import { DashboardView } from '../pages/dashboard'
import { LiveClassesView } from '../pages/live-classes'
import { DailyNotesView, NoteDetailView } from '../pages/notes'
import {
  CourseDetailsPage as CourseDetailsView,
} from '../pages/classes'
import { AttendanceView } from '../pages/attendance'
import { MarkAttendancePage } from '../pages/attendance/MarkAttendancePage'
import {
  AssessmentsView,
  AssessmentDetailsView,
  HackerRankAssessmentView,
  McqPlayerView,
} from '../pages/mcq-assessments'
import { CodingPage as CodingChallengeView } from '../pages/coding'
import { ResultsView } from '../pages/results'
import { PerformanceView } from '../pages/performance'
import { CalendarView } from '../pages/calendar'
import { AnnouncementsView } from '../pages/announcements'
import { NotificationsView } from '../pages/notifications'
import { MaterialsView } from '../pages/materials'
import { ProfileView } from '../pages/profile'
import { SettingsView } from '../pages/settings'
import { HelpView } from '../pages/help'

interface AppRoutesProps {
  view: View
  goTo: (v: View) => void
  selectedNote: DailyNote | null
  openNoteDetail: (note: DailyNote) => void
  selectedAssessmentId: string
  setSelectedAssessmentId: (id: string) => void
  notifications: PortalNotification[]
  markAllRead: () => void
}

export function AppRoutes({
  view,
  goTo,
  selectedNote,
  openNoteDetail,
  selectedAssessmentId,
  setSelectedAssessmentId,
  notifications,
  markAllRead,
}: AppRoutesProps) {
  const {
    profile,
    registrationDetails,
    saveStudentProfile,
    saveRegistrationDetails,
  } = useAuth()

  return (
    <>
      {view === 'dashboard' && (
        <DashboardView
          goTo={goTo}
          profile={profile}
          openNoteDetail={openNoteDetail}
          setSelectedAssessmentId={setSelectedAssessmentId}
        />
      )}

      {view === 'live' && <LiveClassesView />}

      {view === 'notes' && (
        <DailyNotesView openNoteDetail={openNoteDetail} />
      )}

      {view === 'note-detail' && (
        <NoteDetailView note={selectedNote} goTo={goTo} />
      )}

      {/* New Mark Attendance page */}
      {view === 'mark-attendance' && (
        <MarkAttendancePage profile={profile} />
      )}

      {/* Classes routed to Live Classes */}
      {view === 'classes' && <LiveClassesView />}

      {view === 'courses' && <CourseDetailsView goTo={goTo} />}

      {/* Existing Attendance Management page */}
      {view === 'attendance' && <AttendanceView />}

      {view === 'assessments' && (
        <AssessmentsView
          goTo={goTo}
          setSelectedAssessmentId={setSelectedAssessmentId}
        />
      )}

      {view === 'assessment-details' && (
        <AssessmentDetailsView
          goTo={goTo}
          assessmentId={selectedAssessmentId}
        />
      )}

      {view === 'hackerrank' && (
        <HackerRankAssessmentView goTo={goTo} assessmentId={selectedAssessmentId} />
      )}

      {view === 'mcq' && <McqPlayerView goTo={goTo} assessmentId={selectedAssessmentId} />}

      {view === 'coding' && <CodingChallengeView goTo={goTo} assessmentId={selectedAssessmentId} />}

      {view === 'results' && <ResultsView />}

      {view === 'performance' && <PerformanceView />}

      {view === 'calendar' && <CalendarView goTo={goTo} />}

      {view === 'announcements' && <AnnouncementsView />}

      {view === 'notifications' && (
        <NotificationsView
          notifications={notifications}
          onMarkAll={markAllRead}
        />
      )}

      {view === 'materials' && <MaterialsView />}

      {view === 'profile' && (
        <ProfileView
          profile={profile}
          registrationDetails={registrationDetails}
          onSave={saveStudentProfile}
          onRegistrationSave={saveRegistrationDetails}
        />
      )}

      {view === 'settings' && <SettingsView />}

      {view === 'help' && <HelpView />}
    </>
  )
}

export default AppRoutes