'use client'

import { useEffect } from 'react'
import { useDashboard, initials, av } from '../store'
import { ScreenHeader, ChevronRight } from './Shell'

export function AdminPanel() {
  const { back, goFrom, exitAdmin, students, teachers, googleEmail, staffList, loadStaff } = useDashboard()

  // Keep the pending-approvals badge fresh whenever the head opens the dashboard.
  useEffect(() => { loadStaff() }, [loadStaff])
  const pendingCount = staffList.filter(s => s.status === 'pending').length

  const items = [
    { icon: '🛡️', label: 'Staff access & approvals', sub: 'Approve teachers · grant head access', tint: '#eef0fc', badge: pendingCount, go: () => goFrom('staffApprovals', 'teachers', 'admin') },
    { icon: '👥', label: 'Teacher profiles', sub: 'Records shown to students', tint: '#eaf1fc', go: () => goFrom('teachers', 'teachers', 'admin') },
    { icon: '🎓', label: 'Manage students', sub: 'Enrol & edit student records', tint: '#e7f5ee', go: () => goFrom('students', 'students', 'admin') },
    { icon: '💳', label: 'Fees & collections', sub: 'Track payments & send alerts', tint: '#fdecea', go: () => goFrom('fees', 'home', 'admin') },
    { icon: '🏆', label: 'Publish rankings', sub: 'Subject-wise leaderboards', tint: '#fcf3e3', go: () => goFrom('rankings', 'home', 'admin') },
    { icon: '📅', label: 'Meetings', sub: 'Staff & parent meetings', tint: '#eaf1fc', go: () => goFrom('meetings', 'home', 'admin') },
    { icon: '🏢', label: 'Branches', sub: 'Manage all centres', tint: '#eef0fc', go: () => goFrom('branches', 'home', 'admin') },
    { icon: '📖', label: 'Subjects', sub: 'Add & manage subjects', tint: '#eaf1fc', go: () => goFrom('subjects', 'home', 'admin') },
    { icon: '💎', label: 'Subscription', sub: 'Plans & billing', tint: '#fcf3e3', go: () => goFrom('subscription', 'home', 'admin') },
  ]

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="flex items-center justify-between mb-2">
        <ScreenHeader title="Admin Dashboard" onBack={back} right={
          <button onClick={exitAdmin} className="border-none bg-[#eef1f7] text-td-muted text-xs font-bold py-[9px] px-[13px] rounded-[13px] cursor-pointer">Done</button>
        } />
      </div>

      <div className="inline-flex items-center gap-[7px] bg-[#e7f5ee] rounded-[20px] py-[7px] px-[13px] mt-1.5 mb-5">
        <span className="w-2 h-2 rounded-full bg-td-green" />
        <span className="text-xs font-bold text-td-green">Head teacher · {googleEmail?.split('@')[0] ?? 'Admin'}</span>
      </div>

      <div className="grid grid-cols-2 gap-[11px] mb-[22px]">
        {[
          { v: String(students.length), l: 'Total students' },
          { v: String(teachers.length), l: 'Teacher profiles' },
          { v: String(students.filter(s => s.feeStatus === 'Paid').length), l: 'Fees clear', c: '#2fa36b' },
          { v: String(students.filter(s => s.feeStatus !== 'Paid').length), l: 'Fees pending', c: '#e8553c' },
        ].map(s => (
          <div key={s.l} className="bg-white border border-td-border rounded-[18px] p-4">
            <div className="text-2xl font-extrabold" style={{ color: s.c || '#1a2332' }}>{s.v}</div>
            <div className="text-[11px] text-td-muted font-semibold mt-[5px]">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="text-base font-extrabold text-td-dark mb-[13px]">Manage</div>
      <div className="bg-white border border-td-border rounded-[20px] overflow-hidden">
        {items.map(m => (
          <button key={m.label} onClick={m.go} className="w-full text-left border-none bg-transparent border-b border-[#f0f2f7] p-[15px] px-[17px] flex items-center gap-3.5 cursor-pointer last:border-b-0">
            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg" style={{ background: m.tint }}>{m.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-td-dark">{m.label}</div>
              <div className="text-[11.5px] text-td-subtle mt-0.5">{m.sub}</div>
            </div>
            {!!m.badge && m.badge > 0 && <span className="text-[11px] font-extrabold text-white bg-td-red rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">{m.badge}</span>}
            <ChevronRight />
          </button>
        ))}
      </div>
    </div>
  )
}

export function StaffApprovalsScreen() {
  const { back, staffList, loadStaff, approveTeacher, rejectTeacher, grantHead, removeStaff, supabaseUserId } = useDashboard()

  useEffect(() => { loadStaff() }, [loadStaff])

  const pending = staffList.filter(s => s.status === 'pending')
  const active = staffList.filter(s => s.status === 'approved')

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Staff access" onBack={back} />

      <div className="text-[13px] text-td-muted leading-relaxed mb-5">Approve teachers so they can mark attendance and enter marks. Grant head access only to people you fully trust.</div>

      <div className="text-sm font-extrabold text-td-dark mb-3">Pending approval {pending.length > 0 && <span className="text-td-red">· {pending.length}</span>}</div>
      {pending.length === 0 ? (
        <div className="text-center text-td-muted text-[13px] py-4 bg-white border border-td-border rounded-[16px] mb-6">No one waiting</div>
      ) : (
        <div className="flex flex-col gap-2.5 mb-6">
          {pending.map((s, i) => (
            <div key={s.id} className="bg-white border border-td-border rounded-[16px] p-3.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-[13px]" style={{ background: av(i) }}>{initials(s.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-td-dark truncate">{s.name}</div>
                  <div className="text-[11.5px] text-td-muted truncate">{s.email}</div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => approveTeacher(s.id)} className="flex-1 border-none bg-td-green text-white text-[13px] font-bold py-2.5 rounded-[12px] cursor-pointer">Approve</button>
                <button onClick={() => rejectTeacher(s.id)} className="flex-1 border border-td-border bg-white text-td-muted text-[13px] font-bold py-2.5 rounded-[12px] cursor-pointer">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm font-extrabold text-td-dark mb-3">Active staff</div>
      {active.length === 0 ? (
        <div className="text-center text-td-muted text-[13px] py-4 bg-white border border-td-border rounded-[16px]">No active staff yet</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {active.map((s, i) => {
            const isHead = s.role === 'admin'
            const isSelf = s.id === supabaseUserId
            return (
              <div key={s.id} className="bg-white border border-td-border rounded-[16px] p-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-[13px]" style={{ background: av(i + 3) }}>{initials(s.name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-extrabold text-td-dark truncate">{s.name}{isSelf && <span className="text-td-muted font-semibold"> · you</span>}</div>
                    <div className="text-[11.5px] text-td-muted truncate">{s.email}</div>
                  </div>
                  <span className="text-[10.5px] font-bold py-[5px] px-2.5 rounded-[20px]" style={{ color: isHead ? '#2a6fdb' : '#2fa36b', background: isHead ? '#eaf1fc' : '#e7f5ee' }}>{isHead ? 'Head' : 'Teacher'}</span>
                </div>
                {!isHead && (
                  <div className="flex gap-2.5 mt-3">
                    <button onClick={() => grantHead(s.id)} className="flex-1 border border-td-primary bg-white text-td-primary text-[12.5px] font-bold py-2.5 rounded-[12px] cursor-pointer">
                      {s.headRequested ? 'Grant head (requested)' : 'Make head teacher'}
                    </button>
                    <button onClick={() => removeStaff(s.id)} className="border border-[#f4d8cf] bg-[#fdf3f0] text-td-red text-[12.5px] font-bold py-2.5 px-4 rounded-[12px] cursor-pointer">Remove</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
