'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useDashboard, type Teacher, type Student, type FeeStatus } from '../store'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, loadTeachers, loadStudents, set } = useDashboard()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuth(session.user.id, session.user.email ?? '')
      } else {
        set({ authLoading: false })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        handleAuth(session.user.id, session.user.email ?? '')
      } else {
        set({ authLoading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleAuth(userId: string, email: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, admin_pin')
      .eq('id', userId)
      .single()

    const role = (profile?.role as 'admin' | 'teacher' | 'student') ?? 'student'
    if (profile?.admin_pin) set({ adminPin: profile.admin_pin as string })
    setAuth(userId, role, email)
    await fetchData()
  }

  async function fetchData() {
    const [{ data: teachers }, { data: students }] = await Promise.all([
      supabase.from('teachers').select('*').order('created_at', { ascending: false }),
      supabase.from('students').select('*').order('created_at', { ascending: false }),
    ])

    if (teachers?.length) {
      loadTeachers(teachers.map(mapTeacher))
    }
    if (students?.length) {
      loadStudents(students.map(mapStudent))
    }
  }

  return <>{children}</>
}

function mapTeacher(t: Record<string, unknown>): Teacher {
  return {
    name: t.name as string,
    subject: t.subject as string,
    experience: (t.experience as number) ?? 0,
    qualification: (t.qualification as string) ?? '—',
    rating: t.rating != null ? String(t.rating) : undefined,
    about: (t.about as string) ?? undefined,
    dbId: t.id as string,
  }
}

function mapStudent(s: Record<string, unknown>): Student {
  return {
    name: s.name as string,
    klass: (s.class as string) ?? '',
    attendance: 0,
    feeStatus: ((s.fee_status as string) ?? 'Due') as FeeStatus,
    school: (s.school as string) ?? '',
    parent: (s.parent_contact as string) ?? '',
    id: (s.student_code as string) ?? '',
    dbId: s.id as string,
  }
}
