'use client'
import { FirebaseApp, initializeApp } from 'firebase/app'

let firebaseAppInstance: FirebaseApp | null = null

export function initializeFirebase(config: object) {
  if (!firebaseAppInstance) {
    firebaseAppInstance = initializeApp(config)
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  return firebaseAppInstance
}
