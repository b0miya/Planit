import React, { useState } from 'react'
import useStore from '../store'
import { getWeekDays, formatDate, getToday } from '../utils/date'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function formatTimeInput(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return digits.slice(0, 2) + ':' + digits.slice(2)
}

export default function WeekView() {
  const {
    weekOffset, prevWeek, nextWeek, goToToday,
    selectedDate, setSelectedDate,
    timetable, dailyData,
    setClassAssignment, updatePeriod,
  } = useStore()

  const [editMode, setEditMode] = useState(false)

  const today = getToday()
  const weekDays = getWeekDays(weekOffset)
  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]
  const rangeLabel = `${weekStart.getFullYear()}년 ${weekStart.getMonth()+1}월 ${weekStart.getDate()}일 ~ ${weekEnd.getMonth()+1}월 ${weekEnd.getDate()}일`

  const { periods, schedule, workStart, workEnd } = timetable

  const HEADER_H = 52
  const SLOT_H = 64
  const PERIOD_H = editMode ? 80 : 70   // 편집 모드에서 입력 공간 확보
  const WEEKEND_H = SLOT_H + periods.length * PERIOD_H + SLOT_H

  const handleDayClick = (day) => {
    if (editMode) return
    const d = formatDate(day)
    setSelectedDate(selectedDate === d ? null : d)
  }

  return (
    <div className={`week-view ${editMode ? 'week-edit-mode' : ''}`}>
      {/* ── 네비게이션 ── */}
      <div className="week-nav">
        <div className="week-nav-left">
          {!editMode && (
            <>
              <button className="nav-btn" onClick={prevWeek}>‹</button>
              <span className="week-range">{rangeLabel}</span>
              <button className="nav-btn" onClick={nextWeek}>›</button>
            </>
          )}
          {editMode && (
            <span className="edit-mode-label">✏ 시간표 편집 중 — 셀을 클릭해서 수업을 입력하세요</span>
          )}
        </div>
        <div className="week-nav-right">
          {!editMode && <button className="today-btn" onClick={goToToday}>오늘</button>}
          <button
            className={`edit-toggle-btn ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? '✓ 편집 완료' : '✏ 시간표 편집'}
          </button>
        </div>
      </div>

      {/* ── 주간 격자 ── */}
      <div className="week-body">

        {/* 시간 레이블 열 */}
        <div className="time-col">
          <div className="time-col-header" style={{ height: HEADER_H }}>
            {editMode && <span className="time-col-hint">시작 시간</span>}
          </div>
          <div className="time-slot time-slot-edge" style={{ height: SLOT_H }}>
            <span className="slot-label">출근전</span>
            <span className="time-text">{workStart}</span>
          </div>
          {periods.map(p => (
            <div key={p.id} className="time-slot" style={{ height: PERIOD_H }}>
              <span className="period-label-text">{p.label}</span>
              {editMode ? (
                <input
                  type="text"
                  className="time-edit-input"
                  placeholder="09:00"
                  maxLength={5}
                  value={p.start}
                  onChange={e => updatePeriod(p.id, 'start', formatTimeInput(e.target.value))}
                  title={`${p.label} 시작 시간`}
                />
              ) : (
                <span className="time-text">{p.start}</span>
              )}
            </div>
          ))}
          <div className="time-slot time-slot-edge" style={{ height: SLOT_H }}>
            <span className="slot-label">퇴근후</span>
            <span className="time-text">{workEnd}</span>
          </div>
        </div>

        {/* 전체 7일 열 */}
        <div className="days-area">
          {weekDays.map((day, di) => {
            const dateStr = formatDate(day)
            const data = dailyData[dateStr] || {}
            const isToday = dateStr === today
            const isSel = !editMode && dateStr === selectedDate
            const isWeekend = di >= 5

            if (isWeekend) {
              return (
                <div
                  key={di}
                  className={`weekend-col ${isToday ? 'col-today' : ''} ${isSel ? 'col-selected' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="day-header" style={{ height: HEADER_H }}>
                    <span className="day-name weekend-name">{DAY_LABELS[di]}</span>
                    <span className={`day-date ${isToday ? 'today-badge' : ''}`}>
                      {day.getMonth()+1}/{day.getDate()}
                    </span>
                  </div>
                  <div className="weekend-content" style={{ height: WEEKEND_H }}>
                    {data.todos?.length > 0 ? (
                      <ul className="weekend-todos">
                        {data.todos.map(t => (
                          <li key={t.id} className={t.done ? 'done' : ''}>{t.done ? '✓' : '○'} {t.text}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="weekend-empty">클릭하여{'\n'}일정 추가</span>
                    )}
                    {data.diary && <p className="weekend-diary">{data.diary.slice(0, 60)}</p>}
                  </div>
                </div>
              )
            }

            const doneTodos = data.todos?.filter(t => t.done).length || 0
            const totalTodos = data.todos?.length || 0
            return (
              <div
                key={di}
                className={`weekday-col ${isToday ? 'col-today' : ''} ${isSel ? 'col-selected' : ''} ${editMode ? 'col-edit' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                {/* 헤더 */}
                <div className="day-header" style={{ height: HEADER_H }}>
                  <span className="day-name">{DAY_LABELS[di]}</span>
                  <span className={`day-date ${isToday ? 'today-badge' : ''}`}>
                    {day.getMonth()+1}/{day.getDate()}
                  </span>
                  {!editMode && totalTodos > 0 && (
                    <span className="todo-badge">{doneTodos}/{totalTodos}</span>
                  )}
                </div>

                {/* 출근 전 */}
                <div className="slot before-work" style={{ height: SLOT_H }}>
                  {!editMode && (
                    data.beforeWork
                      ? <span className="note-preview">{data.beforeWork.slice(0, 28)}</span>
                      : <span className="slot-empty">+</span>
                  )}
                </div>

                {/* 교시 셀 */}
                {periods.map(p => {
                  const assign = schedule[di]?.[p.id]
                  const isFree = !assign?.className
                  return (
                    <div
                      key={p.id}
                      className={`period-cell ${isFree ? 'free-period' : 'class-period'} ${editMode ? 'period-editable' : ''}`}
                      style={{ height: PERIOD_H }}
                      onClick={e => editMode && e.stopPropagation()}
                    >
                      {editMode ? (
                        <input
                          type="text"
                          className="cell-edit-input"
                          placeholder="과목 반"
                          value={assign?.className || ''}
                          onChange={e => setClassAssignment(di, p.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        isFree
                          ? <span className="free-label">공강</span>
                          : <span className="class-name">{assign.className}</span>
                      )}
                    </div>
                  )
                })}

                {/* 퇴근 후 */}
                <div className="slot after-work" style={{ height: SLOT_H }}>
                  {!editMode && (
                    data.afterWork
                      ? <span className="note-preview">{data.afterWork.slice(0, 28)}</span>
                      : <span className="slot-empty">+</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
