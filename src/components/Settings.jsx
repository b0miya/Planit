import React, { useState } from 'react'
import useStore from '../store'

const DAY_LABELS = ['월요일', '화요일', '수요일', '목요일', '금요일']

export default function Settings() {
  const { timetable, setPage, updatePeriod, setClassAssignment, setWorkTime } = useStore()
  const { periods, schedule, workStart, workEnd } = timetable
  const [localWorkStart, setLocalWorkStart] = useState(workStart)
  const [localWorkEnd, setLocalWorkEnd] = useState(workEnd)
  const [saved, setSaved] = useState(false)

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>시간표 설정</h2>
        <button className="back-btn" onClick={() => setPage('main')}>← 일정으로</button>
      </div>

      {saved && <div className="save-toast">✓ 저장되었습니다</div>}

      <section className="settings-section">
        <h3>근무 시간</h3>
        <div className="work-time-row">
          <label>출근 시간 <input type="time" value={localWorkStart} onChange={e => setLocalWorkStart(e.target.value)} /></label>
          <label>퇴근 시간 <input type="time" value={localWorkEnd} onChange={e => setLocalWorkEnd(e.target.value)} /></label>
          <button className="save-small-btn" onClick={() => { setWorkTime(localWorkStart, localWorkEnd); flash() }}>저장</button>
        </div>
      </section>

      <section className="settings-section">
        <h3>교시 시간</h3>
        <div className="periods-table">
          <div className="periods-header"><span>교시</span><span>시작</span><span>종료</span></div>
          {periods.map(p => (
            <div key={p.id} className="period-row">
              <span className="period-row-label">{p.label}</span>
              <input type="time" value={p.start} onChange={e => { updatePeriod(p.id, 'start', e.target.value); flash() }} />
              <input type="time" value={p.end} onChange={e => { updatePeriod(p.id, 'end', e.target.value); flash() }} />
            </div>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>주간 시간표</h3>
        <p className="settings-hint">수업이 없는 시간(공강)은 빈칸으로 두세요.</p>
        <div className="schedule-grid">
          <div className="schedule-header-row">
            <span className="schedule-day-label" />
            {periods.map(p => <span key={p.id} className="schedule-period-label">{p.label}</span>)}
          </div>
          {DAY_LABELS.map((label, di) => (
            <div key={di} className="schedule-row">
              <span className="schedule-day-label">{label}</span>
              {periods.map(p => (
                <input
                  key={p.id}
                  type="text"
                  className="schedule-input"
                  placeholder="과목 반"
                  value={schedule[di]?.[p.id]?.className || ''}
                  onChange={e => { setClassAssignment(di, p.id, e.target.value); flash() }}
                  title={`${label} ${p.label}`}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="settings-hint" style={{ marginTop: 8 }}>예: <code>수학 1-1</code>, <code>국어 3-2</code></p>
      </section>
    </div>
  )
}
