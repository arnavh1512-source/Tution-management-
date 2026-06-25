'use client'

import { useDashboard, MEETINGS, BRANCHES, RANK_DATA, PLAN_META, PLAN_PERKS, initials, av, feeColor, type Screen } from '../store'
import { ScreenHeader, PrimaryButton, ChevronRight } from './Shell'

export function FeesScreen() {
  const { students, back, notify } = useDashboard()
  const rows = [...students.filter(d => d.feeStatus !== 'Paid'), ...students.filter(d => d.feeStatus === 'Paid')]

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Fees" onBack={back} />

      <div className="flex gap-2.5 mb-[18px]">
        <div className="flex-1 bg-[#e7f5ee] rounded-2xl p-3.5"><div className="text-[22px] font-extrabold text-td-green">₹1.2L</div><div className="text-[11px] text-[#5a8a72] font-semibold mt-[3px]">Collected</div></div>
        <div className="flex-1 bg-[#fdecea] rounded-2xl p-3.5"><div className="text-[22px] font-extrabold text-td-red">₹27K</div><div className="text-[11px] text-[#a35545] font-semibold mt-[3px]">Pending</div></div>
      </div>

      <button onClick={() => notify('Fee alerts sent to pending students')} className="w-full border border-td-red bg-white text-td-red text-sm font-extrabold p-[13px] rounded-[14px] cursor-pointer mb-[18px]">Send alert to all pending</button>

      <div className="flex flex-col gap-2.5">
        {rows.map((d, i) => {
          const f = feeColor(d.feeStatus)
          return (
            <div key={d.id} className="bg-white border border-td-border rounded-2xl p-[13px] px-3.5 flex items-center gap-[13px]">
              <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-[13px]" style={{ background: av(i) }}>{initials(d.name)}</div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold text-td-dark">{d.name}</div>
                <div className="text-xs text-td-muted mt-0.5">₹4,500 · July 2026</div>
              </div>
              <span className="text-[10.5px] font-bold py-[5px] px-2.5 rounded-[20px]" style={{ color: f.c, background: f.b }}>{d.feeStatus}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MeetingsScreen() {
  const { back, notify } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Meetings" onBack={back} />

      <div className="bg-white border border-td-border rounded-[20px] p-[17px] mb-[22px] flex flex-col gap-3.5">
        <div className="text-sm font-extrabold text-td-dark">Schedule new</div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Title</label><input placeholder="e.g. Parent-teacher meeting" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Type</label><select className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none"><option>Parent-teacher meeting</option><option>Staff meeting</option></select></div>
        <div className="grid grid-cols-2 gap-[11px]">
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Date</label><input defaultValue="28 Jun 2026" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Time</label><input defaultValue="11:00 AM" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        </div>
        <PrimaryButton onClick={() => notify('Meeting scheduled · invites sent')}>Schedule &amp; invite</PrimaryButton>
      </div>

      <div className="text-[15px] font-extrabold text-td-dark mb-3">Upcoming</div>
      <div className="flex flex-col gap-2.5">
        {MEETINGS.map(m => (
          <div key={m.title} className="bg-white border border-td-border rounded-2xl p-3.5 flex items-center gap-[13px]">
            <div className="w-[46px] text-center shrink-0 bg-[#eaf1fc] rounded-xl py-2">
              <div className="text-base font-extrabold text-td-primary leading-none">{m.day}</div>
              <div className="text-[10px] text-td-primary font-semibold mt-0.5">{m.mon}</div>
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-bold text-td-dark">{m.title}</div>
              <div className="text-xs text-td-muted mt-0.5">{m.time} · {m.kind}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RankingsScreen() {
  const { rankSubject, back, set, notify } = useDashboard()
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English']
  const rows = (RANK_DATA[rankSubject] || []).map((r, i) => ({ rank: i + 1, name: r[0], score: r[1] }))

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Rankings" onBack={back} />

      <div className="flex gap-[9px] overflow-x-auto mb-[18px] scrollbar-hide">
        {subjects.map(name => {
          const active = name === rankSubject
          return (
            <button key={name} onClick={() => set({ rankSubject: name })} className="shrink-0 text-[13px] font-bold py-[9px] px-4 rounded-[20px] cursor-pointer border" style={{ background: active ? '#2a6fdb' : '#fff', color: active ? '#fff' : '#3a4456', borderColor: active ? '#2a6fdb' : '#e6eaf2' }}>{name}</button>
          )
        })}
      </div>

      <div className="flex flex-col gap-[9px] mb-5">
        {rows.map((r, i) => (
          <div key={r.name} className="flex items-center gap-[13px] bg-white border border-td-border rounded-2xl p-3 px-3.5">
            <div className="w-[26px] text-center text-sm font-extrabold" style={{ color: i < 3 ? '#e0962f' : '#9aa4b6' }}>{r.rank}</div>
            <div className="w-9 h-9 rounded-[11px] shrink-0 flex items-center justify-center text-white font-bold text-[13px]" style={{ background: av(i) }}>{initials(r.name)}</div>
            <div className="flex-1 text-[13.5px] font-bold text-td-dark">{r.name}</div>
            <div className="text-sm font-extrabold text-td-dark">{r.score}%</div>
          </div>
        ))}
      </div>
      <PrimaryButton onClick={() => notify(`${rankSubject} rankings published`)}>Publish rankings</PrimaryButton>
    </div>
  )
}

export function BranchesScreen() {
  const { back, notify } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Branches" onBack={back} right={
        <button onClick={() => notify('Add branch form — coming soon')} className="border-none bg-td-primary text-white text-[13px] font-bold py-2.5 px-[15px] rounded-[14px] cursor-pointer flex items-center gap-1.5">
          <span className="text-base leading-none">+</span> Add
        </button>
      } />

      <div className="flex flex-col gap-3">
        {BRANCHES.map(b => (
          <div key={b.name} className="bg-white border border-td-border rounded-[18px] p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[15px] font-extrabold text-td-dark">{b.name}</div>
              {b.main && <span className="text-[10px] font-bold text-td-primary bg-[#eaf1fc] py-1 px-[9px] rounded-[20px]">Main</span>}
            </div>
            <div className="text-[12.5px] text-td-muted mb-3">{b.address}</div>
            <div className="flex gap-[18px]">
              <div><div className="text-base font-extrabold text-td-dark">{b.students}</div><div className="text-[11px] text-td-subtle font-semibold">Students</div></div>
              <div><div className="text-base font-extrabold text-td-dark">{b.staff}</div><div className="text-[11px] text-td-subtle font-semibold">Staff</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MoreScreen() {
  const { go, signOut } = useDashboard()
  const items: { icon: string; label: string; tint: string; screen: Screen }[] = [
    { icon: '✅', label: 'Mark attendance', tint: '#e7f5ee', screen: 'attendance' },
    { icon: '📊', label: 'Enter results', tint: '#eaf1fc', screen: 'results' },
    { icon: '📚', label: 'Assignments', tint: '#fcf3e3', screen: 'assign' },
    { icon: '🔔', label: 'Send reminders', tint: '#fdecea', screen: 'reminder' },
    { icon: '💳', label: 'Fees & alerts', tint: '#e7f5ee', screen: 'fees' },
    { icon: '📅', label: 'Meetings', tint: '#eaf1fc', screen: 'meetings' },
    { icon: '🏆', label: 'Rankings', tint: '#fcf3e3', screen: 'rankings' },
    { icon: '🏢', label: 'Branches', tint: '#eef0fc', screen: 'branches' },
    { icon: '💎', label: 'Subscription', tint: '#fcf3e3', screen: 'subscription' },
  ]

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="text-2xl font-extrabold text-td-dark mt-1.5 mb-[18px]">More tools</div>
      <div className="bg-white border border-td-border rounded-[20px] overflow-hidden">
        {items.map(m => (
          <button key={m.label} onClick={() => go(m.screen, 'more')} className="w-full text-left border-none bg-transparent border-b border-[#f0f2f7] p-[15px] px-[17px] flex items-center gap-3.5 cursor-pointer last:border-b-0">
            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg" style={{ background: m.tint }}>{m.icon}</div>
            <div className="flex-1 text-sm font-bold text-td-dark">{m.label}</div>
            <ChevronRight />
          </button>
        ))}
      </div>

      <button onClick={signOut} className="w-full border border-[#f4d8cf] bg-[#fdf3f0] text-td-red text-sm font-extrabold p-[15px] rounded-2xl cursor-pointer mt-4 flex items-center justify-center gap-[9px]">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e8553c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
        Sign out
      </button>
    </div>
  )
}

export function SubscriptionScreen() {
  const { plan: activePlan, back, set, notify } = useDashboard()
  const current = PLAN_META[activePlan]
  const planKeys = ['Monthly', 'Half-yearly', 'Yearly']

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Subscription" onBack={back} />

      <div className="rounded-[22px] p-5 text-white mb-3.5" style={{ background: 'linear-gradient(135deg,#1a2332,#2a3654)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs opacity-70 font-semibold">Current plan</div>
            <div className="text-[22px] font-extrabold mt-[3px]">{current.name}</div>
          </div>
          <span className="text-[11px] font-bold bg-white/15 py-1.5 px-3 rounded-[20px]">Active</span>
        </div>
        <div className="text-[12.5px] opacity-80 mt-2.5">Renews on {current.renews} · {current.price}</div>
      </div>

      <div className="text-xs text-td-subtle font-semibold mb-[18px] leading-relaxed">Billing applies to staff accounts only. Your students always access attendance, results &amp; reminders for free.</div>

      <div className="text-base font-extrabold text-td-dark mb-[13px]">Choose a plan</div>
      <div className="flex flex-col gap-3">
        {planKeys.map(k => {
          const m = PLAN_META[k]
          const active = k === activePlan
          return (
            <div key={k} className="bg-white border-2 rounded-[20px] p-[17px] relative" style={{ borderColor: active ? '#2a6fdb' : '#e6eaf2' }}>
              {k === 'Yearly' && <span className="absolute -top-2.5 right-4 text-[10.5px] font-extrabold text-white bg-td-green py-1 px-[11px] rounded-[20px]">Best value</span>}
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-base font-extrabold text-td-dark">{m.name}</div>
                <span className="text-xl font-extrabold text-td-dark">{m.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[12.5px] text-td-muted">{m.permonth}</div>
                {m.save && <span className="text-[11.5px] font-bold text-td-green">{m.save}</span>}
              </div>
              <button onClick={() => { if (!active) { set({ plan: k }); notify(`Switched to ${m.name} plan`) } }} className="w-full mt-3.5 border-none text-sm font-extrabold p-[13px] rounded-[13px] cursor-pointer" style={{ background: active ? '#eef1f7' : '#2a6fdb', color: active ? '#9aa4b6' : '#fff' }}>
                {active ? 'Current plan' : `Switch to ${m.name}`}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-[11px] mt-[22px] bg-white border border-td-border rounded-[18px] p-[17px]">
        <div className="text-[13px] font-extrabold text-td-dark mb-0.5">All plans include</div>
        {PLAN_PERKS.map(k => (
          <div key={k} className="flex items-center gap-[11px]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2fa36b" strokeWidth="2.6" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span className="text-[13px] text-td-text">{k}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
