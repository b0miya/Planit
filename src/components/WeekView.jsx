import React from 'react'
import useStore from '../store'
import { getWeekDays, formatDate, getToday } from '../utils/date'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

export default function WeekView() {
  const { weekOffset, prevWeek, nextWeek, goToToday, selectedDate, setSelectedDate, timetable, dailyData } = useStore()

  const today = getToday()
  const weekDays = getWeekDays(weekOffset)
  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]
  const rangeLabel = `${weekStart.getFullYear()}년 ${weekStart.getMonth()+1}월 ${weekStart.getDate()}일 ~ ${weekEnd.getMonth()+1}월 ${weekEnd.getDate()}일`

  const { periods, schedule, workStart, workEnd } = timetable

  const HEADER_H = 52
  const SLOT_H = 64
  const PERIOD_H = 70
  const WEEKEND_H = SLOT_H + periods.length * PERIOD_H + SLOT_H

  const toggle = (day) => {
    const d = formatDate(day)
    setSelectedDate(selectedDate === d ? null : d)
  }

  return (
    <div className="week-view">
      <div className="week-nav">
        <div className="week-nav-left">
          <button className="nav-btn" onClick={prevWeek}>‹</button>
          <span className="week-range">{rangeLabel}</span>
          <button className="nav-btn" onClick={nextWeek}>›</button>
        </div>
        <button className="today-btn" onClick={goToToday}>오늘</button>
      </div>

      <div className="week-body">
        {/* 시간 레이블 열 */}
        <div className="time-col">
          <div className="time-col-header" style={{ height: HEADER_H }} />
          <div className="time-slot time-slot-edge" style={{ height: SLOT_H }}>
            <span className="time-text">{workStart}</span>
            <span className="slot-label">출근전</span>
          </div>
          {periods.map(p => (
            <div key={p.id} className="time-slot" style={{ height: PERIOD_H }}>
              <span className="period-label-text">{p.label}</span>
              <span className="time-text">{p.start}</span>
            </div>
          ))}
          <div className="time-slot time-slot-edge" style={{ height: SLOT_H }}>
            <span className="time-text">{workEnd}</span>
            <span className="slot-label">퇴근후</span>
          </div>
        </div>

        {/* 평일 열 */}
        <div className="weekdays-area">
          {weekDays.slice(0, 5).map((day, di) => {
            const dateStr = formatDate(day)
            const data = dailyData[dateStr] || {}
            const isToday = dateStr === today
            const isSel = dateStr === selectedDate
            const doneTodos = data.todos?.filter(t => t.done).length || 0
            const totalTodos = data.todos?.length || 0

            return (
              <div key={di} className={`weekday-col ${isToday ? 'col-today' : ''} ${isSel ? 'col-selected' : ''}`} onClick={() => toggle(day)}>
                <div className="day-header" style={{ height: HEADER_H }}>
                  <span className="day-name">{DAY_LABELS[di]}</span>
                  <span className={`day-date ${isToday ? 'today-badge' : ''}`}>{day.getMonth()+1}/{day.getDate()}</span>
                  {totalTodos > 0 && <span className="todo-badge">{doneTodos}/{totalTodos}</span>}
                </div>
                <div className="slot before-work" style={{ height: SLOT_H }}>
                  {data.beforeWork ? <span className="note-preview">{data.beforeWork.slice(0, 28)}</span> : <span className="slot-empty">+</span>}
                </div>
                {periods.map(p => {
                  const assign = schedule[di]?.[p.id]
                  const isFree = !assign?.className
                  return (
                    <div key={p.id} className={`period-cell ${isFree ? 'free-period' : 'class-period'}`} style={{ height: PERIOD_H }}>
                      {isFree ? <span className="free-label">공강</span> : <span className="class-name">{assign.className}</span>}
                    </div>
                  )
                })}
                <div className="slot after-work" style={{ height: SLOT_H }}>
                  {data.afterWork ? <span className="note-preview">{data.afterWork.slice(0, 28)}</span> : <span className="slot-empty">+</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* 주말 열 */}
        <div className="weekend-area">
          {weekDays.slice(5).map((day, wi) => {
            const dateStr = formatDate(day)
            const data = dailyData[dateStr] || {}
            const isToday = dateStr === today
            const isSel = dateStr === selectedDate

            return (
              <div key={wi} className={`weekend-col ${isToday ? 'col-today' : ''} ${isSel ? 'col-selected' : ''}`} onClick={() => toggle(day)}>
                <div className="day-header" style={{ height: HEADER_H }}>
                  <span className="day-name weekend-name">{DAY_LABELS[5+wi]}</span>
                  <span className={`day-date ${isToday ? 'today-badge' : ''}`}>{day.getMonth()+1}/{day.getDate()}</span>
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
          })}
        </div>
      </div>
    </div>
  )
}
