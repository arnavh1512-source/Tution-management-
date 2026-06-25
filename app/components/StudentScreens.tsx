'use client'

import { useDashboard, STU_REMINDERS, STU_NOTIFICATIONS, STU_ATTENDANCE_LOG, STU_FEE_HISTORY, STU_RESULTS, STU_PROFILE_FIELDS, RANK_DATA, GRADIENTS, initials, av, stuGrade } from '../store'
import { ScreenHeader, PrimaryButton, ChevronRight } from './Shell'

export function StuHomeScreen() {
  const { go, set, notify } = useDashboard()
  const recentResults = STU_RESULTS.slice(0, 3)

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-[46px] h-[46px] rounded-2xl flex items-center justify-center text-white font-extrabold text-[17px]" style={{ background: 'linear-gradient(135deg,#2fa36b,#56c48d)' }}>AS</div>
          <div>
            <div className="text-xs text-td-muted font-semibold">Good morning</div>
            <div className="text-[17px] font-extrabold text-td-dark">Aarav Sharma</div>
          </div>
        </div>
        <button onClick={() => go('stuNotif', 'stuHome')} className="relative w-[42px] h-[42px] rounded-[14px] border border-td-border bg-white flex items-center justify-center cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a2332" strokeWidth="2" strokeLinecap="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          <span className="absolute top-[9px] right-[10px] w-2 h-2 rounded-full bg-td-red border-2 border-white" />
        </button>
      </div>

      <div className="inline-flex items-center gap-[7px] bg-white border border-td-border rounded-[20px] py-[7px] px-[13px] mb-[18px]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a6fdb" strokeWidth="2.2" strokeLinecap="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>
        <span className="text-[12.5px] font-semibold text-td-text">Noida Central Branch</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <button onClick={() => go('stuAttendance', 'stuHome')} className="rounded-[18px] p-3.5 text-white text-left border-none cursor-pointer" style={{ background: 'linear-gradient(135deg,#2a6fdb,#3f82ec)' }}>
          <div className="text-2xl font-extrabold leading-none">92%</div>
          <div className="text-[11px] opacity-85 mt-1.5 font-semibold">Attendance</div>
        </button>
        <button onClick={() => go('stuRanking', 'stuRanking')} className="bg-white border border-td-border rounded-[18px] p-3.5 text-left cursor-pointer">
          <div className="text-2xl font-extrabold leading-none text-td-dark">#2<span className="text-sm text-td-muted font-semibold"> / 38</span></div>
          <div className="text-[11px] text-td-muted mt-1.5 font-semibold">Class Rank</div>
          <div className="text-[10px] text-td-green font-bold mt-0.5">▲ Up 2 spots</div>
        </button>
      </div>

      <button onClick={() => go('stuFees', 'stuHome')} className="w-full text-left border-none cursor-pointer rounded-[18px] p-[15px] flex items-center gap-[13px] mb-5" style={{ background: 'linear-gradient(135deg,#e8553c,#ef7a64)' }}>
        <div className="w-[42px] h-[42px] rounded-[13px] bg-white/20 flex items-center justify-center shrink-0">
          <span className="text-xl">💳</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-extrabold text-white">₹4,500 fee due</div>
          <div className="text-xs text-white/70 mt-0.5">Due by 30 Jun 2026</div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.4" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      <div className="text-base font-extrabold text-td-dark mb-[13px]">Reminders</div>
      <div className="flex flex-col gap-2.5 mb-[22px]">
        {STU_REMINDERS.map(r => (
          <div key={r.title} className="bg-white border border-td-border rounded-[18px] p-3.5 flex items-center gap-[13px]">
            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg" style={{ background: r.tint }}>{r.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-bold text-td-dark">{r.title}</div>
              <div className="text-xs text-td-muted mt-0.5 truncate">{r.detail}</div>
            </div>
            <span className="text-[11px] text-td-subtle font-semibold shrink-0">{r.when}</span>
          </div>
        ))}
      </div>

      <div className="text-base font-extrabold text-td-dark mb-[13px]">Recent results</div>
      <div className="flex flex-col gap-2.5">
        {recentResults.map(r => {
          const pct = Math.round((r.marks / r.total) * 100)
          const g = stuGrade(pct)
          return (
            <div key={r.subject} className="bg-white border border-td-border rounded-[18px] p-3.5 flex items-center gap-[13px]">
              <span className="text-[11px] font-extrabold py-[5px] px-2.5 rounded-[10px]" style={{ color: g.c, background: g.t }}>{g.g}</span>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold text-td-dark">{r.subject}</div>
                <div className="text-xs text-td-muted mt-0.5">{r.test} · {r.date}</div>
              </div>
              <div className="text-sm font-extrabold text-td-dark">{r.marks}/{r.total}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StuAttendanceScreen() {
  const { go } = useDashboard()
  const pct = 92
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Attendance" onBack={() => go('stuHome', 'stuHome')} />

      <div className="rounded-[22px] p-5 text-white mb-5 flex items-center gap-5" style={{ background: 'linear-gradient(135deg,#2a6fdb,#3f82ec)' }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="7" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 50 50)" />
          <text x="50" y="46" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="800">{pct}%</text>
          <text x="50" y="62" textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="9" fontWeight="600">Present</text>
        </svg>
        <div>
          <div className="text-[15px] font-extrabold">Present this term</div>
          <div className="text-[12.5px] opacity-80 mt-1.5 leading-relaxed">46 of 50 class days attended.<br/>2 absences, 2 leaves.</div>
        </div>
      </div>

      <div className="text-base font-extrabold text-td-dark mb-[13px]">Recent days</div>
      <div className="flex flex-col gap-2.5">
        {STU_ATTENDANCE_LOG.map(d => (
          <div key={d.date} className="bg-white border border-td-border rounded-[18px] p-3.5 flex items-center gap-[13px]">
            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg" style={{ background: d.tint }}>{d.icon}</div>
            <div className="flex-1">
              <div className="text-[13.5px] font-bold text-td-dark">{d.day}</div>
              <div className="text-xs text-td-muted mt-0.5">{d.date}</div>
            </div>
            <span className="text-[11px] font-bold" style={{ color: d.color }}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StuResultsScreen() {
  const { go } = useDashboard()
  const totalMarks = STU_RESULTS.reduce((a, r) => a + r.marks, 0)
  const totalMax = STU_RESULTS.reduce((a, r) => a + r.total, 0)
  const avg = Math.round((totalMarks / totalMax) * 100)
  const overall = stuGrade(avg)

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="text-2xl font-extrabold text-td-dark mt-1.5 mb-1">Test Results</div>
      <div className="text-[12.5px] text-td-muted mb-[18px]">Class 10 - B · Delhi Public School</div>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <div className="rounded-[18px] p-3.5 text-center" style={{ background: overall.t }}>
          <div className="text-2xl font-extrabold" style={{ color: overall.c }}>{overall.g}</div>
          <div className="text-[11px] font-semibold mt-1" style={{ color: overall.c, opacity: .7 }}>Overall grade</div>
        </div>
        <div className="bg-white border border-td-border rounded-[18px] p-3.5 text-center">
          <div className="text-2xl font-extrabold text-td-dark">{avg}%</div>
          <div className="text-[11px] text-td-muted font-semibold mt-1">Average</div>
        </div>
      </div>

      <div className="text-base font-extrabold text-td-dark mb-[13px]">All subjects</div>
      <div className="flex flex-col gap-2.5">
        {STU_RESULTS.map(r => {
          const pct = Math.round((r.marks / r.total) * 100)
          const g = stuGrade(pct)
          return (
            <div key={r.subject} className="bg-white border border-td-border rounded-[18px] p-3.5">
              <div className="flex items-center gap-[13px] mb-2.5">
                <span className="text-[11px] font-extrabold py-[5px] px-2.5 rounded-[10px]" style={{ color: g.c, background: g.t }}>{g.g}</span>
                <div className="flex-1">
                  <div className="text-[13.5px] font-bold text-td-dark">{r.subject}</div>
                  <div className="text-xs text-td-muted mt-0.5">{r.test} · {r.date}</div>
                </div>
                <div className="text-sm font-extrabold text-td-dark">{r.marks}/{r.total}</div>
              </div>
              <div className="w-full h-[7px] bg-[#eef1f7] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.c }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StuRankingScreen() {
  const { stuRankSubject, set } = useDashboard()
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology']
  const rows = (RANK_DATA[stuRankSubject] || []).map((r, i) => ({ rank: i + 1, name: r[0], score: r[1] }))
  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)
  const medals = ['🥈', '🥇', '🥉']
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3
  const podiumHeights = [88, 110, 72]
  const podiumBg = ['#c0cfe8', '#2a6fdb', '#d4c9a8']

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="text-2xl font-extrabold text-td-dark mt-1.5 mb-1">Ranking</div>
      <div className="text-[12.5px] text-td-muted mb-[18px]">Class 10-B · Mathematics</div>

      <div className="flex gap-[9px] overflow-x-auto mb-[22px] scrollbar-hide">
        {subjects.map(name => {
          const active = name === stuRankSubject
          return (
            <button key={name} onClick={() => set({ stuRankSubject: name })} className="shrink-0 text-[13px] font-bold py-[9px] px-4 rounded-[20px] cursor-pointer border" style={{ background: active ? '#2a6fdb' : '#fff', color: active ? '#fff' : '#3a4456', borderColor: active ? '#2a6fdb' : '#e6eaf2' }}>{name}</button>
          )
        })}
      </div>

      {top3.length >= 3 && (
        <div className="flex justify-center items-end gap-[7px] mb-6">
          {podiumOrder.map((p, pi) => {
            const isYou = p.name === 'Aarav Sharma'
            return (
              <div key={p.name} className="flex flex-col items-center">
                <div className="text-2xl mb-1">{medals[pi]}</div>
                <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-white font-extrabold text-[17px] mb-1.5" style={{ background: GRADIENTS[pi] }}>{initials(p.name)}</div>
                <div className="text-[11px] font-extrabold text-td-dark text-center leading-tight mb-0.5">{p.name.split(' ')[0]}{isYou && <span className="text-td-primary"> (You)</span>}</div>
                <div className="text-[11px] font-bold text-td-primary mb-1.5">{p.score}%</div>
                <div className="w-[72px] rounded-t-[10px]" style={{ height: podiumHeights[pi], background: podiumBg[pi] }} />
              </div>
            )
          })}
        </div>
      )}

      <div className="text-[13px] font-extrabold text-td-dark mb-[11px]">Leaderboard</div>
      <div className="flex flex-col gap-[9px]">
        {rest.map(r => {
          const isYou = r.name === 'Aarav Sharma'
          return (
            <div key={r.name} className="flex items-center gap-[13px] border rounded-2xl p-3 px-3.5" style={{ background: isYou ? '#eaf1fc' : '#fff', borderColor: isYou ? '#2a6fdb' : '#e6eaf2' }}>
              <div className="w-[26px] text-center text-sm font-extrabold text-td-subtle">{r.rank}</div>
              <div className="w-9 h-9 rounded-[11px] shrink-0 flex items-center justify-center text-white font-bold text-[13px]" style={{ background: av(r.rank) }}>{initials(r.name)}</div>
              <div className="flex-1 text-[13.5px] font-bold text-td-dark">{r.name}{isYou && <span className="text-td-primary text-xs"> (You)</span>}</div>
              <div className="text-sm font-extrabold text-td-dark">{r.score}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StuTeachersScreen() {
  const { teachers, set, go } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="text-2xl font-extrabold text-td-dark mt-1.5 mb-1">Teachers</div>
      <div className="text-[12.5px] text-td-muted mb-[18px]">{teachers.length} faculty at your branch</div>

      <div className="flex flex-col gap-3">
        {teachers.map((t, i) => (
          <button key={t.name} onClick={() => { set({ stuTeacherIndex: i }); go('stuTeacher', 'stuTeachers') }} className="text-left bg-white border border-td-border rounded-[18px] p-3.5 flex items-center gap-3.5 cursor-pointer">
            <div className="w-[52px] h-[52px] rounded-2xl shrink-0 flex items-center justify-center text-white font-extrabold text-[17px]" style={{ background: GRADIENTS[i % GRADIENTS.length] }}>{initials(t.name)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-extrabold text-td-dark">{t.name}</div>
              <div className="text-[12.5px] text-td-primary font-bold mt-0.5">{t.subject}</div>
              <div className="text-[11.5px] text-td-muted mt-[3px]">{t.experience} yrs · {t.qualification}</div>
            </div>
            <ChevronRight />
          </button>
        ))}
      </div>
    </div>
  )
}

export function StuTeacherDetail() {
  const { teachers, stuTeacherIndex, go } = useDashboard()
  const t = teachers[stuTeacherIndex] || teachers[0]

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Teacher Profile" onBack={() => go('stuTeachers', 'stuTeachers')} />

      <div className="flex flex-col items-center mb-5">
        <div className="w-[80px] h-[80px] rounded-3xl flex items-center justify-center text-white font-extrabold text-[28px] mb-3" style={{ background: GRADIENTS[stuTeacherIndex % GRADIENTS.length] }}>{initials(t.name)}</div>
        <div className="text-[20px] font-extrabold text-td-dark">{t.name}</div>
        <span className="text-[12px] font-bold text-td-primary bg-[#eaf1fc] py-[5px] px-3 rounded-[20px] mt-2">{t.subject}</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <div className="bg-white border border-td-border rounded-[18px] p-3.5 text-center">
          <div className="text-2xl font-extrabold text-td-dark">{t.experience}</div>
          <div className="text-[11px] text-td-muted font-semibold mt-1">Years exp.</div>
        </div>
        <div className="bg-white border border-td-border rounded-[18px] p-3.5 text-center">
          <div className="text-2xl font-extrabold text-td-amber">⭐ {t.rating || '4.8'}</div>
          <div className="text-[11px] text-td-muted font-semibold mt-1">Rating</div>
        </div>
      </div>

      <div className="bg-white border border-td-border rounded-[18px] p-4 mb-3">
        <div className="text-[13px] font-extrabold text-td-dark mb-2">Qualification</div>
        <div className="text-[13px] text-td-muted">{t.qualification}</div>
      </div>

      {t.about && (
        <div className="bg-white border border-td-border rounded-[18px] p-4">
          <div className="text-[13px] font-extrabold text-td-dark mb-2">About</div>
          <div className="text-[13px] text-td-muted leading-relaxed">{t.about}</div>
        </div>
      )}
    </div>
  )
}

export function StuFeesScreen() {
  const { go, notify } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Fees" onBack={() => go('stuHome', 'stuHome')} />

      <div className="rounded-[22px] p-5 text-white mb-5" style={{ background: 'linear-gradient(135deg,#e8553c,#ef7a64)' }}>
        <div className="text-xs opacity-70 font-semibold">Amount due</div>
        <div className="text-[28px] font-extrabold mt-1">₹4,500</div>
        <div className="text-[12.5px] opacity-80 mt-1">July 2026 tuition · Due 30 Jun</div>
        <button onClick={() => notify('Payment gateway — coming soon')} className="w-full mt-4 border-none bg-white text-td-red text-sm font-extrabold py-3.5 rounded-[14px] cursor-pointer">Pay now</button>
      </div>

      <div className="text-base font-extrabold text-td-dark mb-[13px]">Payment history</div>
      <div className="flex flex-col gap-2.5">
        {STU_FEE_HISTORY.map(f => (
          <div key={f.period} className="bg-white border border-td-border rounded-[18px] p-3.5 flex items-center gap-[13px]">
            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-[#e7f5ee]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2fa36b" strokeWidth="2.6" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-bold text-td-dark">{f.period}</div>
              <div className="text-xs text-td-muted mt-0.5">Paid on {f.date}</div>
            </div>
            <div className="text-sm font-extrabold text-td-green">{f.amount}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StuNotifScreen() {
  const { go } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Notifications" onBack={() => go('stuHome', 'stuHome')} />

      <div className="flex flex-col gap-2.5">
        {STU_NOTIFICATIONS.map(n => (
          <div key={n.title + n.when} className="bg-white border border-td-border rounded-[18px] p-3.5 flex items-start gap-[13px]">
            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg mt-0.5" style={{ background: n.tint }}>{n.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-bold text-td-dark">{n.title}</div>
              <div className="text-xs text-td-muted mt-1 leading-relaxed">{n.detail}</div>
              <div className="text-[11px] text-td-subtle font-semibold mt-1.5">{n.when}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StuProfileScreen() {
  const { go, signOut } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="flex items-center justify-between mt-1.5 mb-[18px]">
        <div className="text-2xl font-extrabold text-td-dark">My Profile</div>
        <div className="flex gap-2">
          <button onClick={() => go('stuEditProfile', 'stuProfile')} className="border border-td-border bg-white text-td-primary text-[12.5px] font-bold py-2 px-3 rounded-[12px] cursor-pointer">Edit</button>
          <button onClick={signOut} className="border border-[#f4d8cf] bg-[#fdf3f0] text-td-red text-[12.5px] font-bold py-2 px-3 rounded-[12px] cursor-pointer">Sign out</button>
        </div>
      </div>

      <div className="rounded-[22px] p-5 text-white flex items-center gap-4 mb-5" style={{ background: 'linear-gradient(135deg,#2a6fdb,#3f82ec)' }}>
        <div className="w-[64px] h-[64px] rounded-2xl bg-white/20 flex items-center justify-center text-white font-extrabold text-[22px] shrink-0">AS</div>
        <div>
          <div className="text-[18px] font-extrabold">Aarav Sharma</div>
          <div className="text-[12.5px] opacity-80 mt-0.5">Class 10 - B</div>
          <span className="inline-block text-[10.5px] font-bold bg-white/20 py-1 px-2.5 rounded-[20px] mt-1.5">A+ · Top 5%</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mb-5">
        {STU_PROFILE_FIELDS.map(f => (
          <div key={f.label} className="bg-white border border-td-border rounded-[18px] p-3.5 flex items-center gap-[13px]">
            <span className="text-lg">{f.icon}</span>
            <div className="flex-1">
              <div className="text-[11px] text-td-subtle font-semibold">{f.label}</div>
              <div className="text-[13.5px] font-bold text-td-dark mt-0.5">{f.value || (f.label === 'Address' ? 'B-204, Sector 12, Noida, UP' : '+91 98100 45xxx')}</div>
            </div>
            {f.locked && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c2cad8" strokeWidth="2.2" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>}
          </div>
        ))}
      </div>

      <div className="text-[11.5px] text-td-subtle text-center leading-relaxed">Fields marked with 🔒 are set by your tuition centre and cannot be changed.</div>
    </div>
  )
}

export function StuEditProfileScreen() {
  const { stuEdit, go, set, notify } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Edit Profile" onBack={() => go('stuProfile', 'stuProfile')} />

      <div className="flex flex-col items-center mb-5">
        <div className="w-[80px] h-[80px] rounded-3xl flex items-center justify-center text-white font-extrabold text-[28px] mb-2 relative" style={{ background: 'linear-gradient(135deg,#2fa36b,#56c48d)' }}>
          AS
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-td-primary flex items-center justify-center border-2 border-td-bg">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>
          </div>
        </div>
        <button className="text-[12px] text-td-primary font-bold mt-1 border-none bg-transparent cursor-pointer">Change photo</button>
      </div>

      <div className="flex flex-col gap-3.5 mb-5">
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Full name</label><input value={stuEdit.name} onChange={e => set({ stuEdit: { ...stuEdit, name: e.target.value } })} className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Parent contact</label><input value={stuEdit.parentNumber} onChange={e => set({ stuEdit: { ...stuEdit, parentNumber: e.target.value } })} className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Address</label><input value={stuEdit.address} onChange={e => set({ stuEdit: { ...stuEdit, address: e.target.value } })} className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
      </div>

      <div className="bg-[#f4f6fb] border border-td-border rounded-[18px] p-4 mb-5">
        <div className="text-[12px] font-bold text-td-subtle mb-2.5">Locked by tuition centre</div>
        <div className="flex flex-col gap-2">
          {[{ l: 'School', v: 'Delhi Public School' }, { l: 'Standard', v: 'Class 10 - B' }, { l: 'Performance', v: 'A+ · Top 5% of class' }].map(f => (
            <div key={f.l} className="flex items-center justify-between">
              <span className="text-[12.5px] text-td-muted">{f.l}</span>
              <span className="text-[12.5px] font-bold text-td-text">{f.v}</span>
            </div>
          ))}
        </div>
      </div>

      <PrimaryButton onClick={() => { notify('Profile updated'); go('stuProfile', 'stuProfile') }}>Save changes</PrimaryButton>
    </div>
  )
}
