'use client'

import { useDashboard, initials, av, feeColor, GRADIENTS } from '../store'
import { ScreenHeader, PrimaryButton, BackButton, ChevronRight } from './Shell'

export function StudentsScreen() {
  const { students, origin, back, go, set, searchQuery } = useDashboard()
  const filtered = searchQuery ? students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())) : students

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="flex items-center justify-between mt-1.5 mb-4">
        <div className="flex items-center gap-3">
          {origin === 'admin' && <BackButton onClick={back} />}
          <div className="text-2xl font-extrabold text-td-dark">Students</div>
        </div>
        <button onClick={() => go('addStudent', 'students')} className="border-none bg-td-primary text-white text-[13px] font-bold py-2.5 px-[15px] rounded-[14px] cursor-pointer flex items-center gap-1.5">
          <span className="text-base leading-none">+</span> Add
        </button>
      </div>

      <div className="flex items-center gap-2.5 bg-white border border-td-border rounded-[14px] p-[11px] px-3.5 mb-[18px]">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9aa4b6" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
        <input value={searchQuery} onChange={e => set({ searchQuery: e.target.value })} placeholder="Search students..." className="flex-1 text-[13.5px] text-td-dark outline-none bg-transparent" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-td-muted text-sm py-8">{students.length === 0 ? 'No students added yet' : 'No results'}</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((s, i) => {
            const idx = students.indexOf(s)
            const f = feeColor(s.feeStatus)
            return (
              <button key={s.id || i} onClick={() => set({ editIndex: idx, screen: 'editStudent', tab: 'students' })} className="text-left bg-white border border-td-border rounded-[18px] p-3.5 flex items-center gap-[13px] cursor-pointer">
                <div className="w-[46px] h-[46px] rounded-[14px] shrink-0 flex items-center justify-center text-white font-bold text-[15px]" style={{ background: av(idx) }}>{initials(s.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-td-dark">{s.name}</div>
                  <div className="text-xs text-td-muted mt-0.5">{s.klass} · {s.attendance}% attendance</div>
                </div>
                <span className="text-[10.5px] font-bold py-[5px] px-[9px] rounded-[20px]" style={{ color: f.c, background: f.b }}>{s.feeStatus}</span>
                <ChevronRight />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function EditStudentScreen() {
  const { students, editIndex, go, setStudentField, deleteStudent, notify } = useDashboard()
  const st = students[editIndex] || students[0]
  if (!st) return <div className="p-5 text-center text-td-muted">No student selected</div>

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Edit Student" onBack={() => go('students', 'students')} right={
        <button onClick={deleteStudent} className="border-none bg-[#fdecea] text-td-red text-[12.5px] font-bold py-[9px] px-[13px] rounded-[13px] cursor-pointer">Remove</button>
      } />

      <div className="flex items-center gap-3.5 mb-[22px]">
        <div className="w-16 h-16 rounded-[18px] shrink-0 flex items-center justify-center text-white font-extrabold text-[22px]" style={{ background: av(editIndex) }}>{initials(st.name)}</div>
        <div>
          <div className="text-[17px] font-extrabold text-td-dark">{st.name}</div>
          <div className="text-[12.5px] text-td-muted mt-0.5">{st.klass} · ID {st.id}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 mb-[18px]">
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Full name</label><input value={st.name} onChange={e => setStudentField({ name: e.target.value })} className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div className="grid grid-cols-2 gap-[11px]">
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Class / batch</label><input value={st.klass} onChange={e => setStudentField({ klass: e.target.value })} className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Attendance %</label><input value={st.attendance} onChange={e => setStudentField({ attendance: Number(e.target.value) })} className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        </div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">School</label><input value={st.school} onChange={e => setStudentField({ school: e.target.value })} className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Parent contact</label><input value={st.parent} onChange={e => setStudentField({ parent: e.target.value })} className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div>
          <label className="text-xs font-bold text-td-muted mb-[7px] block">Fee status</label>
          <div className="flex gap-[9px]">
            {(['Paid', 'Due', 'Overdue'] as const).map(label => {
              const active = label === st.feeStatus
              const fc = feeColor(label)
              return (
                <button key={label} onClick={() => setStudentField({ feeStatus: label })} className="flex-1 border text-[13px] font-bold p-[11px] rounded-[13px] cursor-pointer" style={{ background: active ? fc.b : '#fff', color: active ? fc.c : '#9aa4b6', borderColor: active ? fc.c : '#e6eaf2' }}>{label}</button>
              )
            })}
          </div>
        </div>
      </div>
      <PrimaryButton onClick={() => {
        if (!st.name.trim()) { notify('Name is required'); return }
        if (st.parent && !/^\+?\d[\d\s\-]{6,}$/.test(st.parent)) { notify('Invalid phone number'); return }
        notify('Student record updated'); go('students', 'students')
      }}>Save changes</PrimaryButton>
    </div>
  )
}

export function AddStudentScreen() {
  const { go, newStudent, setNewStudent, addStudent, branchesList } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Add Student" onBack={() => go('students', 'students')} />

      <div className="flex justify-center mb-5">
        <div className="w-[88px] h-[88px] rounded-full border-2 border-dashed border-[#c2cad8] bg-white flex flex-col items-center justify-center gap-[3px]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9aa4b6" strokeWidth="2" strokeLinecap="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></svg>
          <span className="text-[9px] text-td-subtle font-bold">Photo</span>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 mb-[22px]">
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Full name</label><input value={newStudent.name} onChange={e => setNewStudent({ name: e.target.value })} placeholder="Student name" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div className="grid grid-cols-2 gap-[11px]">
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">School</label><input value={newStudent.school} onChange={e => setNewStudent({ school: e.target.value })} placeholder="School" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Standard</label>
            <select value={newStudent.klass} onChange={e => setNewStudent({ klass: e.target.value })} className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none">
              <option>Class 10</option><option>Class 9</option><option>Class 8</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[11px]">
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Batch</label>
            <select value={newStudent.batch} onChange={e => setNewStudent({ batch: e.target.value })} className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none">
              <option>10-B</option><option>10-A</option><option>9-A</option><option>9-B</option>
            </select>
          </div>
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Branch</label>
            <select value={newStudent.branch} onChange={e => setNewStudent({ branch: e.target.value })} className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none">
              {branchesList.length ? branchesList.map(b => <option key={b.name}>{b.name}</option>) : <option>No branches</option>}
            </select>
          </div>
        </div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Parent contact</label><input value={newStudent.parent} onChange={e => setNewStudent({ parent: e.target.value })} placeholder="+91" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Address</label><input value={newStudent.address} onChange={e => setNewStudent({ address: e.target.value })} placeholder="Address" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
      </div>
      <PrimaryButton onClick={addStudent}>Save student</PrimaryButton>
    </div>
  )
}

export function StaffScreen() {
  const { teachers, origin, back, go } = useDashboard()

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <div className="flex items-center justify-between mt-1.5 mb-[18px]">
        <div className="flex items-center gap-3">
          {origin === 'admin' && <BackButton onClick={back} />}
          <div className="text-2xl font-extrabold text-td-dark">Staff</div>
        </div>
        <button onClick={() => go('addTeacher', 'teachers')} className="border-none bg-td-primary text-white text-[13px] font-bold py-2.5 px-[15px] rounded-[14px] cursor-pointer flex items-center gap-1.5">
          <span className="text-base leading-none">+</span> Add
        </button>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center text-td-muted text-sm py-8">No teachers added yet</div>
      ) : (
        <div className="flex flex-col gap-3">
          {teachers.map((t, i) => (
            <div key={t.name + i} className="bg-white border border-td-border rounded-[18px] p-3.5 flex items-center gap-3.5">
              <div className="w-[52px] h-[52px] rounded-2xl shrink-0 flex items-center justify-center text-white font-extrabold text-[17px]" style={{ background: GRADIENTS[i % GRADIENTS.length] }}>{initials(t.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold text-td-dark">{t.name}</div>
                <div className="text-[12.5px] text-td-primary font-bold mt-0.5">{t.subject}</div>
                <div className="text-[11.5px] text-td-muted mt-[3px]">{t.experience} yrs · {t.qualification}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AddTeacherScreen() {
  const { newTeacher: nt, subjects, go, setNewTeacher, saveTeacher } = useDashboard()
  const subjectNames = subjects.length ? subjects.map(s => s.name) : ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology']

  return (
    <div className="animate-[pop_.35s_ease] px-5 pt-1.5 pb-6">
      <ScreenHeader title="Add Teacher" onBack={() => go('teachers', 'teachers')} />

      <div className="flex justify-center mb-5">
        <div className="w-[88px] h-[88px] rounded-3xl border-2 border-dashed border-[#c2cad8] bg-white flex flex-col items-center justify-center gap-[3px]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9aa4b6" strokeWidth="2" strokeLinecap="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></svg>
          <span className="text-[9px] text-td-subtle font-bold">Photo</span>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 mb-[22px]">
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Full name</label><input value={nt.name} onChange={e => setNewTeacher({ name: e.target.value })} placeholder="Teacher name" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Subject</label>
          <select value={nt.subject} onChange={e => setNewTeacher({ subject: e.target.value })} className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none">
            {subjectNames.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Qualification</label><input value={nt.qualification} onChange={e => setNewTeacher({ qualification: e.target.value })} placeholder="e.g. M.Sc, B.Ed" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
        <div className="grid grid-cols-2 gap-[11px]">
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Years of exp.</label><input value={nt.experience} onChange={e => setNewTeacher({ experience: e.target.value })} placeholder="0" className="w-full border border-td-border rounded-[14px] p-[13px] text-sm text-td-dark outline-none focus:border-td-primary" /></div>
          <div><label className="text-xs font-bold text-td-muted mb-[7px] block">Branch</label><select className="w-full border border-td-border rounded-[14px] p-[13px] text-[13.5px] bg-white text-td-dark outline-none"><option>All branches</option></select></div>
        </div>
      </div>
      <PrimaryButton onClick={saveTeacher}>Save teacher</PrimaryButton>
    </div>
  )
}
