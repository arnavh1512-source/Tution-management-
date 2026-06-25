'use client'

import { useDashboard, SCHEDULE, type Screen } from '../store'

export function HomeScreen() {
  const { role, go, set } = useDashboard()
  const isAdmin = role === 'admin'
  const teacher = isAdmin
    ? { name: 'Priya Menon', branch: 'Noida Central Branch', initials: 'PM', role: 'Head Teacher' }
    : { name: 'Rahul Verma', branch: 'Noida Central Branch', initials: 'RV', role: 'Teacher' }

  const quickActions: { icon: string; label: string; tint: string; screen: Screen; tab?: string }[] = [
    { icon: '✅', label: 'Attendance', tint: '#e7f5ee', screen: 'attendance' },
    { icon: '📊', label: 'Results', tint: '#eaf1fc', screen: 'results' },
    { icon: '📚', label: 'Assignment', tint: '#fcf3e3', screen: 'assign' },
    { icon: '🔔', label: 'Reminder', tint: '#fdecea', screen: 'reminder' },
    { icon: '🗓️', label: 'Timetable', tint: '#eef0fc', screen: 'timetable', tab: 'timetable' },
    { icon: '💳', label: 'Fees', tint: '#e7f5ee', screen: 'fees' },
    { icon: '🏆', label: 'Rankings', tint: '#fcf3e3', screen: 'rankings' },
    { icon: '📅', label: 'Meetings', tint: '#eaf1fc', screen: 'meetings' },
  ]

  const openAdmin = () => {
    const s = useDashboard.getState()
    if (s.adminUnlocked) go('admin')
    else { set({ pin: '', pinError: false }); go('adminGate') }
  }

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-[46px] h-[46px] rounded-2xl flex items-center justify-center text-white font-extrabold text-[17px]" style={{ background: 'linear-gradient(135deg,#2a6fdb,#5a93ef)' }}>{teacher.initials}</div>
          <div>
            <div className="text-xs text-td-muted font-semibold">{teacher.role}</div>
            <div className="text-[17px] font-extrabold text-td-dark">{teacher.name}</div>
          </div>
        </div>
        <div className="w-[42px] h-[42px] rounded-[14px] border border-td-border bg-white flex items-center justify-center relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a2332" strokeWidth="2" strokeLinecap="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          <span className="absolute top-[9px] right-[10px] w-2 h-2 rounded-full bg-td-red border-2 border-white" />
        </div>
      </div>

      <button onClick={() => go('branches')} className="inline-flex items-center gap-[7px] bg-white border border-td-border rounded-[20px] py-[7px] px-[13px] mb-[18px] cursor-pointer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a6fdb" strokeWidth="2.2" strokeLinecap="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>
        <span className="text-[12.5px] font-semibold text-td-text">{teacher.branch}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa4b6" strokeWidth="2.4" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <div className="rounded-[18px] p-3.5 text-white" style={{ background: 'linear-gradient(135deg,#2a6fdb,#3f82ec)' }}>
          <div className="text-2xl font-extrabold leading-none">3</div>
          <div className="text-[11px] opacity-85 mt-1.5 font-semibold">Classes today</div>
        </div>
        <div className="bg-white border border-td-border rounded-[18px] p-3.5">
          <div className="text-2xl font-extrabold leading-none text-td-dark">112</div>
          <div className="text-[11px] text-td-muted mt-1.5 font-semibold">Students</div>
        </div>
      </div>

      {isAdmin && (
        <button onClick={openAdmin} className="w-full text-left border-none cursor-pointer bg-td-dark rounded-[18px] p-[15px] flex items-center gap-[13px] mb-6">
          <div className="w-[42px] h-[42px] rounded-[13px] bg-white/[.12] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-extrabold text-white">Admin Dashboard</div>
            <div className="text-xs text-[#9aa9bd] mt-0.5">Head teacher only · PIN protected</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7689" strokeWidth="2.4" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </button>
      )}

      <div className="text-base font-extrabold text-td-dark mb-[13px]">Quick actions</div>
      <div className="grid grid-cols-4 gap-[11px] mb-[26px]">
        {quickActions.map(a => (
          <button key={a.label} onClick={() => go(a.screen, (a.tab || 'home') as never)} className="border border-td-border bg-white rounded-[18px] py-3 px-1.5 cursor-pointer flex flex-col items-center gap-[7px]">
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center text-xl" style={{ background: a.tint }}>{a.icon}</div>
            <span className="text-[10.5px] font-bold text-td-text text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="text-base font-extrabold text-td-dark mb-[13px]">Today&apos;s schedule</div>
      <div className="flex flex-col gap-2.5 mb-[26px]">
        {SCHEDULE.map(c => (
          <div key={c.time} className="flex items-center gap-[13px] bg-white border border-td-border rounded-[18px] py-3.5 px-[15px]">
            <div className="text-center shrink-0 w-[52px]">
              <div className="text-sm font-extrabold text-td-primary">{c.time}</div>
              <div className="text-[10px] text-td-subtle font-semibold">{c.ampm}</div>
            </div>
            <div className="w-px h-[34px] bg-[#eef1f7]" />
            <div className="flex-1">
              <div className="text-[13.5px] font-bold text-td-dark">{c.subject}</div>
              <div className="text-xs text-td-muted mt-0.5">{c.klass} · {c.room}</div>
            </div>
            <span className="text-[11px] font-bold py-[5px] px-2.5 rounded-[20px]" style={{ color: c.statusColor, background: c.statusBg }}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
