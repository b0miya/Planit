import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import {
  getFirestore,
  doc, setDoc, getDoc,
  collection, getDocs
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = !!firebaseConfig.apiKey

let auth, db

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export async function signInWithGoogle() {
  if (!isFirebaseConfigured) throw new Error('Firebase가 설정되지 않았습니다.')
  const result = await signInWithPopup(auth, new GoogleAuthProvider())
  return result.user
}

export async function signOut() {
  if (auth) await firebaseSignOut(auth)
}

export function onAuthChange(callback) {
  if (!isFirebaseConfigured) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

export async function saveTimetable(uid, timetable) {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'settings', 'timetable'), timetable)
}

export async function loadTimetable(uid) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'users', uid, 'settings', 'timetable'))
  return snap.exists() ? snap.data() : null
}

export async function saveDayData(uid, date, data) {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'days', date), data, { merge: true })
}

export async function loadAllDayData(uid) {
  if (!db) return {}
  const snap = await getDocs(collection(db, 'users', uid, 'days'))
  const result = {}
  snap.forEach(d => { result[d.id] = d.data() })
  return result
}
