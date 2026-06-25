'use client'

import { useDashboard } from '../store'

export function LoginScreen() {
  const { googleEmail, go, set, notify } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-6 pt-10 pb-6 min-h-[700px] flex flex-col">
      <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center text-white font-extrabold text-2xl mb-[22px]" style={{ background: 'linear-gradient(135deg,#2a6fdb,#5a93ef)' }}>S</div>
      <div className="text-[26px] font-extrabold text-td-dark tracking-tight">Second School</div>
      <div className="text-sm text-td-muted mt-2 leading-relaxed">Sign in to continue. Choose how you&apos;re using the app — we&apos;ll set up the right experience for you.</div>

      {googleEmail && (
        <div className="flex items-center gap-[11px] bg-[#e7f5ee] border border-[#c5e6d4] rounded-2xl p-3 mt-6">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2fa36b" strokeWidth="2.6" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
          <div className="flex-1 text-[12.5px] text-[#1a7a4e] font-semibold">Signed in with Google as <span className="font-extrabold">{googleEmail}</span></div>
        </div>
      )}

      {!googleEmail && (
        <>
          <button onClick={() => { set({ googleEmail: 'priya.menon@gmail.com' }); notify('Signed in with Google') }} className="w-full border border-[#dfe3ea] bg-white rounded-[14px] p-3.5 mt-[30px] flex items-center justify-center gap-[11px] cursor-pointer shadow-[0_1px_2px_rgba(20,30,60,.06)]">
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1z"/><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.7H4.5C3 17.3 2.2 20.6 2.2 24s.8 6.7 2.3 9.9l7.3-5.7z"/><path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/></svg>
            <span className="text-[14.5px] font-bold text-td-text">Continue with Google</span>
          </button>
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-[#e6eaf2]" />
            <span className="text-[11.5px] text-td-subtle font-semibold">or choose your role</span>
            <div className="flex-1 h-px bg-[#e6eaf2]" />
          </div>
        </>
      )}

      <div className="text-[13px] font-bold text-td-muted mt-6 mb-[13px]">I am a…</div>
      <div className="flex flex-col gap-[13px]">
        <RoleButton label="Head Teacher" sub="Full access + Admin Dashboard" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>} bg="#1a2332" borderColor="#dbe6fa" onClick={() => { set({ role: 'admin', screen: 'home', tab: 'home' }); notify('Welcome, Head Teacher') }} />
        <RoleButton label="Teacher" sub="Attendance, results & assignments" icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2a6fdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>} bg="#eaf1fc" borderColor="#dbe6fa" onClick={() => { set({ role: 'teacher', screen: 'home', tab: 'home' }); notify('Welcome, Teacher') }} />
        <RoleButton label="Student" sub="Attendance, results & reminders" icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2fa36b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></svg>} bg="#e7f5ee" borderColor="#e6eaf2" onClick={() => { set({ role: 'student', screen: 'stuHome', tab: 'stuHome' }); notify('Welcome, Student') }} />
      </div>
      <div className="mt-auto text-[11.5px] text-td-subtle text-center leading-relaxed pt-6">Admin tools are only available to verified staff accounts.</div>
    </div>
  )
}

function RoleButton({ label, sub, icon, bg, borderColor, onClick }: { label: string; sub: string; icon: React.ReactNode; bg: string; borderColor: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left border rounded-[20px] p-[18px] flex items-center gap-[15px] cursor-pointer bg-white" style={{ borderColor }}>
      <div className="w-[52px] h-[52px] rounded-2xl shrink-0 flex items-center justify-center" style={{ background: bg }}>{icon}</div>
      <div className="flex-1">
        <div className="text-base font-extrabold text-td-dark">{label}</div>
        <div className="text-[12.5px] text-td-muted mt-[3px]">{sub}</div>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c2cad8" strokeWidth="2.4" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  )
}
