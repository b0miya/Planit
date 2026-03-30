import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_PERIODS = [
  { id: 1, label: '1교시', start: '09:00', end: '09:45' },
  { id: 2, label: '2교시', start: '09:55', end: '10:40' },
  { id: 3, label: '3교시', start: '10:50', end: '11:35' },
  { id: 4, label: '4교시', start: '11:45', end: '12:30' },
  { id: 5, label: '5교시', start: '13:30', end: '14:15' },
  { id: 6, label: '6교시', start: '14:25', end: '15:10' },
  { id: 7, label: '7교시', start: '15:20', end: '16:05' },
]

function makeDefaultSchedule() {
  const s = {}
  for (let d = 0; d < 5; d++) {
    s[d] = {}
    for (let p = 1; p <= 7; p++) s[d][p] = { className: '' }
  }
  return s
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const useStore = create(
  persist(
    (set, get) => ({
      weekOffset: 0,
      selectedDate: null,
      page: 'main',

      timetable: {
        periods: DEFAULT_PERIODS,
        schedule: makeDefaultSchedule(),
        workStart: '08:30',
        workEnd: '17:00',
      },

      dailyData: {},
      user: null,
      syncStatus: 'idle',

      prevWeek: () => set(s => ({ weekOffset: s.weekOffset - 1 })),
      nextWeek: () => set(s => ({ weekOffset: s.weekOffset + 1 })),
      goToToday: () => {
        const d = new Date()
        const pad = n => String(n).padStart(2, '0')
        set({ weekOffset: 0, selectedDate: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` })
      },
      setSelectedDate: (date) => set({ selectedDate: date }),
      setPage: (page) => set({ page }),

      setWorkTime: (workStart, workEnd) =>
        set(s => ({ timetable: { ...s.timetable, workStart, workEnd } })),

      updatePeriod: (id, field, value) =>
        set(s => ({
          timetable: {
            ...s.timetable,
            periods: s.timetable.periods.map(p => p.id === id ? { ...p, [field]: value } : p)
          }
        })),

      setClassAssignment: (dayIdx, periodId, className) =>
        set(s => ({
          timetable: {
            ...s.timetable,
            schedule: {
              ...s.timetable.schedule,
              [dayIdx]: { ...s.timetable.schedule[dayIdx], [periodId]: { className } }
            }
          }
        })),

      getDayData: (date) => get().dailyData[date] || { beforeWork: '', afterWork: '', todos: [], diary: '' },

      setDayField: (date, field, value) =>
        set(s => ({
          dailyData: {
            ...s.dailyData,
            [date]: { ...get().getDayData(date), ...s.dailyData[date], [field]: value }
          }
        })),

      addTodo: (date, text) => {
        if (!text.trim()) return
        const day = get().getDayData(date)
        set(s => ({
          dailyData: {
            ...s.dailyData,
            [date]: { ...day, todos: [...day.todos, { id: genId(), text: text.trim(), done: false }] }
          }
        }))
      },

      toggleTodo: (date, id) => {
        const day = get().getDayData(date)
        set(s => ({
          dailyData: {
            ...s.dailyData,
            [date]: { ...day, todos: day.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }
          }
        }))
      },

      deleteTodo: (date, id) => {
        const day = get().getDayData(date)
        set(s => ({
          dailyData: {
            ...s.dailyData,
            [date]: { ...day, todos: day.todos.filter(t => t.id !== id) }
          }
        }))
      },

      setUser: (user) => set({ user }),
      setSyncStatus: (syncStatus) => set({ syncStatus }),
    }),
    {
      name: 'planit-v1',
      partialize: (state) => ({
        timetable: state.timetable,
        dailyData: state.dailyData,
        user: state.user ? { uid: state.user.uid, email: state.user.email, displayName: state.user.displayName } : null,
      })
    }
  )
)

export default useStore
