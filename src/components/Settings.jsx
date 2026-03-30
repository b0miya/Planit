import React, { useState } from 'react'
import useStore from '../store'

const DAY_LABELS = ['월요일', '화요일', '수요일', '목요일', '금요일']

// 숫자 입력 시 자동으로 HH:MM 형식으로 변환
function formatTimeInput(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return digits.slice(0, 2) + ':' + digits.slice(2)
}

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
                <input type="text" className="time-input" placeholder="09:00" maxLength={5} value={localWorkStart} onChange={e => setLocalWorkStart(formatTimeInput(e.target.value))} />
              </label>
              <span className="time-arrow">→</span>
              <label>
                <span>퇴근 시간</span>
                <input type="text" className="time-input" placeholder="17:00" maxLength={5} value={localWorkEnd} onChange={e => setLocalWorkEnd(formatTimeInput(e.target.value))} />
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
                    type="text"
                    className="time-input"
                    placeholder="09:00"
                    maxLength={5}
                    value={p.start}
                    onChange={e => { updatePeriod(p.id, 'start', formatTimeInput(e.target.value)); flash() }}
                  />
                  <span className="time-tilde">~</span>
                  <input
                    type="text"
                    className="time-input"
                    placeholder="09:45"
                    maxLength={5}
                    value={p.end}
                    onChange={e => { updatePeriod(p.id, 'end', formatTimeInput(e.target.value)); flash() }}
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
                  <th className="sch-th-period"></th>
                  {DAY_LABELS.map((label, di) => (
                    <th key={di} className="sch-th-day-col">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map(p => (
                  <tr key={p.id}>
                    <td className="sch-td-period">
                      <div>{p.label}</div>
                      <div className="sch-th-time">{p.start}</div>
                    </td>
                    {DAY_LABELS.map((label, di) => {
                      const val = schedule[di]?.[p.id]?.className || ''
                      return (
                        <td key={di} className={`sch-td-cell ${val ? 'has-class' : 'is-free'}`}>
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
