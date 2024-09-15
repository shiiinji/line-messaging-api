'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { signInWithGoogle } from '@/utils/firebase/auth'
import { User } from 'firebase/auth'

function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkToken = searchParams.get('linkToken')

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle()
      if (user) {
        // ユーザー情報をFirestoreに保存
        await handleSignInSuccess(user)

        if (linkToken) {
          router.replace(`/link?linkToken=${encodeURIComponent(linkToken)}`)
        } else {
          router.replace('/')
        }
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const handleSignInSuccess = async (user: User) => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUserId: user.uid,
          email: user.email,
          displayName: user.displayName,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Box sx={{ mt: 1, minHeight: '100vh' }}>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Button onClick={handleGoogleSignIn}>Sign in with Google</Button>
        </Box>
    </Box>
  )
}

export default Login