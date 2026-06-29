import { describe, it, expect, beforeEach } from 'vitest'
import { useDashboard } from '../app/store'

// These exercise the pure state transitions (no network) that decide what the
// user sees right after auth, plus the attendance-class regression fix.

const reset = () => useDashboard.setState({ attClass: '', students: [], screen: 'home', role: 'admin', staffStatus: 'approved' })

describe('setAuth landing screen', () => {
  beforeEach(reset)

  it('sends an approved head/admin to home', () => {
    useDashboard.getState().setAuth('u1', 'admin', 'a@x.com', 'approved', true)
    expect(useDashboard.getState().screen).toBe('home')
    expect(useDashboard.getState().role).toBe('admin')
  })

  it('sends an approved teacher to home', () => {
    useDashboard.getState().setAuth('u2', 'teacher', 't@x.com', 'approved', true)
    expect(useDashboard.getState().screen).toBe('home')
  })

  it('sends a pending teacher to the pending screen', () => {
    useDashboard.getState().setAuth('u3', 'teacher', 't@x.com', 'pending', true)
    expect(useDashboard.getState().screen).toBe('pending')
  })

  it('sends a rejected user to the denied screen', () => {
    useDashboard.getState().setAuth('u4', 'teacher', 't@x.com', 'rejected', true)
    expect(useDashboard.getState().screen).toBe('denied')
  })

  it('sends an unregistered signed-in user to register', () => {
    useDashboard.getState().setAuth('u5', 'student', 's@x.com', 'none', true)
    expect(useDashboard.getState().screen).toBe('register')
  })

  it('always clears the auth splash loader', () => {
    useDashboard.setState({ authLoading: true })
    useDashboard.getState().setAuth('u6', 'admin', 'a@x.com', 'approved', true)
    expect(useDashboard.getState().authLoading).toBe(false)
  })
})

describe('loadStudents', () => {
  beforeEach(reset)

  it('defaults attClass to the first student class when none is set', () => {
    useDashboard.getState().loadStudents([{ id: 'TUT-1', name: 'A', klass: 'Class 10', attendance: 0, feeStatus: 'Due', school: '', parent: '' }])
    expect(useDashboard.getState().attClass).toBe('Class 10')
  })

  it('preserves an existing attClass across a refresh (regression)', () => {
    useDashboard.setState({ attClass: 'Class 9' })
    useDashboard.getState().loadStudents([{ id: 'TUT-1', name: 'A', klass: 'Class 10', attendance: 0, feeStatus: 'Due', school: '', parent: '' }])
    expect(useDashboard.getState().attClass).toBe('Class 9')
  })

  it('leaves attClass empty when there are no students', () => {
    useDashboard.getState().loadStudents([])
    expect(useDashboard.getState().attClass).toBe('')
  })
})
