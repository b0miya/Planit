import React, { useEffect } from 'react'
import useStore from './store'
import WeekView from './components/WeekView'
import DayDetail from './components/DayDetail'
import Settings from './components/Settings'
import { onAuthChange, signInWithGoogle, signOut, isFirebaseConfigured } from './firebase'

export default function App() {
  const { page, setPage, user, setUser, syncStatus } = useStore()

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser
        ? { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }
        : null
      )
    })
    return unsubscribe
  }, [])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      alert('로그인 실패: ' + err.message)
    }
  }

  const handleSignOut = async () => {
    if (confirm('로그아웃 하시겠습니까?')) await signOut()
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">📅 Planit</span>
        </div>
        <nav className="header-nav">
          <button className={`nav-tab ${page === 'main' ? 'active' : ''}`} onClick={() => setPage('main')}>
            주간 일정
          </button>
          <button className={`nav-tab ${page === 'settings' ? 'active' : ''}`} onClick={() => setPage('settings')}>
            ⚙ 시간표 설정
          </button>
        </nav>
        <div className="header-right">
          {isFirebaseConfigured ? (
            user ? (
              <div className="user-info">
                {syncStatus === 'syncing' && <span className="sync-badge syncing">동기화 중...</span>}
                {syncStatus === 'synced' && <span className="sync-badge synced">✓ 동기화됨</span>}
                <span className="user-name">{user.displayName || user.email}</span>
                <button className="sign-out-btn" onClick={handleSignOut}>로그아웃</button>
              </div>
            ) : (
              <button className="sign-in-btn" onClick={handleSignIn}>Google로 동기화</button>
            )
          ) : (
            <span className="offline-badge" title="Firebase 미설정 - 브라우저 로컬 저장">로컬 저장</span>
          )}
        </div>
      </header>

      <main className="app-main">
        {page === 'main' && (
          <>
            <WeekView />
            <DayDetail />
          </>
        )}
        {page === 'settings' && <Settings />}
      </main>
    </div>
  )
}
