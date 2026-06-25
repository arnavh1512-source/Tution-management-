'use client'

import { useDashboard } from './store'
import { PhoneFrame } from './components/Shell'
import { LoginScreen } from './components/AuthScreens'
import { HomeScreen } from './components/HomeScreen'
import { AdminGate, AdminPanel } from './components/AdminScreens'
import { TimetableScreen, AttendanceScreen, ResultsScreen, AssignmentsScreen, RemindersScreen } from './components/TeachingScreens'
import { StudentsScreen, EditStudentScreen, AddStudentScreen, StaffScreen, AddTeacherScreen } from './components/PeopleScreens'
import { FeesScreen, MeetingsScreen, RankingsScreen, BranchesScreen, MoreScreen, SubscriptionScreen } from './components/UtilityScreens'
import { StuHomeScreen, StuAttendanceScreen, StuResultsScreen, StuRankingScreen, StuTeachersScreen, StuTeacherDetail, StuFeesScreen, StuNotifScreen, StuProfileScreen, StuEditProfileScreen } from './components/StudentScreens'

export default function Page() {
  return (
    <PhoneFrame>
      <ScreenRouter />
    </PhoneFrame>
  )
}

function ScreenRouter() {
  const { screen, role } = useDashboard()

  if (!role) return <LoginScreen />

  switch (screen) {
    case 'home': return <HomeScreen />
    case 'timetable': return <TimetableScreen />
    case 'attendance': return <AttendanceScreen />
    case 'results': return <ResultsScreen />
    case 'assign': return <AssignmentsScreen />
    case 'reminder': return <RemindersScreen />
    case 'students': return <StudentsScreen />
    case 'editStudent': return <EditStudentScreen />
    case 'addStudent': return <AddStudentScreen />
    case 'teachers': return <StaffScreen />
    case 'addTeacher': return <AddTeacherScreen />
    case 'fees': return <FeesScreen />
    case 'meetings': return <MeetingsScreen />
    case 'rankings': return <RankingsScreen />
    case 'branches': return <BranchesScreen />
    case 'more': return <MoreScreen />
    case 'subscription': return <SubscriptionScreen />
    case 'adminGate': return <AdminGate />
    case 'admin': return <AdminPanel />
    case 'stuHome': return <StuHomeScreen />
    case 'stuAttendance': return <StuAttendanceScreen />
    case 'stuResults': return <StuResultsScreen />
    case 'stuRanking': return <StuRankingScreen />
    case 'stuTeachers': return <StuTeachersScreen />
    case 'stuTeacher': return <StuTeacherDetail />
    case 'stuFees': return <StuFeesScreen />
    case 'stuNotif': return <StuNotifScreen />
    case 'stuProfile': return <StuProfileScreen />
    case 'stuEditProfile': return <StuEditProfileScreen />
    default: return <HomeScreen />
  }
}
