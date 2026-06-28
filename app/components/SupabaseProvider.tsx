'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useDashboard, type Role, type StaffStatus, type Teacher, type Student, type FeeStatus, type MeetingItem, type AssignmentItem, type BranchItem, type StuResultItem, type AttLogItem, type NotifItem, type FeeHistoryItem, type ScheduleItem } from '../store'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, loadTeachers, loadStudents, set } = useDashboard()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleAuth(session.user.id, session.user.email ?? '')
      else resumeStudentOrLanding()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) handleAuth(session.user.id, session.user.email ?? '')
      else resumeStudentOrLanding()
    })

    return () => subscription.unsubscribe()
  }, [])

  // Refresh-on-focus: re-pull fresh data whenever the user returns to the app
  // (tab/app regains focus). Throttled so quick tab-switches don't spam queries.
  const lastRefresh = useRef(0)
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastRefresh.current < 8000) return
      lastRefresh.current = Date.now()
      const st = useDashboard.getState()
      if (st.supabaseUserId && (st.role === 'admin' || st.role === 'teacher') && st.staffStatus === 'approved') {
        fetchAllData()
      } else if (!st.supabaseUserId && st.currentStudentDbId) {
        const code = localStorage.getItem('student_code')
        if (code) st.loadStudentByCode(code)
      }
    }
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  // No Google session: a returning student may have a saved code; otherwise land on login.
  function resumeStudentOrLanding() {
    const code = typeof window !== 'undefined' ? localStorage.getItem('student_code') : null
    if (code) {
      useDashboard.getState().loadStudentByCode(code).then(ok => { if (!ok) set({ authLoading: false }) })
    } else {
      set({ authLoading: false })
    }
  }

  async function handleAuth(userId: string, email: string) {
    const { data: profile } = await supabase.from('profiles').select('role, staff_status').eq('id', userId).single()
    const role = (profile?.role as Role) ?? 'student'
    const staffStatus = (profile?.staff_status as StaffStatus) ?? 'none'
    const { data: headExists } = await supabase.rpc('head_exists')
    setAuth(userId, role, email, staffStatus, !!headExists)
    // Only approved staff load the centre's full dataset.
    if ((role === 'admin' || role === 'teacher') && staffStatus === 'approved') {
      await fetchAllData()
    }
  }

  async function fetchAllData() {
    const [
      { data: teachers },
      { data: students },
      { data: branches },
      { data: meetings },
      { data: assignments },
      { data: timetable },
      { data: fees },
      { data: tests },
      { data: results },
      { data: notifications },
      { data: subjects },
      { data: attendance },
    ] = await Promise.all([
      supabase.from('teachers').select('*').order('created_at', { ascending: false }),
      supabase.from('students').select('id,name,class,school,parent_contact,student_code,fee_status,address,branch_id,profile_id,created_at').order('created_at', { ascending: false }),
      supabase.from('branches').select('*').order('is_main', { ascending: false }),
      supabase.from('meetings').select('*').order('date', { ascending: false }),
      supabase.from('assignments').select('*').order('due_date', { ascending: false }),
      supabase.from('timetable').select('*').order('start_time', { ascending: true }),
      supabase.from('fees').select('*').order('due_date', { ascending: false }),
      supabase.from('tests').select('*').order('date', { ascending: false }),
      supabase.from('results').select('*'),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('subjects').select('*'),
      supabase.from('attendance').select('*').order('date', { ascending: false }),
    ])

    const mappedTeachers = (teachers ?? []).map(mapTeacher)
    const mappedStudents = (students ?? []).map(mapStudent)
    const subjectList = (subjects ?? []).map((s: any) => ({ name: s.name as string, dbId: s.id as string }))
    const subjectMap = Object.fromEntries(subjectList.map(s => [s.dbId, s.name]))
    const studentMap = Object.fromEntries(mappedStudents.map(s => [s.dbId, s]))

    loadTeachers(mappedTeachers)
    loadStudents(mappedStudents)

    // Branches — count per-branch
    const branchesList: BranchItem[] = (branches ?? []).map((b: any) => ({
      name: b.name, address: b.address ?? '', main: !!b.is_main,
      students: (students ?? []).filter((s: any) => s.branch_id === b.id).length,
      staff: (teachers ?? []).filter((t: any) => t.branch_id === b.id).length,
      dbId: b.id,
    }))

    // Meetings
    const meetingsList: MeetingItem[] = (meetings ?? []).map((m: any) => {
      const d = new Date(m.date)
      return {
        day: String(d.getDate()).padStart(2, '0'),
        mon: d.toLocaleString('en', { month: 'short' }),
        title: m.title, time: m.time ?? '', kind: m.meeting_type ?? 'Staff',
        dbId: m.id,
      }
    })

    // Assignments
    const assignmentsList: AssignmentItem[] = (assignments ?? []).map((a: any) => {
      const d = new Date(a.due_date)
      return {
        title: a.title, klass: a.class ?? '',
        due: `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`,
        submitted: 0, total: mappedStudents.filter(s => s.klass === (a.class ?? '')).length,
        dbId: a.id,
      }
    })

    // Timetable grouped by day
    const timetableData: Record<string, string[][]> = {}
    for (const t of (timetable ?? []) as any[]) {
      const day = t.day as string
      if (!timetableData[day]) timetableData[day] = []
      timetableData[day].push([t.start_time, t.end_time, t.subject ?? '', t.class ?? '', t.room ?? ''])
    }

    // Today's schedule
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = days[new Date().getDay()]
    const todayEntries = timetableData[today] ?? []
    const now = new Date()
    const schedule: ScheduleItem[] = todayEntries.map(([start, end, subject, klass, room]) => {
      const [h] = start.split(':').map(Number)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      const startH = new Date(); startH.setHours(h, 0, 0, 0)
      const [eh] = end.split(':').map(Number)
      const endH = new Date(); endH.setHours(eh, 0, 0, 0)
      const status = now > endH ? 'Done' : now >= startH ? 'Ongoing' : `${hour12}:00 ${ampm}`
      const statusColor = status === 'Done' ? '#2fa36b' : status === 'Ongoing' ? '#2a6fdb' : '#6b7689'
      const statusBg = status === 'Done' ? '#e7f5ee' : status === 'Ongoing' ? '#eaf1fc' : '#eef1f7'
      return { time: `${hour12}:00`, ampm, subject, klass, room, status, statusColor, statusBg }
    })

    // Subjects
    const subjectItems = subjectList

    // Results + Rankings
    const testMap: Record<string, any> = Object.fromEntries((tests ?? []).map((t: any) => [t.id, t]))
    const stuResults: StuResultItem[] = (results ?? []).map((r: any) => {
      const test = testMap[r.test_id]
      return {
        subject: subjectMap[test?.subject_id] ?? 'Unknown',
        test: test?.name ?? 'Test', date: test?.date ?? '',
        marks: r.marks ?? 0, total: test?.max_marks ?? 100,
      }
    })

    // Compute rankings per subject from results
    const rankData: Record<string, [string, number][]> = {}
    const resultsBySubjectStudent: Record<string, Record<string, { total: number; max: number }>> = {}
    for (const r of (results ?? []) as any[]) {
      const test = testMap[r.test_id]
      if (!test) continue
      const subjectName = subjectMap[test.subject_id] ?? 'Unknown'
      const student = studentMap[r.student_id]
      const studentName = student?.name ?? 'Unknown'
      if (!resultsBySubjectStudent[subjectName]) resultsBySubjectStudent[subjectName] = {}
      if (!resultsBySubjectStudent[subjectName][studentName]) resultsBySubjectStudent[subjectName][studentName] = { total: 0, max: 0 }
      resultsBySubjectStudent[subjectName][studentName].total += r.marks ?? 0
      resultsBySubjectStudent[subjectName][studentName].max += test.max_marks ?? 100
    }
    for (const [subject, students] of Object.entries(resultsBySubjectStudent)) {
      rankData[subject] = Object.entries(students)
        .map(([name, { total, max }]) => [name, max > 0 ? Math.round((total / max) * 100) : 0] as [string, number])
        .sort((a, b) => b[1] - a[1])
    }

    // Attendance log (for student view)
    const statusIcons: Record<string, { icon: string; tint: string; color: string }> = {
      Present: { icon: '✅', tint: '#e7f5ee', color: '#2fa36b' },
      Absent: { icon: '❌', tint: '#fdecea', color: '#e8553c' },
      Leave: { icon: '📋', tint: '#fcf3e3', color: '#e0962f' },
    }
    const stuAttendanceLog: AttLogItem[] = (attendance ?? []).slice(0, 15).map((a: any) => {
      const d = new Date(a.date)
      const si = statusIcons[a.status] ?? statusIcons.Present
      return {
        day: d.toLocaleString('en', { weekday: 'long' }),
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: a.status, ...si,
      }
    })

    // Fee history + pending fee (for student view)
    const stuFeeHistory: FeeHistoryItem[] = (fees ?? []).filter((f: any) => f.status === 'Paid').map((f: any) => ({
      period: f.period ?? '',
      date: f.paid_date ? new Date(f.paid_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      amount: `₹${(f.amount ?? 0).toLocaleString('en-IN')}`,
    }))
    const pendingFee = (fees ?? []).find((f: any) => f.status !== 'Paid')
    const stuPendingFee = pendingFee ? {
      amount: `₹${(pendingFee.amount ?? 0).toLocaleString('en-IN')}`,
      period: pendingFee.period ?? '',
      dueDate: pendingFee.due_date ? new Date(pendingFee.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    } : null

    // Notifications (for student view)
    const stuNotifications: NotifItem[] = (notifications ?? []).map((n: any) => ({
      icon: n.icon ?? '📢', tint: n.tint ?? '#eaf1fc',
      title: n.title ?? '', detail: n.detail ?? '',
      when: timeAgo(n.created_at), dbId: n.id,
    }))

    // Reminders as notifications
    const stuReminders: NotifItem[] = stuNotifications.slice(0, 3)

    set({
      branchesList, meetingsList, assignmentsList, timetableData, schedule,
      rankData, subjects: subjectItems, stuResults, stuAttendanceLog,
      stuFeeHistory, stuPendingFee, stuNotifications, stuReminders,
    })
  }

  return <>{children}</>
}

function mapTeacher(t: Record<string, unknown>): Teacher {
  return {
    name: t.name as string, subject: t.subject as string,
    experience: (t.experience as number) ?? 0, qualification: (t.qualification as string) ?? '—',
    rating: t.rating != null ? String(t.rating) : undefined,
    about: (t.about as string) ?? undefined, dbId: t.id as string,
  }
}

function mapStudent(s: Record<string, unknown>): Student {
  return {
    name: s.name as string, klass: (s.class as string) ?? '',
    attendance: 0, feeStatus: ((s.fee_status as string) ?? 'Due') as FeeStatus,
    school: (s.school as string) ?? '', parent: (s.parent_contact as string) ?? '',
    id: (s.student_code as string) ?? '', address: (s.address as string) ?? '',
    dbId: s.id as string,
  }
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
