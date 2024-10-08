'use client'
import {
  getAuth,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth,
  createUserWithEmailAndPassword as firebaseCreateUser,
  signInWithEmailAndPassword as firebaseSignIn,
} from 'firebase/auth'
import { getFirebaseApp } from './initialize'

let authInstance: Auth | null = null

export async function getAuthInstance(): Promise<Auth | null> {
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

export async function createUserWithEmailAndPassword(email: string, password: string): Promise<User> {
  const auth = await getAuthInstance()

  if (!auth) {
    throw new Error('Auth not initialized')
  }

  const userCredential = await firebaseCreateUser(auth, email, password)
  return userCredential.user
}

export async function signInWithEmailAndPassword(email: string, password: string): Promise<User> {
  const auth = await getAuthInstance()

  if (!auth) {
    throw new Error('Auth not initialized')
  }

  const userCredential = await firebaseSignIn(auth, email, password)
  return userCredential.user
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