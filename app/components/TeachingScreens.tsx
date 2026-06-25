'use client'

import { useDashboard, ROSTERS, TIMETABLE_DATA, ASSIGNMENTS, REMINDER_MSGS, initials, av } from '../store'
import { ScreenHeader, PrimaryButton } from './Shell'

export function TimetableScreen() {
  const { ttDay, back, set, notify } = useDashboard()
  const days = [{ s: 'Mon', d: '23' },{ s: 'Tue', d: '24' },{ s: 'Wed', d: '25' },{ s: 'Thu', d: '26' },{ s: 'Fri', d: '27' },{ s: 'Sat', d: '28' }]
  const dayNames: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' }
  const periods = TIMETABLE_DATA[ttDay] || []

  const periodStyle = (p: string[]) => {
    const free = p[2] === 'Free period'
    const special = p[2].includes('Test') || p[2].includes('meeting') || p[2].includes('Doubt')
    return {
      dot: free ? '#c2cad8' : special ? '#e0962f' : '#2a6fdb',
      bg: free ? '#f4f6fb' : '#fff',
      border: free ? '#e6eaf2' : special ? '#f0e2c4' : '#dbe6fa',
      titleColor: free ? '#9aa4b6' : '#1a2332',
      tag: free ? 'Free' : special ? 'Special' : 'Class',
      pillColor: free ? '#9aa4b6' : special ? '#e0962f' : '#2a6fdb',
      pillBg: free ? '#eef1f7' : special ? '#fcf3e3' : '#eaf1fc',
    }
  }

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Timetable" onBack={back} right={
        <button onClick={() => notify('Timetable editing — coming soon')} className="border-none bg-[#eaf1fc] text-td-primary text-[12.5px] font-bold py-[9px] px-3.5 rounded-[13px] cursor-pointer">Edit</button>
      } />

      <div className="flex gap-2 overflow-x-auto mb-[18px] scrollbar-hide">
        {days.map(d => {
          const active = d.s === ttDay
          return (
            <button key={d.s} onClick={() => set({ ttDay: d.s })} className="shrink-0 min-w-[48px] border rounded-[14px] py-[9px] px-1.5 cursor-pointer text-center" style={{ background: active ? '#2a6fdb' : '#fff', borderColor: active ? '#2a6fdb' : '#e6eaf2' }}>
              <div className="text-[11px] font-bold" style={{ color: active ? '#fff' : '#3a4456' }}>{d.s}</div>
              <div className="text-sm font-extrabold mt-0.5" style={{ color: active ? '#fff' : '#3a4456' }}>{d.d}</div>
            </button>
          )
        })}
      </div>

      <div className="text-[13px] text-td-muted font-semibold mb-3.5">{dayNames[ttDay]} · {periods.length} periods</div>

      <div className="flex flex-col">
        {periods.map((p, i) => {
          const s = periodStyle(p)
          return (
            <div key={i} className="flex gap-[13px] items-stretch">
              <div className="shrink-0 w-[58px] text-right pt-1">
                <div className="text-[12.5px] font-extrabold text-td-dark">{p[0]}</div>
                <div className="text-[10.5px] text-td-subtle font-semibold">{p[1]}</div>
              </div>
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-[11px] h-[11px] rounded-full border-2 border-white" style={{ background: s.dot, boxShadow: `0 0 0 2px ${s.dot}` }} />
                <div className="flex-1 w-0.5 bg-td-border" />
              </div>
              <div className="flex-1 pb-3.5">
                <div className="rounded-2xl p-[13px] px-[15px] border" style={{ background: s.bg, borderColor: s.border }}>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-extrabold" style={{ color: s.titleColor }}>{p[2]}</div>
                    <span className="text-[10.5px] font-bold py-1 px-[9px] rounded-[20px]" style={{ color: s.pillColor, background: s.pillBg }}>{s.tag}</span>
                  </div>
                  <div className="text-xs text-td-muted mt-1">{p[3]} · {p[4]}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AttendanceScreen() {
  const { attClass, att, back, set, toggleAtt, notify } = useDashboard()
  const roster = ROSTERS[attClass] || []
  const absentCount = roster.reduce((a, _, i) => a + (att[i] === 'absent' ? 1 : 0), 0)
  const presentCount = roster.length - absentCount

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="flex items-center gap-3.5 mb-[18px]">
        <button onClick={back} className="w-[42px] h-[42px] rounded-[14px] border border-td-border bg-white flex items-center justify-center cursor-pointer shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a2332" strokeWidth="2.4" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <div className="text-xl font-extrabold text-td-dark">Mark Attendance</div>
          <div className="text-xs text-td-muted">Mon, 23 Jun 2026</div>
        </div>
      </div>

      <div className="flex gap-[9px] overflow-x-auto mb-4 scrollbar-hide">
        {Object.keys(ROSTERS).map(name => {
          const active = name === attClass
          return (
            <button key={name} onClick={() => set({ attClass: name, att: {} })} className="shrink-0 text-[13px] font-bold py-[9px] px-4 rounded-[20px] cursor-pointer border" style={{ background: active ? '#2a6fdb' : '#fff', color: active ? '#fff' : '#3a4456', borderColor: active ? '#2a6fdb' : '#e6eaf2' }}>{name}</button>
          )
        })}
      </div>

      <div className="flex gap-2.5 mb-4">
        <div className="flex-1 bg-[#e7f5ee] rounded-[14px] p-3 text-center">
          <div className="text-[22px] font-extrabold text-td-green">{presentCount}</div>
          <div className="text-[11px] text-[#5a8a72] font-semibold">Present</div>
        </div>
        <div className="flex-1 bg-[#fdecea] rounded-[14px] p-3 text-center">
          <div className="text-[22px] font-extrabold text-td-red">{absentCount}</div>
          <div className="text-[11px] text-[#a35545] font-semibold">Absent</div>
        </div>
      </div>

      <div className="text-xs text-td-subtle font-semibold mb-2.5">Tap a student to toggle present / absent</div>
      <div className="flex flex-col gap-[9px] mb-5">
        {roster.map((name, i) => {
          const absent = att[i] === 'absent'
          return (
            <button key={name} onClick={() => toggleAtt(i)} className="text-left border rounded-2xl p-3 px-3.5 flex items-center gap-[13px] cursor-pointer" style={{ background: absent ? '#fdecea' : '#fff', borderColor: absent ? '#f4c4bc' : '#e6eaf2' }}>
              <div className="w-[38px] h-[38px] rounded-[11px] shrink-0 flex items-center justify-center text-white font-bold text-[13px]" style={{ background: av(i) }}>{initials(name)}</div>
              <div className="flex-1 text-[13.5px] font-bold text-td-dark">{name}</div>
              <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: absent ? '#e8553c' : '#2fa36b' }}>
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: absent ? '#e8553c' : '#2fa36b' }} />
                {absent ? 'Absent' : 'Present'}
              </span>
            </button>
          )
        })}
      </div>
      <PrimaryButton onClick={() => notify(`Attendance saved · ${presentCount} present, ${absentCount} absent`)}>Save attendance</PrimaryButton>
    </div>
  )
}

export function ResultsScreen() {
  const { back, notify } = useDashboard()
  const roster = ROSTERS['Class 10-B'] || []

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Enter Results" onBack={back} />

      <div className="grid grid-cols-2 gap-[11px] mb-[13px]">
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Class</label><select className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none"><option>Class 10-B</option><option>Class 10-A</option><option>Class 9-A</option></select></div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Subject</label><select className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none"><option>Mathematics</option><option>Physics</option><option>Chemistry</option></select></div>
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-[11px] mb-[18px]">
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Test name</label><input defaultValue="Unit Test 4" className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] text-td-dark outline-none focus:border-td-primary" /></div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Max</label><input defaultValue="50" className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] text-td-dark outline-none focus:border-td-primary" /></div>
      </div>

      <div className="text-sm font-extrabold text-td-dark mb-3">Enter marks</div>
      <div className="flex flex-col gap-[9px] mb-5">
        {roster.map((name, i) => (
          <div key={name} className="border border-td-border bg-white rounded-2xl p-[11px] px-3.5 flex items-center gap-[13px]">
            <div className="w-9 h-9 rounded-[11px] shrink-0 flex items-center justify-center text-white font-bold text-[13px]" style={{ background: av(i) }}>{initials(name)}</div>
            <div className="flex-1 text-[13.5px] font-bold text-td-dark">{name}</div>
            <input placeholder="—" className="w-[62px] text-center border border-td-border rounded-[11px] py-[9px] px-1.5 text-sm font-bold text-td-dark outline-none focus:border-td-primary" />
            <span className="text-[13px] text-td-subtle font-semibold">/50</span>
          </div>
        ))}
      </div>
      <PrimaryButton onClick={() => notify('Results published & parents notified')}>Publish results</PrimaryButton>
    </div>
  )
}

export function AssignmentsScreen() {
  const { back, notify } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="New Assignment" onBack={back} />

      <div className="bg-white border border-td-border rounded-[20px] p-[17px] mb-[22px] flex flex-col gap-3.5">
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Title</label><input placeholder="e.g. Algebra worksheet 5" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div className="grid grid-cols-2 gap-[11px]">
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Subject</label><select className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none"><option>Mathematics</option><option>Physics</option></select></div>
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Class</label><select className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none"><option>Class 10-B</option><option>Class 10-A</option></select></div>
        </div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Due date</label><input defaultValue="27 Jun 2026" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Instructions</label><textarea rows={3} placeholder="Describe the task..." className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none resize-none focus:border-td-primary" /></div>
        <PrimaryButton onClick={() => notify('Assignment created · class notified')}>Create &amp; notify class</PrimaryButton>
      </div>

      <div className="text-[15px] font-extrabold text-td-dark mb-3">Active assignments</div>
      <div className="flex flex-col gap-2.5">
        {ASSIGNMENTS.map(a => (
          <div key={a.title} className="bg-white border border-td-border rounded-2xl p-3.5">
            <div className="flex justify-between items-start">
              <div className="text-[13.5px] font-bold text-td-dark">{a.title}</div>
              <span className="text-[11px] font-bold text-td-amber bg-[#fcf3e3] py-1 px-[9px] rounded-[20px] whitespace-nowrap">Due {a.due}</span>
            </div>
            <div className="text-xs text-td-muted mt-[5px]">{a.klass} · {a.submitted}/{a.total} submitted</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RemindersScreen() {
  const { reminderType, back, set, notify } = useDashboard()
  const types = [
    { key: 'Test', label: 'Test', icon: '📝' },
    { key: 'Absence', label: 'Absence', icon: '🟡' },
    { key: 'Fee', label: 'Fee', icon: '💳' },
    { key: 'Homework', label: 'Homework', icon: '📚' },
  ]

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Send Reminder" onBack={back} />

      <label className="text-xs font-bold text-td-muted mb-2.5 block">Type</label>
      <div className="grid grid-cols-2 gap-2.5 mb-[18px]">
        {types.map(r => {
          const active = r.key === reminderType
          return (
            <button key={r.key} onClick={() => set({ reminderType: r.key })} className="border rounded-2xl p-3.5 cursor-pointer flex items-center gap-[11px]" style={{ background: active ? '#eaf1fc' : '#fff', borderColor: active ? '#2a6fdb' : '#e6eaf2' }}>
              <span className="text-xl">{r.icon}</span>
              <span className="text-[13.5px] font-bold" style={{ color: active ? '#2a6fdb' : '#3a4456' }}>{r.label}</span>
            </button>
          )
        })}
      </div>

      <label className="text-xs font-bold text-td-muted mb-[7px] block">Send to</label>
      <select className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none mb-4">
        <option>Class 10-B (38 students)</option><option>All my classes</option><option>Absentees only</option><option>Students with fees due</option>
      </select>

      <label className="text-xs font-bold text-td-muted mb-[7px] block">Message</label>
      <textarea rows={4} defaultValue={REMINDER_MSGS[reminderType]} className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none resize-none mb-[18px] focus:border-td-primary" />

      <PrimaryButton onClick={() => notify(`${reminderType} reminder sent`)}>Send to parents &amp; students</PrimaryButton>
    </div>
  )
}
