'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import { signInWithGoogle, getCurrentUser } from '@/utils/firebase/auth'
import { User } from 'firebase/auth'

function Login() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser()
      if (user) {
        handleSignInSuccess(user)
      }
    }
    checkUser()
  }, [])

  const handleSignInSuccess = async (user: User) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to add user data to Firestore')
    }

    router.push('/')
  }

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle()
      if (user) {
        handleSignInSuccess(user)
      }
    } catch (err) {
      console.error('Error signing in with Google:', err)
      setError('Failed to sign in with Google. Please try again.')
    }
  }

  return (
    <Box sx={{ mt: 1, minHeight: '100vh' }}>
        <Box sx={{ mt: 2, mb: 2 }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={handleGoogleSignIn}>Sign in with Google</button>
        </Box>
    </Box>
  )
}

export default Login