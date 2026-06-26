import { create } from 'zustand'
import { supabase } from './lib/supabase'

const dbErr = (op: string, notify: (m: string) => void) =>
  ({ error }: { error: unknown }) => { if (error) notify(`Sync failed: ${op}`) }

export type Screen =
  | 'home' | 'timetable' | 'attendance' | 'results' | 'assign' | 'reminder'
  | 'students' | 'editStudent' | 'addStudent' | 'teachers' | 'addTeacher'
  | 'fees' | 'meetings' | 'rankings' | 'branches' | 'subjects' | 'more' | 'subscription'
  | 'adminGate' | 'admin'
  | 'stuHome' | 'stuAttendance' | 'stuResults' | 'stuRanking' | 'stuTeachers'
  | 'stuTeacher' | 'stuFees' | 'stuNotif' | 'stuProfile' | 'stuEditProfile'

export type Tab = 'home' | 'timetable' | 'students' | 'teachers' | 'more'
  | 'stuHome' | 'stuResults' | 'stuRanking' | 'stuTeachers' | 'stuProfile'
export type Role = 'admin' | 'teacher' | 'student' | null
export type FeeStatus = 'Paid' | 'Due' | 'Overdue'

export interface Teacher { name: string; subject: string; experience: number; qualification: string; rating?: string; about?: string; dbId?: string }
export interface Student { name: string; klass: string; attendance: number; feeStatus: FeeStatus; school: string; parent: string; id: string; address?: string; dbId?: string }

export interface ScheduleItem { time: string; ampm: string; subject: string; klass: string; room: string; status: string; statusColor: string; statusBg: string }
export interface MeetingItem { day: string; mon: string; title: string; time: string; kind: string; dbId?: string }
export interface AssignmentItem { title: string; due: string; klass: string; submitted: number; total: number; dbId?: string }
export interface BranchItem { name: string; address: string; students: number; staff: number; main: boolean; dbId?: string }
export interface StuResultItem { subject: string; test: string; date: string; marks: number; total: number }
export interface AttLogItem { day: string; date: string; status: string; icon: string; tint: string; color: string }
export interface FeeHistoryItem { period: string; date: string; amount: string }
export interface NotifItem { icon: string; tint: string; title: string; detail: string; when: string; dbId?: string }
export interface SubjectItem { name: string; dbId: string }

interface State {
  screen: Screen; tab: Tab; role: Role; origin: string | null
  attClass: string; att: Record<number, string>; rankSubject: string; ttDay: string
  toast: string; editIndex: number; adminUnlocked: boolean; pin: string; pinError: boolean; adminPin: string
  googleEmail: string; reminderType: string; plan: string
  newTeacher: { name: string; subject: string; qualification: string; experience: string }
  newStudent: { name: string; school: string; klass: string; batch: string; branch: string; parent: string; address: string }
  stuTeacherIndex: number; stuRankSubject: string
  stuEdit: { name: string; parentNumber: string; address: string }
  supabaseUserId: string | null; authLoading: boolean; liveMode: boolean

  teachers: Teacher[]; students: Student[]
  branchesList: BranchItem[]
  meetingsList: MeetingItem[]
  assignmentsList: AssignmentItem[]
  timetableData: Record<string, string[][]>
  schedule: ScheduleItem[]
  rankData: Record<string, [string, number][]>
  subjects: SubjectItem[]
  stuReminders: NotifItem[]
  stuNotifications: NotifItem[]
  stuAttendanceLog: AttLogItem[]
  stuFeeHistory: FeeHistoryItem[]
  stuResults: StuResultItem[]
  currentStudentDbId: string | null
  stuPendingFee: { amount: string; period: string; dueDate: string } | null
  searchQuery: string
}

interface Actions {
  go: (screen: Screen, tab?: Tab) => void
  goFrom: (screen: Screen, tab: Tab, origin: string) => void
  back: () => void
  notify: (msg: string) => void
  set: (partial: Partial<State>) => void
  pressPin: (key: string) => void
  toggleAtt: (i: number) => void
  setStudentField: (patch: Partial<Student>) => void
  setNewTeacher: (patch: Partial<State['newTeacher']>) => void
  setNewStudent: (patch: Partial<State['newStudent']>) => void
  deleteStudent: () => void
  saveTeacher: () => void
  addStudent: () => void
  saveAttendance: (studentNames: string[]) => void
  saveMeeting: (title: string, type: string, date: string, time: string) => void
  saveAssignment: (title: string, subject: string, klass: string, dueDate: string, instructions: string) => void
  saveReminder: (type: string, message: string, targetClass: string, filter?: string) => void
  saveStudentProfile: () => void
  addFee: (studentDbId: string, amount: number, period: string, dueDate: string) => void
  toggleFeeStatus: (idx: number) => void
  addTimetableEntry: (day: string, startTime: string, endTime: string, subject: string, klass: string, room: string) => void
  addBranch: (name: string, address: string, isMain: boolean) => void
  addSubject: (name: string) => void
  linkStudentProfile: (code: string) => void
  setAdminPin: (pin: string) => void
  signOut: () => void
  loadTeachers: (t: Teacher[]) => void
  loadStudents: (s: Student[]) => void
  setAuth: (userId: string | null, role: Role, email?: string) => void
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useDashboard = create<State & Actions>((set, get) => ({
  screen: 'home', tab: 'home', role: null, origin: null,
  attClass: '', att: {}, rankSubject: 'Mathematics', ttDay: 'Mon',
  toast: '', editIndex: 0, adminUnlocked: false, pin: '', pinError: false, adminPin: '1234',
  googleEmail: '', reminderType: 'Test', plan: 'Monthly',
  newTeacher: { name: '', subject: 'Mathematics', qualification: '', experience: '' },
  newStudent: { name: '', school: '', klass: 'Class 10', batch: '10-B', branch: '', parent: '', address: '' },
  teachers: [], students: [],
  stuTeacherIndex: 0, stuRankSubject: 'Mathematics',
  stuEdit: { name: '', parentNumber: '', address: '' },
  supabaseUserId: null, authLoading: true, liveMode: false,

  branchesList: [], meetingsList: [], assignmentsList: [],
  timetableData: {}, schedule: [], rankData: {}, subjects: [],
  stuReminders: [], stuNotifications: [], stuAttendanceLog: [],
  stuFeeHistory: [], stuResults: [],
  currentStudentDbId: null, stuPendingFee: null, searchQuery: '',

  go: (screen, tab) => set({ screen, tab: (tab ?? screen) as Tab, origin: null }),
  goFrom: (screen, tab, origin) => set({ screen, tab, origin }),
  back: () => { const { origin } = get(); set({ origin: null, screen: origin === 'admin' ? 'admin' : 'home' }) },

  notify: (msg) => {
    if (toastTimer) clearTimeout(toastTimer)
    set({ toast: msg })
    toastTimer = setTimeout(() => set({ toast: '' }), 2000)
  },

  set: (partial) => set(partial),

  pressPin: (key) => {
    if (key === 'del') { set((s) => ({ pin: s.pin.slice(0, -1), pinError: false })); return }
    if (key === 'clr') { set({ pin: '', pinError: false }); return }
    const current = get().pin + key
    if (current.length < 4) { set({ pin: current, pinError: false }); return }
    if (current === get().adminPin) { get().notify('Admin unlocked'); set({ pin: '', adminUnlocked: true, screen: 'admin', pinError: false }) }
    else { set({ pin: '', pinError: true }) }
  },

  toggleAtt: (i) => set((s) => ({ att: { ...s.att, [i]: s.att[i] === 'absent' ? 'present' : 'absent' } })),

  setStudentField: (patch) => set((s) => {
    const arr = [...s.students]; arr[s.editIndex] = { ...arr[s.editIndex], ...patch }
    const updated = arr[s.editIndex]
    if (updated.dbId) {
      supabase.from('students').update({
        name: updated.name, class: updated.klass, school: updated.school,
        parent_contact: updated.parent, fee_status: updated.feeStatus,
      }).eq('id', updated.dbId).then(dbErr('update student', get().notify))
    }
    return { students: arr }
  }),

  setNewTeacher: (patch) => set((s) => ({ newTeacher: { ...s.newTeacher, ...patch } })),
  setNewStudent: (patch) => set((s) => ({ newStudent: { ...s.newStudent, ...patch } })),

  deleteStudent: () => {
    const { editIndex, students } = get()
    const student = students[editIndex]
    if (student?.dbId) {
      supabase.from('students').delete().eq('id', student.dbId).then(dbErr('delete student', get().notify))
    }
    set({ students: students.filter((_, i) => i !== editIndex), editIndex: 0 })
    get().notify('Student removed'); get().go('students', 'students')
  },

  saveTeacher: () => {
    const { newTeacher: nt, teachers, liveMode } = get()
    if (!nt.name.trim()) { get().notify('Enter a name first'); return }
    if (!nt.qualification.trim()) { get().notify('Enter qualification'); return }
    if (nt.experience && isNaN(Number(nt.experience))) { get().notify('Experience must be a number'); return }
    const t: Teacher = { name: nt.name, subject: nt.subject, qualification: nt.qualification || '—', experience: Number(nt.experience) || 0 }
    if (liveMode) {
      supabase.from('teachers').insert({ name: t.name, subject: t.subject, qualification: t.qualification, experience: t.experience })
        .select().single().then(({ data }) => {
          if (data) set((s) => ({ teachers: s.teachers.map(x => x.name === t.name && !x.dbId ? { ...x, dbId: data.id } : x) }))
        })
    }
    set({ teachers: [t, ...teachers], newTeacher: { name: '', subject: 'Mathematics', qualification: '', experience: '' } })
    get().notify('Teacher added to staff'); get().go('teachers', 'teachers')
  },

  addStudent: () => {
    const { newStudent: ns, students, liveMode, branchesList } = get()
    if (!ns.name.trim()) { get().notify('Enter student name'); return }
    if (!ns.parent.trim()) { get().notify('Enter parent contact'); return }
    if (ns.parent && !/^\+?\d[\d\s\-]{6,}$/.test(ns.parent)) { get().notify('Invalid phone number'); return }
    const code = `TUT-${Date.now().toString(36).slice(-4).toUpperCase()}${crypto.getRandomValues(new Uint16Array(1))[0].toString(36).toUpperCase()}`
    const student: Student = {
      name: ns.name, klass: `Class ${ns.batch}`, attendance: 0,
      feeStatus: 'Due', school: ns.school, parent: ns.parent, id: code,
    }
    if (liveMode) {
      const branchId = branchesList.find(b => b.name.includes(ns.branch))?.dbId
      supabase.from('students').insert({
        name: ns.name, class: student.klass, school: ns.school,
        parent_contact: ns.parent, student_code: code, fee_status: 'Due',
        address: ns.address, branch_id: branchId ?? null,
      }).select().single().then(({ data }) => {
        if (data) set((s) => ({ students: s.students.map(x => x.id === code && !x.dbId ? { ...x, dbId: data.id } : x) }))
      })
    }
    set({ students: [student, ...students], newStudent: { name: '', school: '', klass: 'Class 10', batch: '10-B', branch: '', parent: '', address: '' } })
    get().notify('Student added'); get().go('students', 'students')
  },

  saveAttendance: (studentNames) => {
    const { att, students, liveMode } = get()
    if (!liveMode) { get().notify('Attendance saved'); return }
    const records = studentNames.map((name, i) => {
      const student = students.find(s => s.name === name)
      if (!student?.dbId) return null
      return { student_id: student.dbId, date: new Date().toISOString().split('T')[0], status: att[i] === 'absent' ? 'Absent' : 'Present' }
    }).filter(Boolean)
    if (records.length) {
      supabase.from('attendance').upsert(records as any[], { onConflict: 'student_id,date' }).then(dbErr('save attendance', get().notify))
    }
    get().notify(`Attendance saved · ${studentNames.length - Object.values(att).filter(v => v === 'absent').length} present`)
  },

  saveMeeting: (title, type, date, time) => {
    if (!title.trim()) { get().notify('Enter a title'); return }
    const { liveMode, meetingsList } = get()
    const d = new Date(date || Date.now())
    const item: MeetingItem = {
      title, time, kind: type,
      day: String(d.getDate()).padStart(2, '0'),
      mon: d.toLocaleString('en', { month: 'short' }),
    }
    if (liveMode) {
      supabase.from('meetings').insert({ title, meeting_type: type, date: d.toISOString().split('T')[0], time }).then(dbErr('save meeting', get().notify))
    }
    set({ meetingsList: [item, ...meetingsList] })
    get().notify('Meeting scheduled · invites sent')
  },

  saveAssignment: (title, subject, klass, dueDate, instructions) => {
    if (!title.trim()) { get().notify('Enter a title'); return }
    const { liveMode, assignmentsList, subjects } = get()
    const d = new Date(dueDate || Date.now())
    const item: AssignmentItem = {
      title, klass, due: `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`,
      submitted: 0, total: get().students.filter(s => s.klass.includes(klass.replace('Class ', ''))).length,
    }
    if (liveMode) {
      const subjectId = subjects.find(s => s.name === subject)?.dbId
      supabase.from('assignments').insert({
        title, class: klass, due_date: d.toISOString().split('T')[0],
        instructions: instructions || null, subject_id: subjectId ?? null,
      }).then(dbErr('save assignment', get().notify))
    }
    set({ assignmentsList: [item, ...assignmentsList] })
    get().notify('Assignment created · class notified')
  },

  saveReminder: (type, message, targetClass, filter) => {
    const { liveMode, students } = get()
    const icons: Record<string, string> = { Test: '📝', Absence: '🟡', Fee: '💳', Homework: '📚' }
    const icon = icons[type] ?? '🔔'

    let targets = students.filter(s => s.dbId)
    if (filter === 'absentees') targets = targets.filter(s => s.attendance === 0)
    else if (filter === 'fees_due') targets = targets.filter(s => s.feeStatus !== 'Paid')
    else if (targetClass && targetClass !== 'all') targets = targets.filter(s => s.klass === targetClass)

    if (liveMode) {
      supabase.from('reminders').insert({ type, message, target_class: targetClass }).then(dbErr('send reminder', get().notify))
      if (targets.length) {
        const rows = targets.map(s => ({ student_id: s.dbId, title: `${type} Reminder`, detail: message, icon }))
        supabase.from('notifications').insert(rows).then(dbErr('send notifications', get().notify))
      }
    }

    const now = new Date().toISOString()
    const newNotifs = targets.map(s => ({
      icon, tint: '#eaf1fc', title: `${type} Reminder`, detail: message, when: 'Just now', dbId: now,
    }))
    set((s) => ({ stuNotifications: [...newNotifs, ...s.stuNotifications] }))
    get().notify(`${type} reminder sent to ${targets.length} students`)
  },

  saveStudentProfile: () => {
    const { stuEdit, currentStudentDbId, students, liveMode } = get()
    const idx = students.findIndex(s => s.dbId === currentStudentDbId)
    if (idx < 0) { get().notify('No student profile linked'); return }
    const updated = { ...students[idx] }
    if (stuEdit.name.trim()) updated.name = stuEdit.name.trim()
    if (stuEdit.parentNumber.trim()) updated.parent = stuEdit.parentNumber.trim()
    if (stuEdit.address.trim()) updated.address = stuEdit.address.trim()
    if (liveMode && currentStudentDbId) {
      supabase.from('students').update({
        name: updated.name, parent_contact: updated.parent, address: updated.address,
      }).eq('id', currentStudentDbId).then(dbErr('update profile', get().notify))
    }
    const arr = [...students]; arr[idx] = updated
    set({ students: arr, stuEdit: { name: '', parentNumber: '', address: '' } })
    get().notify('Profile updated'); get().go('stuProfile', 'stuProfile')
  },

  addFee: (studentDbId, amount, period, dueDate) => {
    const { liveMode, students } = get()
    if (liveMode && studentDbId) {
      supabase.from('fees').insert({ student_id: studentDbId, amount, period, due_date: dueDate, status: 'Due' }).then(dbErr('add fee', get().notify))
      supabase.from('students').update({ fee_status: 'Due' }).eq('id', studentDbId).then(dbErr('update fee status', get().notify))
    }
    const idx = students.findIndex(s => s.dbId === studentDbId)
    if (idx >= 0) {
      const arr = [...students]; arr[idx] = { ...arr[idx], feeStatus: 'Due' }
      set({ students: arr })
    }
    get().notify('Fee record added')
  },

  toggleFeeStatus: (idx) => {
    const { students, liveMode } = get()
    const student = students[idx]
    if (!student) return
    const newStatus: FeeStatus = student.feeStatus === 'Paid' ? 'Due' : 'Paid'
    const arr = [...students]; arr[idx] = { ...arr[idx], feeStatus: newStatus }
    set({ students: arr })
    if (liveMode && student.dbId) {
      supabase.from('students').update({ fee_status: newStatus }).eq('id', student.dbId).then(dbErr('toggle fee', get().notify))
      if (newStatus === 'Paid') {
        supabase.from('fees').update({ status: 'Paid', paid_date: new Date().toISOString().split('T')[0] })
          .eq('student_id', student.dbId).eq('status', 'Due').then(dbErr('mark fees paid', get().notify))
      }
    }
    get().notify(`${student.name}: ${newStatus}`)
  },

  addTimetableEntry: (day, startTime, endTime, subject, klass, room) => {
    const { timetableData, liveMode, subjects: subjectsList } = get()
    const updated = { ...timetableData }
    if (!updated[day]) updated[day] = []
    updated[day] = [...updated[day], [startTime, endTime, subject, klass, room]].sort((a, b) => a[0].localeCompare(b[0]))
    set({ timetableData: updated })
    if (liveMode) {
      const subjectId = subjectsList.find(s => s.name === subject)?.dbId
      supabase.from('timetable').insert({
        day, start_time: startTime, end_time: endTime,
        subject_id: subjectId ?? subject, class: klass, room: room || null,
      }).then(dbErr('add timetable', get().notify))
    }
    get().notify(`Period added: ${subject} on ${day}`)
  },

  addBranch: (name, address, isMain) => {
    const { branchesList, liveMode } = get()
    const branch: BranchItem = { name, address, main: isMain, students: 0, staff: 0 }
    if (liveMode) {
      supabase.from('branches').insert({ name, address, is_main: isMain }).select().single()
        .then(({ data }) => {
          if (data) set((s) => ({ branchesList: s.branchesList.map(b => b.name === name && !b.dbId ? { ...b, dbId: data.id } : b) }))
        })
    }
    set({ branchesList: [branch, ...branchesList] })
    get().notify('Branch added')
  },

  addSubject: (name) => {
    const { subjects: list, liveMode } = get()
    if (list.some(s => s.name.toLowerCase() === name.toLowerCase())) { get().notify('Subject already exists'); return }
    const item: SubjectItem = { name, dbId: '' }
    if (liveMode) {
      supabase.from('subjects').insert({ name }).select().single()
        .then(({ data }) => {
          if (data) set((s) => ({ subjects: s.subjects.map(x => x.name === name && !x.dbId ? { ...x, dbId: data.id } : x) }))
        })
    }
    set({ subjects: [...list, item] })
    get().notify(`Subject "${name}" added`)
  },

  linkStudentProfile: async (code) => {
    const { supabaseUserId, students, liveMode } = get()
    if (!supabaseUserId) { get().notify('Not signed in'); return }
    const student = students.find(s => s.id.toLowerCase() === code.trim().toLowerCase())
    if (!student) { get().notify('Invalid student code'); return }
    if (!student.dbId) { get().notify('Student record not synced'); return }
    if (liveMode) {
      await supabase.from('students').update({ profile_id: supabaseUserId }).eq('id', student.dbId)
    }
    set({ currentStudentDbId: student.dbId })
    get().notify(`Account linked to ${student.name}`)
  },

  setAdminPin: (pin) => {
    set({ adminPin: pin })
    const { supabaseUserId, liveMode } = get()
    if (liveMode && supabaseUserId) {
      supabase.from('profiles').update({ admin_pin: pin }).eq('id', supabaseUserId).then(dbErr('update PIN', get().notify))
    }
  },

  signOut: () => {
    supabase.auth.signOut()
    set({
      role: null, adminUnlocked: false, googleEmail: '', screen: 'home' as Screen, tab: 'home' as Tab,
      supabaseUserId: null, liveMode: false,
      teachers: [], students: [], branchesList: [], meetingsList: [], assignmentsList: [],
      timetableData: {}, schedule: [], rankData: {}, subjects: [],
      stuReminders: [], stuNotifications: [], stuAttendanceLog: [], stuFeeHistory: [], stuResults: [],
      currentStudentDbId: null, stuPendingFee: null,
    })
    get().notify('Signed out')
  },

  loadTeachers: (t) => set({ teachers: t }),
  loadStudents: (s) => set({ students: s, attClass: s.length ? s[0].klass : '' }),
  setAuth: (userId, role, email) => set({
    supabaseUserId: userId, role, authLoading: false,
    googleEmail: email ?? '',
    liveMode: !!userId,
    screen: role === 'student' ? 'stuHome' : 'home',
    tab: role === 'student' ? 'stuHome' as Tab : 'home',
  }),
}))

// --- Helpers ---
export const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
export const COLORS = ['#2a6fdb','#7c5cdb','#2fa36b','#e0962f','#d94f8a','#3aa0c4','#c4683a','#5a93ef']
export const GRADIENTS = ['linear-gradient(135deg,#2a6fdb,#5a93ef)','linear-gradient(135deg,#7c5cdb,#a487ef)','linear-gradient(135deg,#2fa36b,#56c48d)','linear-gradient(135deg,#e0962f,#efb45a)','linear-gradient(135deg,#d94f8a,#ec7cae)','linear-gradient(135deg,#3aa0c4,#62bcd8)']
export const av = (i: number) => COLORS[i % COLORS.length]
export const feeColor = (s: string) => s === 'Paid' ? { c: '#2fa36b', b: '#e7f5ee' } : s === 'Due' ? { c: '#e0962f', b: '#fcf3e3' } : { c: '#e8553c', b: '#fdecea' }
export const stuGrade = (pct: number) => pct >= 90 ? { g: 'A+', c: '#2fa36b', t: '#e7f5ee' } : pct >= 80 ? { g: 'A', c: '#2a6fdb', t: '#eaf1fc' } : pct >= 70 ? { g: 'B', c: '#e0962f', t: '#fcf3e3' } : { g: 'C', c: '#e8553c', t: '#fdecea' }

export const PLAN_META: Record<string, { name: string; price: string; permonth: string; save: string; renews: string }> = {
  Monthly: { name: 'Monthly', price: '₹799', permonth: 'Billed every month', save: '', renews: '24 Jul 2026' },
  'Half-yearly': { name: 'Half-yearly', price: '₹3,999', permonth: '₹666 / month', save: 'Save 17%', renews: '24 Dec 2026' },
  Yearly: { name: 'Yearly', price: '₹6,999', permonth: '₹583 / month', save: 'Save 27%', renews: '24 Jun 2027' },
}

export const PLAN_PERKS = ['Unlimited students & classes', 'Attendance, results & assignments', 'Reminders to parents & students', 'Multi-branch management']

export const REMINDER_TEMPLATES: Record<string, string> = {
  Test: 'Reminder: Mathematics Unit Test is scheduled for tomorrow. Please ensure your child revises the relevant chapters.',
  Absence: 'Your child was marked absent today. Kindly inform us of the reason or share any concerns.',
  Fee: 'Gentle reminder: the tuition fee is due. Please clear it at the earliest.',
  Homework: 'Reminder: Please submit the pending homework before the next class.',
}
