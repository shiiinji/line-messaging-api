'use client'
import Button from '@mui/material/Button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/utils/firebase/auth'
import { Typography } from '@mui/material'
import { User } from 'firebase/auth'
import Cookies from 'js-cookie'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    checkUser()
  }, [])

  const generateRandomString = (length = 43) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const generateCodeChallenge = async (codeVerifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);

    return base64URLEncode(digest);
  }

  const base64URLEncode = (buffer: ArrayBuffer) => {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer) as any))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }


  const handleLineConnect = async () => {
    const lineChannelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_DOMAIN}/line/callback`
    const state = generateRandomString()
    const nonce = generateRandomString()
    const codeVerifier = generateRandomString(128)
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    Cookies.set('lineLoginState', state)
    Cookies.set('lineLoginNonce', nonce)
    Cookies.set('lineCodeVerifier', codeVerifier)

    const scope = 'openid%20profile'
    const botPrompt = 'normal'

    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${lineChannelId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}&scope=${scope}&nonce=${nonce}&bot_prompt=${botPrompt}&code_challenge=${codeChallenge}&code_challenge_method=S256`

    window.location.href = lineAuthUrl
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      { user ? (
        <>
          <Typography variant="h6">ログイン済み: { user.email }</Typography>
          <Button
            variant="contained"
            color="success"
            onClick={ handleLineConnect }
            sx={ { mt: 2 } }
          >
            LINEと連携する
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={ () => router.push('/login') }
        >
          ログイン
        </Button>
      ) }
    </div>
  );
}
