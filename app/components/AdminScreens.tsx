'use client'

import { useState } from 'react'
import { useDashboard } from '../store'
import { ScreenHeader, ChevronRight } from './Shell'

export function AdminGate() {
  const { pin, pinError, pressPin, back, liveMode } = useDashboard()
  const dots = [0,1,2,3].map(i => ({ filled: i < pin.length }))
  const keys = ['1','2','3','4','5','6','7','8','9','clr','0','del']

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6 min-h-[560px] flex flex-col">
      <ScreenHeader title="Admin Access" onBack={back} />
      <div className="text-center mb-2">
        <div className="w-[72px] h-[72px] rounded-[22px] bg-td-dark flex items-center justify-center mx-auto mb-[18px]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </div>
        <div className="text-[17px] font-extrabold text-td-dark">Enter staff PIN</div>
        <div className="text-[13px] text-td-muted mt-1.5 leading-relaxed">This area is for teachers &amp; admins only.<br/>Students cannot access it.</div>
      </div>

      <div className="flex justify-center gap-3 mt-[26px] mb-2">
        {dots.map((d, i) => (
          <div key={i} className="w-4 h-4 rounded-full border-2" style={{ background: d.filled ? '#1a2332' : 'transparent', borderColor: d.filled ? '#1a2332' : '#c2cad8' }} />
        ))}
      </div>

      {pinError && <div className="text-center text-[12.5px] font-bold text-td-red mb-1.5">{liveMode ? 'Wrong PIN' : 'Wrong PIN — try 1234'}</div>}
      {!liveMode && <div className="text-[11.5px] text-td-subtle text-center mb-5">Demo PIN: 1234</div>}
      {liveMode && <div className="h-5 mb-5" />}

      <div className="grid grid-cols-3 gap-3 mt-auto">
        {keys.map(k => (
          <button key={k} onClick={() => pressPin(k)} className="border border-td-border rounded-2xl py-4 text-[21px] font-bold cursor-pointer" style={{ background: k === 'clr' || k === 'del' ? '#f4f6fb' : '#fff', color: k === 'clr' || k === 'del' ? '#9aa4b6' : '#1a2332' }}>
            {k === 'del' ? '⌫' : k === 'clr' ? 'C' : k}
          </button>
        ))}
      </div>
    </div>
  )
}

export function AdminPanel() {
  const { back, notify, goFrom, set, setAdminPin, liveMode, students, teachers, googleEmail } = useDashboard()
  const [showPinForm, setShowPinForm] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const handleSavePin = () => {
    if (!/^\d{4}$/.test(newPin)) { notify('PIN must be exactly 4 digits'); return }
    if (newPin !== confirmPin) { notify('PINs do not match'); return }
    setAdminPin(newPin)
    setShowPinForm(false)
    setNewPin('')
    setConfirmPin('')
    notify('Admin PIN updated')
  }

  const items = [
    { icon: '👥', label: 'Manage staff', sub: 'Add, edit & assign teachers', tint: '#eaf1fc', go: () => goFrom('teachers', 'teachers', 'admin') },
    { icon: '🎓', label: 'Manage students', sub: 'Enrol & edit student records', tint: '#e7f5ee', go: () => goFrom('students', 'students', 'admin') },
    { icon: '💳', label: 'Fees & collections', sub: 'Track payments & send alerts', tint: '#fdecea', go: () => goFrom('fees', 'home', 'admin') },
    { icon: '🏆', label: 'Publish rankings', sub: 'Subject-wise leaderboards', tint: '#fcf3e3', go: () => goFrom('rankings', 'home', 'admin') },
    { icon: '📅', label: 'Meetings', sub: 'Staff & parent meetings', tint: '#eaf1fc', go: () => goFrom('meetings', 'home', 'admin') },
    { icon: '🏢', label: 'Branches', sub: 'Manage all centres', tint: '#eef0fc', go: () => goFrom('branches', 'home', 'admin') },
    { icon: '💎', label: 'Subscription', sub: 'Plans & billing (staff only)', tint: '#fcf3e3', go: () => goFrom('subscription', 'home', 'admin') },
  ]

  const lockAdmin = () => {
    set({ adminUnlocked: false })
    notify('Admin locked')
    useDashboard.getState().go('home')
  }

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="flex items-center justify-between mb-2">
        <ScreenHeader title="Admin Dashboard" onBack={back} right={
          <button onClick={lockAdmin} className="border-none bg-[#eef1f7] text-td-muted text-xs font-bold py-[9px] px-[13px] rounded-[13px] cursor-pointer flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7689" strokeWidth="2.4" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            Lock
          </button>
        } />
      </div>

      <div className="inline-flex items-center gap-[7px] bg-[#e7f5ee] rounded-[20px] py-[7px] px-[13px] mt-1.5 mb-5">
        <span className="w-2 h-2 rounded-full bg-td-green" />
        <span className="text-xs font-bold text-td-green">Unlocked as {googleEmail?.split('@')[0] ?? 'Admin'}</span>
      </div>

      <div className="grid grid-cols-2 gap-[11px] mb-[22px]">
        {[
          { v: String(students.length), l: 'Total students' },
          { v: String(teachers.length), l: 'Staff members' },
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
            <ChevronRight />
          </button>
        ))}
      </div>

      <div className="mt-[22px]">
        <button onClick={() => setShowPinForm(p => !p)} className="w-full text-left bg-white border border-td-border rounded-[18px] p-4 cursor-pointer flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fcf3e3] shrink-0 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0962f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-td-dark">Change Admin PIN</div>
            <div className="text-[11.5px] text-td-subtle mt-0.5">Set your own 4-digit PIN</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c2cad8" strokeWidth="2.4" strokeLinecap="round"><path d={showPinForm ? 'm6 9 6 6 6-6' : 'm9 18 6-6-6-6'}/></svg>
        </button>

        {showPinForm && (
          <div className="bg-white border border-td-border border-t-0 rounded-b-[18px] -mt-[3px] p-4 flex flex-col gap-3">
            <input type="password" inputMode="numeric" maxLength={4}
              value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="New 4-digit PIN"
              className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary text-center tracking-[0.5em]"
            />
            <input type="password" inputMode="numeric" maxLength={4}
              value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Confirm PIN"
              className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary text-center tracking-[0.5em]"
            />
            <button onClick={handleSavePin} className="w-full border-none bg-td-primary text-white text-[14px] font-extrabold py-[13px] rounded-[14px] cursor-pointer">
              Save new PIN
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
