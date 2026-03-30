import React, { useState, useRef } from 'react'
import useStore from '../store'
import { isWeekend } from '../utils/date'

function formatDisplayDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 (${days[d.getDay()]}요일)`
}

export default function DayDetail() {
  const { selectedDate, setSelectedDate, getDayData, setDayField, addTodo, toggleTodo, deleteTodo } = useStore()
  const [newTodo, setNewTodo] = useState('')
  const inputRef = useRef(null)

  if (!selectedDate) return null

  const data = getDayData(selectedDate)
  const weekend = isWeekend(new Date(selectedDate))
  const beforeLabel = weekend ? '오전 계획' : '출근 전'
  const afterLabel = weekend ? '오후/저녁 계획' : '퇴근 후'
  const diaryLabel = weekend ? '메모' : '업무 일지'

  const handleAddTodo = (e) => {
    e.preventDefault()
    addTodo(selectedDate, newTodo)
    setNewTodo('')
    inputRef.current?.focus()
  }

  return (
    <div className="day-detail">
      <div className="detail-header">
        <h2 className="detail-title">{formatDisplayDate(selectedDate)}</h2>
        <button className="close-btn" onClick={() => setSelectedDate(null)}>✕</button>
      </div>

      <div className="detail-body">
        <section className="detail-section">
          <h3 className="section-title">{beforeLabel}</h3>
          <textarea
            className="detail-textarea"
            rows={2}
            placeholder={weekend ? '오전 계획을 입력하세요...' : '출근 전 준비할 것, 아침 계획...'}
            value={data.beforeWork}
            onChange={e => setDayField(selectedDate, 'beforeWork', e.target.value)}
          />
        </section>

        <div className="detail-columns">
          <section className="detail-section section-todos">
            <h3 className="section-title">
              할 일 목록
              <span className="todo-count">{data.todos.filter(t=>t.done).length}/{data.todos.length}</span>
            </h3>
            <ul className="todo-list">
              {data.todos.map(todo => (
                <li key={todo.id} className={`todo-item ${todo.done ? 'done' : ''}`}>
                  <button className="todo-check" onClick={() => toggleTodo(selectedDate, todo.id)}>
                    {todo.done ? '✓' : '○'}
                  </button>
                  <span className="todo-text">{todo.text}</span>
                  <button className="todo-delete" onClick={() => deleteTodo(selectedDate, todo.id)}>✕</button>
                </li>
              ))}
            </ul>
            <form className="todo-add-form" onSubmit={handleAddTodo}>
              <input
                ref={inputRef}
                className="todo-input"
                type="text"
                placeholder="할 일 추가..."
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
              />
              <button type="submit" className="todo-add-btn">추가</button>
            </form>
          </section>

          <section className="detail-section section-diary">
            <h3 className="section-title">{diaryLabel}</h3>
            <textarea
              className="detail-textarea diary-textarea"
              placeholder={weekend ? '오늘 하루를 기록하세요...' : '수업 내용, 업무 현황, 특이사항...'}
              value={data.diary}
              onChange={e => setDayField(selectedDate, 'diary', e.target.value)}
            />
          </section>
        </div>

        <section className="detail-section">
          <h3 className="section-title">{afterLabel}</h3>
          <textarea
            className="detail-textarea"
            rows={2}
            placeholder={weekend ? '오후/저녁 계획을 입력하세요...' : '퇴근 후 개인 시간, 복기...'}
            value={data.afterWork}
            onChange={e => setDayField(selectedDate, 'afterWork', e.target.value)}
          />
        </section>
      </div>
    </div>
  )
}
