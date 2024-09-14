'use client'
import { useEffect } from 'react'
import { initializeFirebase } from '@/utils/firebase/initialize'

type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
}

type Props = {
  config: FirebaseConfig
}

export function FirebaseInitializer(props: Props) {
  useEffect(() => {
    initializeFirebase(props.config)
  }, [])

  return null
}
