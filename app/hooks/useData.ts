'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type {
  Teacher, Student, Attendance, Fee, TimetableEntry,
  Result, Test, Assignment, Meeting, Reminder, Notification, Branch,
} from '../lib/database.types'

type Table = 'teachers' | 'students' | 'attendance' | 'fees' | 'timetable'
  | 'results' | 'tests' | 'assignments' | 'meetings' | 'reminders'
  | 'notifications' | 'branches'

function useTable<T>(table: Table, filters?: Record<string, string>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from(table).select('*')
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        q = q.eq(k, v)
      }
    }
    const { data: rows } = await q.order('created_at', { ascending: false })
    setData((rows ?? []) as T[])
    setLoading(false)
  }, [table, JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, refetch: fetch }
}

export const useTeachers = (filters?: Record<string, string>) =>
  useTable<Teacher>('teachers', filters)

export const useStudents = (filters?: Record<string, string>) =>
  useTable<Student>('students', filters)

export const useBranches = () =>
  useTable<Branch>('branches')

export const useFees = (filters?: Record<string, string>) =>
  useTable<Fee>('fees', filters)

export const useTimetable = (filters?: Record<string, string>) =>
  useTable<TimetableEntry>('timetable', filters)

export const useAssignments = (filters?: Record<string, string>) =>
  useTable<Assignment>('assignments', filters)

export const useMeetings = (filters?: Record<string, string>) =>
  useTable<Meeting>('meetings', filters)

export const useReminders = () =>
  useTable<Reminder>('reminders')

export const useNotifications = (studentId?: string) =>
  useTable<Notification>('notifications', studentId ? { student_id: studentId } : undefined)

export function useAttendance(studentId?: string, date?: string) {
  const filters: Record<string, string> = {}
  if (studentId) filters.student_id = studentId
  if (date) filters.date = date
  return useTable<Attendance>('attendance', Object.keys(filters).length ? filters : undefined)
}

export function useResults(studentId?: string) {
  return useTable<Result>('results', studentId ? { student_id: studentId } : undefined)
}

export function useTests(filters?: Record<string, string>) {
  return useTable<Test>('tests', filters)
}

export async function addStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
  return supabase.from('students').insert(student).select().single()
}

export async function updateStudent(id: string, updates: Partial<Student>) {
  return supabase.from('students').update(updates).eq('id', id).select().single()
}

export async function deleteStudent(id: string) {
  return supabase.from('students').delete().eq('id', id)
}

export async function addTeacher(teacher: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) {
  return supabase.from('teachers').insert(teacher).select().single()
}

export async function updateTeacher(id: string, updates: Partial<Teacher>) {
  return supabase.from('teachers').update(updates).eq('id', id).select().single()
}

export async function markAttendance(records: Omit<Attendance, 'id' | 'created_at'>[]) {
  return supabase.from('attendance').upsert(records, { onConflict: 'student_id,date' })
}

export async function saveResult(result: Omit<Result, 'id' | 'created_at'>) {
  return supabase.from('results').upsert(result, { onConflict: 'test_id,student_id' })
}

export async function createTest(test: Omit<Test, 'id' | 'created_at'>) {
  return supabase.from('tests').insert(test).select().single()
}

export async function addFee(fee: Omit<Fee, 'id' | 'created_at'>) {
  return supabase.from('fees').insert(fee).select().single()
}

export async function updateFee(id: string, updates: Partial<Fee>) {
  return supabase.from('fees').update(updates).eq('id', id)
}

export async function createAssignment(a: Omit<Assignment, 'id' | 'created_at'>) {
  return supabase.from('assignments').insert(a).select().single()
}

export async function createMeeting(m: Omit<Meeting, 'id' | 'created_at'>) {
  return supabase.from('meetings').insert(m).select().single()
}

export async function sendReminder(r: Omit<Reminder, 'id' | 'created_at'>) {
  return supabase.from('reminders').insert(r).select().single()
}

export async function createNotification(n: Omit<Notification, 'id' | 'created_at'>) {
  return supabase.from('notifications').insert(n).select().single()
}

export async function markNotificationRead(id: string) {
  return supabase.from('notifications').update({ read: true }).eq('id', id)
}
