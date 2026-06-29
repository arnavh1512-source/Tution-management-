import { describe, it, expect } from 'vitest'
import { genStudentCode, mapSnapshot, initials, feeColor, stuGrade } from '../app/store'

describe('genStudentCode', () => {
  it('has the TUT- prefix and 8 code characters', () => {
    expect(genStudentCode()).toMatch(/^TUT-[A-Z2-9]{8}$/)
  })

  it('never uses confusable characters (O, 0, I, 1, L)', () => {
    for (let i = 0; i < 100; i++) {
      expect(genStudentCode().slice(4)).not.toMatch(/[O0I1L]/)
    }
  })

  it('is effectively unique across many draws', () => {
    const codes = new Set(Array.from({ length: 2000 }, () => genStudentCode()))
    expect(codes.size).toBe(2000)
  })
})

describe('initials', () => {
  it('takes first letters, max two, uppercased', () => {
    expect(initials('arjun mehta')).toBe('AM')
    expect(initials('ravi')).toBe('R')
    expect(initials('a b c')).toBe('AB')
  })
})

describe('feeColor', () => {
  it('maps each fee status to its colour', () => {
    expect(feeColor('Paid').c).toBe('#2fa36b')
    expect(feeColor('Due').c).toBe('#e0962f')
    expect(feeColor('Overdue').c).toBe('#e8553c')
  })
})

describe('stuGrade', () => {
  it('grades by percentage band', () => {
    expect(stuGrade(95).g).toBe('A+')
    expect(stuGrade(85).g).toBe('A')
    expect(stuGrade(72).g).toBe('B')
    expect(stuGrade(50).g).toBe('C')
  })
})

describe('mapSnapshot', () => {
  const snap = {
    student: { dbId: 'd1', name: 'Arjun', klass: 'Class 10-B', school: 'DPS', code: 'TUT-ABCDEFGH', parent: '+91 90000', address: 'X', feeStatus: 'Due' },
    attendance: [
      { date: '2026-06-01', status: 'Present' },
      { date: '2026-06-02', status: 'Absent' },
    ],
    results: [{ subject: 'Mathematics', test: 'Unit 1', date: '2026-06-01', marks: 18, total: 20 }],
    fees: [
      { period: 'June 2026', amount: 5000, status: 'Paid', dueDate: '2026-06-01', paidDate: '2026-06-02' },
      { period: 'July 2026', amount: 5000, status: 'Due', dueDate: '2026-07-01', paidDate: null },
    ],
    notifications: [{ title: 'Test Reminder', detail: 'Tomorrow', icon: '📝', createdAt: new Date().toISOString() }],
    teachers: [{ name: 'Ravi', subject: 'Mathematics', experience: 5, qualification: 'M.Sc', rating: 4.5, about: 'x' }],
    rankings: { Mathematics: [['Arjun', 90], ['Neha', 80]] },
  }
  const r = mapSnapshot(snap)

  it('builds one student with a computed attendance %', () => {
    expect(r.students?.length).toBe(1)
    expect(r.students?.[0].name).toBe('Arjun')
    expect(r.students?.[0].attendance).toBe(50) // 1 present of 2
    expect(r.currentStudentDbId).toBe('d1')
  })

  it('maps results, paid-only fee history, and the pending fee', () => {
    expect(r.stuResults?.[0].marks).toBe(18)
    expect(r.stuFeeHistory?.length).toBe(1)
    expect(r.stuPendingFee?.period).toBe('July 2026')
  })

  it('passes through rankings and stringifies teacher rating', () => {
    expect(r.rankData?.Mathematics?.[0]?.[0]).toBe('Arjun')
    expect(r.teachers?.[0].rating).toBe('4.5')
  })

  it('handles a sparse snapshot without throwing', () => {
    const empty = mapSnapshot({ student: { dbId: 'd', code: 'c' } })
    expect(empty.stuResults).toEqual([])
    expect(empty.stuPendingFee).toBeNull()
    expect(empty.students?.[0].attendance).toBe(0)
  })

  it('groups the class timetable by day', () => {
    const r = mapSnapshot({
      student: { dbId: 'd', code: 'c', klass: 'Class 10-B' },
      timetable: [
        { day: 'Mon', start: '09:00', end: '10:00', subject: 'Mathematics', room: 'R1' },
        { day: 'Mon', start: '10:00', end: '11:00', subject: 'Physics', room: 'R2' },
        { day: 'Tue', start: '09:00', end: '10:00', subject: 'English', room: 'R1' },
      ],
    })
    expect(r.timetableData?.Mon?.length).toBe(2)
    expect(r.timetableData?.Tue?.length).toBe(1)
    expect(r.timetableData?.Mon?.[0]?.[2]).toBe('Mathematics')
  })
})
