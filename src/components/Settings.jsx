import React, { useState } from 'react'
import useStore from '../store'

const DAY_LABELS = ['월요일', '화요일', '수요일', '목요일', '금요일']

// 두 time 문자열 간 분 차이 계산
function calcDuration(start, end) {
  if (!start || !end) return ''
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  return diff > 0 ? `${diff}분` : ''
}

export default function Settings() {
  const { timetable, setPage, updatePeriod, setClassAssignment, setWorkTime } = useStore()
  const { periods, schedule, workStart, workEnd } = timetable
  const [localWorkStart, setLocalWorkStart] = useState(workStart)
  const [localWorkEnd, setLocalWorkEnd] = useState(workEnd)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('time') // 'time' | 'schedule'

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>시간표 설정</h2>
        <button className="back-btn" onClick={() => setPage('main')}>← 일정으로</button>
      </div>

      {saved && <div className="save-toast">✓ 저장되었습니다</div>}

      {/* 탭 */}
      <div className="settings-tabs">
        <button className={`settings-tab ${activeTab === 'time' ? 'active' : ''}`} onClick={() => setActiveTab('time')}>
          ① 교시 시간 설정
        </button>
        <button className={`settings-tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          ② 주간 시간표 작성
        </button>
      </div>

      {/* ── 탭 1: 교시 시간 ── */}
      {activeTab === 'time' && (
        <>
          <section className="settings-section">
            <h3>근무 시간</h3>
            <div className="work-time-row">
              <label>
                <span>출근 시간</span>
                <input type="time" value={localWorkStart} onChange={e => setLocalWorkStart(e.target.value)} />
              </label>
              <span className="time-arrow">→</span>
              <label>
                <span>퇴근 시간</span>
                <input type="time" value={localWorkEnd} onChange={e => setLocalWorkEnd(e.target.value)} />
              </label>
              <button className="save-small-btn" onClick={() => { setWorkTime(localWorkStart, localWorkEnd); flash() }}>
                저장
              </button>
            </div>
          </section>

          <section className="settings-section">
            <h3>교시별 시간</h3>
            <p className="settings-hint">학교 시간표에 맞춰 각 교시의 시작·종료 시간을 입력하세요.</p>

            <div className="period-time-table">
              <div className="period-time-header">
                <span>교시</span>
                <span>시작</span>
                <span></span>
                <span>종료</span>
                <span>수업 시간</span>
              </div>
              {periods.map(p => (
                <div key={p.id} className="period-time-row">
                  <span className="period-time-label">{p.label}</span>
                  <input
                    type="time"
                    className="time-input"
                    value={p.start}
                    onChange={e => { updatePeriod(p.id, 'start', e.target.value); flash() }}
                  />
                  <span className="time-tilde">~</span>
                  <input
                    type="time"
                    className="time-input"
                    value={p.end}
                    onChange={e => { updatePeriod(p.id, 'end', e.target.value); flash() }}
                  />
                  <span className="duration-badge">{calcDuration(p.start, p.end)}</span>
                </div>
              ))}
            </div>

            <p className="settings-hint" style={{ marginTop: 12 }}>
              💡 주간 뷰에서 <strong>✏ 시간표 편집</strong> 버튼을 누르면 시작 시간을 직접 수정할 수도 있습니다.
            </p>
          </section>
        </>
      )}

      {/* ── 탭 2: 주간 시간표 ── */}
      {activeTab === 'schedule' && (
        <section className="settings-section">
          <h3>주간 시간표 작성</h3>
          <p className="settings-hint">각 칸에 <strong>과목명 반</strong>을 입력하세요. 수업이 없는 칸(공강)은 빈칸으로 두세요.</p>

          <div className="schedule-grid-wrap">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th className="sch-th-day"></th>
                  {periods.map(p => (
                    <th key={p.id} className="sch-th-period">
                      <div>{p.label}</div>
                      <div className="sch-th-time">{p.start}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAY_LABELS.map((label, di) => (
                  <tr key={di}>
                    <td className="sch-td-day">{label}</td>
                    {periods.map(p => {
                      const val = schedule[di]?.[p.id]?.className || ''
                      return (
                        <td key={p.id} className={`sch-td-cell ${val ? 'has-class' : 'is-free'}`}>
                          <input
                            type="text"
                            className="sch-input"
                            placeholder="공강"
                            value={val}
                            onChange={e => { setClassAssignment(di, p.id, e.target.value); flash() }}
                            title={`${label} ${p.label}`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="settings-hint" style={{ marginTop: 10 }}>
            예시: <code>수학 1-1</code>&nbsp;&nbsp;<code>국어 3-2</code>&nbsp;&nbsp;<code>영어(심화)</code>
          </p>
        </section>
      )}
    </div>
  )
}
