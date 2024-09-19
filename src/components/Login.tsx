'use client'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@/utils/firebase/auth'
import { User } from 'firebase/auth'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkToken = searchParams.get('linkToken')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSignInSuccess = async (user: User) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebaseUserId: user.uid,
        email: user.email,
      }),
    })

    if (linkToken) {
      router.replace(`/line-link?linkToken=${ encodeURIComponent(linkToken) }`)
    } else {
      router.replace('/')
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let user: User
    if (isSignUp) {
      user = await createUserWithEmailAndPassword(email, password)
    } else {
      user = await signInWithEmailAndPassword(email, password)
    }
    await handleSignInSuccess(user)
  }

  return (
    <Box sx={ { mt: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
      <Typography variant="h4" component="h1" gutterBottom>
        { isSignUp ? 'Sign Up' : 'Login' }
      </Typography>
      <Box component="form" onSubmit={ handleSubmit } sx={ { width: '100%', maxWidth: 400 } }>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={ email }
          onChange={ (e) => setEmail(e.target.value) }
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={ password }
          onChange={ (e) => setPassword(e.target.value) }
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={ { mt: 3, mb: 2 } }
        >
          { isSignUp ? 'Sign Up' : 'Sign In' }
        </Button>
      </Box>
      <Button onClick={ () => setIsSignUp(!isSignUp) }>
        { isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up' }
      </Button>
    </Box>
  )
}

export default Login