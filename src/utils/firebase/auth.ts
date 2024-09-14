'use client'
import {
  getAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth,
  GoogleAuthProvider,
} from 'firebase/auth'
import { getFirebaseApp } from './initialize'

let authInstance: Auth | null = null

async function getAuthInstance(): Promise<Auth | null> {
  if (typeof window === 'undefined') {
    return null
  }

  const app = getFirebaseApp()
  if (!app) {
    console.error('Firebase app not initialized. Call initializeFirebase first.')
    return null
  }

  if (!authInstance) {
    authInstance = getAuth(app)
  }

  return authInstance
}

export async function signInWithGoogle(): Promise<User | null> {
  const auth = await getAuthInstance()
  if (!auth) {
    console.warn('Auth not initialized')
    return null
  }

  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    return null
  }
}

export async function signOut(): Promise<void> {
  const auth = await getAuthInstance()
  if (!auth) {
    throw new Error('Auth not initialized')
  }

  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const auth = await getAuthInstance()
  if (!auth) {
    console.warn('Auth not initialized')
    return null
  }

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

export async function onAuthStateChange(callback: (user: User | null) => void): Promise<() => void> {
  const auth = await getAuthInstance()
  if (!auth) {
    throw new Error('Auth not initialized')
  }

  return onAuthStateChanged(auth, callback)
}