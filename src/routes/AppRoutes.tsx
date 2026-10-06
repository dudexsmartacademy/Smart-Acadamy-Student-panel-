import React from 'react'
import type { View, StudentProfile, RegistrationDetails, DailyNote, PortalNotification } from '../types'
import { studentService, authService } from '../services'

import { DashboardView } from '../pages/dashboard'
import { LiveClassesView } from '../pages/live-classes'
import { DailyNotesView, NoteDetailView } from '../pages/notes'
import { ClassesPage as MyClassesView, CourseDetailsPage as CourseDetailsView } from '../pages/classes'
import { AttendanceView } from '../pages/attendance'
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
  profile: StudentProfile
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>
  registrationDetails: RegistrationDetails
  setRegistrationDetails: React.Dispatch<React.SetStateAction<RegistrationDetails>>
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
  profile,
  setProfile,
  registrationDetails,
  setRegistrationDetails,
  selectedNote,
  openNoteDetail,
  selectedAssessmentId,
  setSelectedAssessmentId,
  notifications,
  markAllRead,
}: AppRoutesProps) {
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
      {view === 'notes' && <DailyNotesView openNoteDetail={openNoteDetail} />}
      {view === 'note-detail' && <NoteDetailView note={selectedNote} goTo={goTo} />}
      {view === 'classes' && <MyClassesView goTo={goTo} />}
      {view === 'courses' && <CourseDetailsView goTo={goTo} />}
      {view === 'attendance' && <AttendanceView />}
      {view === 'assessments' && (
        <AssessmentsView goTo={goTo} setSelectedAssessmentId={setSelectedAssessmentId} />
      )}
      {view === 'assessment-details' && (
        <AssessmentDetailsView goTo={goTo} assessmentId={selectedAssessmentId} />
      )}
      {view === 'hackerrank' && <HackerRankAssessmentView goTo={goTo} />}
      {view === 'mcq' && <McqPlayerView goTo={goTo} />}
      {view === 'coding' && <CodingChallengeView goTo={goTo} />}
      {view === 'results' && <ResultsView />}
      {view === 'performance' && <PerformanceView />}
      {view === 'calendar' && <CalendarView goTo={goTo} />}
      {view === 'announcements' && <AnnouncementsView />}
      {view === 'notifications' && (
        <NotificationsView notifications={notifications} onMarkAll={markAllRead} />
      )}
      {view === 'materials' && <MaterialsView />}
      {view === 'profile' && (
        <ProfileView
          profile={profile}
          registrationDetails={registrationDetails}
          onSave={(p) => setProfile(studentService.saveProfile(p))}
          onRegistrationSave={(details) => {
            setRegistrationDetails(details)
            authService.saveRegistrationDetails(details)
          }}
        />
      )}
      {view === 'settings' && <SettingsView />}
      {view === 'help' && <HelpView />}
    </>
  )
}

export default AppRoutes
