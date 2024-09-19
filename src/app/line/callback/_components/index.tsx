'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/utils/firebase/auth'
import Cookies from 'js-cookie'

export function LineCallbackPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const processLineLogin = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const storedState = Cookies.get('lineLoginState') ?? ''
      const storedNonce = Cookies.get('lineLoginNonce') ?? ''
      const codeVerifier = Cookies.get('lineCodeVerifier') ?? ''

      console.log('Received parameters:', { code, state })
      console.log('Stored values:', { storedState, storedNonce, codeVerifier })

      if (!code) {
        console.error('認可コードが存在しません')
        router.push('/')
        return
      }

      if (state !== storedState) {
        console.error('stateが一致しません')
        router.push('/')
        return
      }

      // Cookieを削除
      Cookies.remove('lineLoginState')
      Cookies.remove('lineLoginNonce')
      Cookies.remove('lineCodeVerifier')

      const lineChannelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID ?? ''
      const redirectUri = `${process.env.NEXT_PUBLIC_DOMAIN}/line/callback`

      const params = new URLSearchParams()
      params.append('grant_type', 'authorization_code')
      params.append('code', code)
      params.append('redirect_uri', redirectUri)
      params.append('client_id', lineChannelId)
      params.append('code_verifier', codeVerifier)

      console.log(params.toString())

      try {
        const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        })

        const data = await response.json()

        const accessToken = data.access_token

        // ユーザー情報を取得
        const user = await getCurrentUser()
        if (!user) {
          console.error('ユーザーが未認証です')
          router.push('/login')
          return
        }

        // LINEのプロフィール情報を取得
        const lineProfileResponse = await fetch('https://api.line.me/v2/profile', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        const lineProfile = await lineProfileResponse.json()


        // LINEユーザー情報を取得してFirebaseユーザーと紐付け
        await fetch('/api/users', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseUserId: user.uid,
            lineProfile: {
              userId: lineProfile.userId,
              displayName: lineProfile.displayName,
              pictureUrl: lineProfile.pictureUrl
            }
          }),
        })

        router.push('/')
      } catch (error) {
        console.error('LINEログイン処理中にエラーが発生しました', error)
        router.push('/')
      }
    }

    processLineLogin()
  }, [searchParams])

  return <div>LINEログイン連携中...</div>
}
