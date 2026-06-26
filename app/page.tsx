'use client'

import dynamic from 'next/dynamic'
import { useDashboard } from './store'
import { PhoneFrame } from './components/Shell'
import { SupabaseProvider } from './components/SupabaseProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoginScreen } from './components/AuthScreens'
import { HomeScreen } from './components/HomeScreen'

function ScreenLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-[3px] border-[#e6eaf2] border-t-[#2a6fdb] rounded-full animate-spin" />
    </div>
  )
}

const dyn = (importFn: () => Promise<Record<string, any>>, name: string) =>
  dynamic(() => importFn().then(m => ({ default: m[name] })), { loading: ScreenLoading })

const AdminGate = dyn(() => import('./components/AdminScreens'), 'AdminGate')
const AdminPanel = dyn(() => import('./components/AdminScreens'), 'AdminPanel')

const TimetableScreen = dyn(() => import('./components/TeachingScreens'), 'TimetableScreen')
const AttendanceScreen = dyn(() => import('./components/TeachingScreens'), 'AttendanceScreen')
const ResultsScreen = dyn(() => import('./components/TeachingScreens'), 'ResultsScreen')
const AssignmentsScreen = dyn(() => import('./components/TeachingScreens'), 'AssignmentsScreen')
const RemindersScreen = dyn(() => import('./components/TeachingScreens'), 'RemindersScreen')

const StudentsScreen = dyn(() => import('./components/PeopleScreens'), 'StudentsScreen')
const EditStudentScreen = dyn(() => import('./components/PeopleScreens'), 'EditStudentScreen')
const AddStudentScreen = dyn(() => import('./components/PeopleScreens'), 'AddStudentScreen')
const StaffScreen = dyn(() => import('./components/PeopleScreens'), 'StaffScreen')
const AddTeacherScreen = dyn(() => import('./components/PeopleScreens'), 'AddTeacherScreen')

const FeesScreen = dyn(() => import('./components/UtilityScreens'), 'FeesScreen')
const MeetingsScreen = dyn(() => import('./components/UtilityScreens'), 'MeetingsScreen')
const RankingsScreen = dyn(() => import('./components/UtilityScreens'), 'RankingsScreen')
const BranchesScreen = dyn(() => import('./components/UtilityScreens'), 'BranchesScreen')
const SubjectsScreen = dyn(() => import('./components/UtilityScreens'), 'SubjectsScreen')
const MoreScreen = dyn(() => import('./components/UtilityScreens'), 'MoreScreen')
const SubscriptionScreen = dyn(() => import('./components/UtilityScreens'), 'SubscriptionScreen')

const StuHomeScreen = dyn(() => import('./components/StudentScreens'), 'StuHomeScreen')
const StuAttendanceScreen = dyn(() => import('./components/StudentScreens'), 'StuAttendanceScreen')
const StuResultsScreen = dyn(() => import('./components/StudentScreens'), 'StuResultsScreen')
const StuRankingScreen = dyn(() => import('./components/StudentScreens'), 'StuRankingScreen')
const StuTeachersScreen = dyn(() => import('./components/StudentScreens'), 'StuTeachersScreen')
const StuTeacherDetail = dyn(() => import('./components/StudentScreens'), 'StuTeacherDetail')
const StuFeesScreen = dyn(() => import('./components/StudentScreens'), 'StuFeesScreen')
const StuNotifScreen = dyn(() => import('./components/StudentScreens'), 'StuNotifScreen')
const StuProfileScreen = dyn(() => import('./components/StudentScreens'), 'StuProfileScreen')
const StuEditProfileScreen = dyn(() => import('./components/StudentScreens'), 'StuEditProfileScreen')

export default function Page() {
  return (
    <ErrorBoundary>
      <SupabaseProvider>
        <PhoneFrame>
          <ScreenRouter />
        </PhoneFrame>
      </SupabaseProvider>
    </ErrorBoundary>
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
    case 'subjects': return <SubjectsScreen />
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
