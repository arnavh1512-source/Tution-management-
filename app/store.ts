import { create } from 'zustand'
import { supabase } from './lib/supabase'

export type Screen =
  | 'home' | 'timetable' | 'attendance' | 'results' | 'assign' | 'reminder'
  | 'students' | 'editStudent' | 'addStudent' | 'teachers' | 'addTeacher'
  | 'fees' | 'meetings' | 'rankings' | 'branches' | 'more' | 'subscription'
  | 'adminGate' | 'admin'
  | 'stuHome' | 'stuAttendance' | 'stuResults' | 'stuRanking' | 'stuTeachers'
  | 'stuTeacher' | 'stuFees' | 'stuNotif' | 'stuProfile' | 'stuEditProfile'

export type Tab = 'home' | 'timetable' | 'students' | 'teachers' | 'more'
  | 'stuHome' | 'stuResults' | 'stuRanking' | 'stuTeachers' | 'stuProfile'
export type Role = 'admin' | 'teacher' | 'student' | null
export type FeeStatus = 'Paid' | 'Due' | 'Overdue'

export interface Teacher { name: string; subject: string; experience: number; qualification: string; rating?: string; about?: string; dbId?: string }
export interface Student { name: string; klass: string; attendance: number; feeStatus: FeeStatus; school: string; parent: string; id: string; dbId?: string }

interface State {
  screen: Screen; tab: Tab; role: Role; origin: string | null
  attClass: string; att: Record<number, string>; rankSubject: string; ttDay: string
  toast: string; editIndex: number; adminUnlocked: boolean; pin: string; pinError: boolean
  googleEmail: string; reminderType: string; plan: string
  newTeacher: { name: string; subject: string; qualification: string; experience: string }
  teachers: Teacher[]; students: Student[]
  stuTeacherIndex: number; stuRankSubject: string
  stuEdit: { name: string; parentNumber: string; address: string }
  supabaseUserId: string | null; authLoading: boolean; liveMode: boolean
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
  deleteStudent: () => void
  saveTeacher: () => void
  signOut: () => void
  loadTeachers: (t: Teacher[]) => void
  loadStudents: (s: Student[]) => void
  setAuth: (userId: string | null, role: Role, email?: string) => void
}

const INITIAL_TEACHERS: Teacher[] = [
  { name: 'Priya Menon', subject: 'Mathematics', experience: 12, qualification: 'M.Sc, B.Ed', rating: '4.9', about: 'Specialises in board-exam preparation and competitive math. Known for breaking down tough problems into simple steps.' },
  { name: 'Rahul Verma', subject: 'Physics', experience: 9, qualification: 'M.Sc, IIT Delhi', rating: '4.8', about: 'Focuses on conceptual clarity and real-world applications. Runs weekly doubt-clearing sessions.' },
  { name: 'Anjali Nair', subject: 'Chemistry', experience: 7, qualification: 'M.Sc Organic', rating: '4.7', about: 'Makes reactions memorable with diagrams and lab demos. Strong track record in NEET coaching.' },
  { name: 'Suresh Iyer', subject: 'English', experience: 15, qualification: 'M.A Literature', rating: '4.9', about: 'Improves writing and comprehension through structured practice. Loves debate and storytelling.' },
  { name: 'Kavya Reddy', subject: 'Biology', experience: 6, qualification: 'M.Sc Botany', rating: '4.6', about: 'Brings biology to life with visuals and mnemonics. Patient and detail-oriented with every student.' },
]

const INITIAL_STUDENTS: Student[] = [
  { name: 'Aarav Sharma', klass: 'Class 10-B', attendance: 92, feeStatus: 'Paid', school: 'Delhi Public School', parent: '+91 98100 45xxx', id: 'TUT-1087' },
  { name: 'Diya Patel', klass: 'Class 10-B', attendance: 96, feeStatus: 'Paid', school: "St. Xavier's", parent: '+91 99100 22xxx', id: 'TUT-1088' },
  { name: 'Ishaan Gupta', klass: 'Class 10-B', attendance: 88, feeStatus: 'Due', school: 'DAV Public', parent: '+91 98730 11xxx', id: 'TUT-1089' },
  { name: 'Ananya Rao', klass: 'Class 10-A', attendance: 94, feeStatus: 'Paid', school: 'Ryan Intl.', parent: '+91 90011 88xxx', id: 'TUT-1090' },
  { name: 'Vivaan Mehta', klass: 'Class 10-A', attendance: 79, feeStatus: 'Overdue', school: 'Amity Intl.', parent: '+91 98180 77xxx', id: 'TUT-1091' },
  { name: 'Aditya Shah', klass: 'Class 9-A', attendance: 85, feeStatus: 'Paid', school: 'Cambridge', parent: '+91 99710 33xxx', id: 'TUT-1092' },
  { name: 'Riya Kapoor', klass: 'Class 9-A', attendance: 91, feeStatus: 'Due', school: 'Delhi Public School', parent: '+91 98910 55xxx', id: 'TUT-1093' },
  { name: 'Sara Khan', klass: 'Class 10-B', attendance: 83, feeStatus: 'Paid', school: 'Springdales', parent: '+91 98110 99xxx', id: 'TUT-1094' },
]

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useDashboard = create<State & Actions>((set, get) => ({
  screen: 'home', tab: 'home', role: null, origin: null,
  attClass: 'Class 10-B', att: {}, rankSubject: 'Mathematics', ttDay: 'Mon',
  toast: '', editIndex: 0, adminUnlocked: false, pin: '', pinError: false,
  googleEmail: '', reminderType: 'Test', plan: 'Monthly',
  newTeacher: { name: '', subject: 'Mathematics', qualification: '', experience: '' },
  teachers: INITIAL_TEACHERS, students: INITIAL_STUDENTS,
  stuTeacherIndex: 0, stuRankSubject: 'Mathematics',
  stuEdit: { name: 'Aarav Sharma', parentNumber: '+91 98100 45xxx', address: 'B-204, Sector 12, Noida, UP' },
  supabaseUserId: null, authLoading: true, liveMode: false,

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
    if (current === '1234') { get().notify('Admin unlocked'); set({ pin: '', adminUnlocked: true, screen: 'admin', pinError: false }) }
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
      }).eq('id', updated.dbId).then(() => {})
    }
    return { students: arr }
  }),

  setNewTeacher: (patch) => set((s) => ({ newTeacher: { ...s.newTeacher, ...patch } })),

  deleteStudent: () => {
    const { editIndex, students } = get()
    const student = students[editIndex]
    if (student?.dbId) {
      supabase.from('students').delete().eq('id', student.dbId).then(() => {})
    }
    set({ students: students.filter((_, i) => i !== editIndex), editIndex: 0 })
    get().notify('Student removed'); get().go('students', 'students')
  },

  saveTeacher: () => {
    const { newTeacher: nt, teachers, liveMode } = get()
    if (!nt.name.trim()) { get().notify('Enter a name first'); return }
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

  signOut: () => {
    supabase.auth.signOut()
    set({ role: null, adminUnlocked: false, googleEmail: '', screen: 'home' as Screen, tab: 'home' as Tab, supabaseUserId: null, liveMode: false, teachers: INITIAL_TEACHERS, students: INITIAL_STUDENTS })
    get().notify('Signed out')
  },

  loadTeachers: (t) => set({ teachers: t }),
  loadStudents: (s) => set({ students: s }),
  setAuth: (userId, role, email) => set({
    supabaseUserId: userId, role, authLoading: false,
    googleEmail: email ?? '',
    liveMode: !!userId,
    screen: role === 'student' ? 'stuHome' : 'home',
    tab: role === 'student' ? 'stuHome' as Tab : 'home',
  }),
}))

// --- Static data ---
export const ROSTERS: Record<string, string[]> = {
  'Class 10-B': ['Aarav Sharma', 'Diya Patel', 'Ishaan Gupta', 'Meera Joshi', 'Rohan Das', 'Sara Khan', 'Kabir Singh'],
  'Class 10-A': ['Ananya Rao', 'Vivaan Mehta', 'Tara Bose', 'Yash Pillai', 'Nisha Verma'],
  'Class 9-A': ['Aditya Shah', 'Riya Kapoor', 'Dev Malhotra', 'Pooja Iyer'],
}

export const SCHEDULE = [
  { time: '9:00', ampm: 'AM', subject: 'Mathematics', klass: 'Class 10-B', room: 'Room 3', status: 'Now', statusColor: '#2fa36b', statusBg: '#e7f5ee' },
  { time: '11:00', ampm: 'AM', subject: 'Mathematics', klass: 'Class 10-A', room: 'Room 1', status: 'Next', statusColor: '#2a6fdb', statusBg: '#eaf1fc' },
  { time: '2:00', ampm: 'PM', subject: 'Mathematics', klass: 'Class 9-A', room: 'Room 5', status: 'Later', statusColor: '#9aa4b6', statusBg: '#eef1f7' },
]

export const TIMETABLE_DATA: Record<string, string[][]> = {
  Mon: [['8:30','9:15','Mathematics','Class 10-B','Room 3'],['9:30','10:15','Mathematics','Class 10-A','Room 1'],['10:30','11:15','Free period','Staff room','—'],['12:00','12:45','Mathematics','Class 9-A','Room 5'],['1:30','2:15','Doubt session','Class 10-B','Room 3']],
  Tue: [['8:30','9:15','Mathematics','Class 9-A','Room 5'],['9:30','10:15','Mathematics','Class 10-B','Room 3'],['11:00','11:45','Mathematics','Class 10-A','Room 1']],
  Wed: [['8:30','9:15','Mathematics','Class 10-A','Room 1'],['9:30','10:15','Free period','Staff room','—'],['10:30','11:15','Mathematics','Class 10-B','Room 3'],['12:00','12:45','Mathematics','Class 9-A','Room 5']],
  Thu: [['8:30','9:15','Mathematics','Class 10-B','Room 3'],['9:30','10:15','Mathematics','Class 9-A','Room 5'],['11:00','11:45','Test - Unit 4','Class 10-A','Hall']],
  Fri: [['8:30','9:15','Mathematics','Class 10-A','Room 1'],['9:30','10:15','Mathematics','Class 10-B','Room 3'],['1:30','2:15','Doubt session','All classes','Room 3']],
  Sat: [['9:00','10:00','Staff meeting','Faculty','Conf room'],['10:30','11:30','Mathematics','Class 10-B','Room 3']],
}

export const RANK_DATA: Record<string, [string, number][]> = {
  Mathematics: [['Ishaan Gupta',98],['Aarav Sharma',94],['Diya Patel',92],['Rohan Das',89],['Meera Joshi',87],['Sara Khan',83]],
  Physics: [['Aarav Sharma',96],['Diya Patel',93],['Ishaan Gupta',91],['Sara Khan',88],['Rohan Das',86],['Meera Joshi',84]],
  Chemistry: [['Diya Patel',95],['Meera Joshi',90],['Aarav Sharma',88],['Ishaan Gupta',86],['Kabir Singh',83]],
  English: [['Sara Khan',97],['Aarav Sharma',93],['Meera Joshi',91],['Rohan Das',88],['Diya Patel',85]],
  Biology: [['Meera Joshi',94],['Diya Patel',92],['Aarav Sharma',89],['Kabir Singh',86],['Ishaan Gupta',84]],
}

export const ASSIGNMENTS = [
  { title: 'Algebra worksheet 4', due: '24 Jun', klass: 'Class 10-B', submitted: 22, total: 38 },
  { title: 'Trigonometry problems', due: '26 Jun', klass: 'Class 10-A', submitted: 15, total: 34 },
  { title: 'Mensuration practice', due: '28 Jun', klass: 'Class 9-A', submitted: 8, total: 30 },
]

export const MEETINGS = [
  { day: '28', mon: 'Jun', title: 'Parent-teacher meeting', time: '11:00 AM', kind: 'Class 10-B parents' },
  { day: '30', mon: 'Jun', title: 'Monthly staff meeting', time: '4:00 PM', kind: 'All faculty' },
  { day: '05', mon: 'Jul', title: 'Result review', time: '10:00 AM', kind: 'Math dept.' },
]

export const BRANCHES = [
  { name: 'Noida Central Branch', address: 'Sector 12, Noida, UP', students: 112, staff: 9, main: true },
  { name: 'Sector 18 Branch', address: 'Atta Market, Noida, UP', students: 74, staff: 6, main: false },
  { name: 'Indirapuram Branch', address: 'Shakti Khand, Ghaziabad', students: 53, staff: 5, main: false },
]

export const REMINDER_MSGS: Record<string, string> = {
  Test: 'Reminder: Mathematics Unit Test 4 is scheduled for tomorrow at 9:00 AM. Please ensure your child revises chapters 4–5.',
  Absence: 'Your child was marked absent today. Kindly inform us of the reason or share any concerns.',
  Fee: 'Gentle reminder: the tuition fee of ₹4,500 is due by 30 Jun. Please clear it at the earliest.',
  Homework: 'Reminder: Physics Ch-7 numericals must be submitted before the next class.',
}

export const PLAN_META: Record<string, { name: string; price: string; permonth: string; save: string; renews: string }> = {
  Monthly: { name: 'Monthly', price: '₹799', permonth: 'Billed every month', save: '', renews: '24 Jul 2026' },
  'Half-yearly': { name: 'Half-yearly', price: '₹3,999', permonth: '₹666 / month', save: 'Save 17%', renews: '24 Dec 2026' },
  Yearly: { name: 'Yearly', price: '₹6,999', permonth: '₹583 / month', save: 'Save 27%', renews: '24 Jun 2027' },
}

export const PLAN_PERKS = ['Unlimited students & classes', 'Attendance, results & assignments', 'Reminders to parents & students', 'Multi-branch management']

// --- Student-specific data ---
export const STU_REMINDERS = [
  { icon: '📝', tint: '#eaf1fc', title: 'Maths test tomorrow', detail: 'Algebra · Chapters 4–5 · 9:00 AM', when: '1d' },
  { icon: '📚', tint: '#fcf3e3', title: 'Physics homework due', detail: 'Submit Ch-7 numericals before class', when: '2d' },
  { icon: '🔔', tint: '#fdecea', title: 'Fee payment reminder', detail: '₹4,500 due by 30 Jun', when: '7d' },
  { icon: '📅', tint: '#eef3fc', title: 'Parent-teacher meeting', detail: 'Sat 28 Jun, 11:00 AM at branch', when: '5d' },
]

export const STU_NOTIFICATIONS = [
  { icon: '📝', tint: '#eaf1fc', title: 'Test reminder', detail: 'Mathematics Unit Test 4 scheduled tomorrow at 9:00 AM.', when: 'Today, 8:00 AM' },
  { icon: '📚', tint: '#fcf3e3', title: 'Assignment submission', detail: 'Physics Ch-7 numericals due before next class.', when: 'Yesterday' },
  { icon: '🟡', tint: '#fdecea', title: 'Absence recorded', detail: 'You were marked absent on 20 Jun. Tap to inform reason.', when: '20 Jun' },
  { icon: '📅', tint: '#eef3fc', title: 'Staff / PT meeting', detail: 'Parent-teacher meeting on Sat 28 Jun, 11:00 AM.', when: '18 Jun' },
  { icon: '🏆', tint: '#e7f5ee', title: 'Rank improved', detail: 'You moved up to rank #2 in your class. Keep it up!', when: '12 Jun' },
]

export const STU_ATTENDANCE_LOG = [
  { day: 'Monday', date: '23 Jun 2026', status: 'Present', icon: '✅', tint: '#e7f5ee', color: '#2fa36b' },
  { day: 'Saturday', date: '21 Jun 2026', status: 'Present', icon: '✅', tint: '#e7f5ee', color: '#2fa36b' },
  { day: 'Friday', date: '20 Jun 2026', status: 'Absent', icon: '❌', tint: '#fdecea', color: '#e8553c' },
  { day: 'Thursday', date: '19 Jun 2026', status: 'Present', icon: '✅', tint: '#e7f5ee', color: '#2fa36b' },
  { day: 'Wednesday', date: '18 Jun 2026', status: 'Leave', icon: '🟡', tint: '#fcf3e3', color: '#e0962f' },
  { day: 'Tuesday', date: '17 Jun 2026', status: 'Present', icon: '✅', tint: '#e7f5ee', color: '#2fa36b' },
]

export const STU_FEE_HISTORY = [
  { period: 'June 2026', date: '02 Jun', amount: '₹4,500' },
  { period: 'May 2026', date: '01 May', amount: '₹4,500' },
  { period: 'April 2026', date: '03 Apr', amount: '₹4,500' },
  { period: 'March 2026', date: '02 Mar', amount: '₹4,500' },
]

export const stuGrade = (pct: number) => pct >= 90 ? { g: 'A+', c: '#2fa36b', t: '#e7f5ee' } : pct >= 80 ? { g: 'A', c: '#2a6fdb', t: '#eaf1fc' } : pct >= 70 ? { g: 'B', c: '#e0962f', t: '#fcf3e3' } : { g: 'C', c: '#e8553c', t: '#fdecea' }

export const STU_RESULTS = [
  { subject: 'Mathematics', test: 'Unit Test 3', date: '12 Jun', marks: 47, total: 50 },
  { subject: 'Physics', test: 'Unit Test 3', date: '10 Jun', marks: 42, total: 50 },
  { subject: 'Chemistry', test: 'Unit Test 3', date: '08 Jun', marks: 38, total: 50 },
  { subject: 'English', test: 'Unit Test 3', date: '06 Jun', marks: 44, total: 50 },
  { subject: 'Biology', test: 'Unit Test 3', date: '04 Jun', marks: 40, total: 50 },
]

export const STU_PROFILE_FIELDS = [
  { icon: '🏫', label: 'School', value: 'Delhi Public School', locked: true },
  { icon: '🎓', label: 'Standard', value: 'Class 10 - B', locked: true },
  { icon: '📊', label: 'Performance', value: 'A+ · Top 5% of class', locked: true },
  { icon: '📍', label: 'Address', locked: false },
  { icon: '📞', label: 'Parent contact', locked: false },
  { icon: '🏢', label: 'Branch', value: 'Noida Central Branch', locked: true },
  { icon: '🆔', label: 'Student ID', value: 'TUT-2024-1087', locked: true },
]

// --- Helpers ---
export const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
export const COLORS = ['#2a6fdb','#7c5cdb','#2fa36b','#e0962f','#d94f8a','#3aa0c4','#c4683a','#5a93ef']
export const GRADIENTS = ['linear-gradient(135deg,#2a6fdb,#5a93ef)','linear-gradient(135deg,#7c5cdb,#a487ef)','linear-gradient(135deg,#2fa36b,#56c48d)','linear-gradient(135deg,#e0962f,#efb45a)','linear-gradient(135deg,#d94f8a,#ec7cae)','linear-gradient(135deg,#3aa0c4,#62bcd8)']
export const av = (i: number) => COLORS[i % COLORS.length]
export const feeColor = (s: string) => s === 'Paid' ? { c: '#2fa36b', b: '#e7f5ee' } : s === 'Due' ? { c: '#e0962f', b: '#fcf3e3' } : { c: '#e8553c', b: '#fdecea' }
