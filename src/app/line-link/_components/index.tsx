'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/utils/firebase/auth'

export function LinkPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkToken = searchParams.get('linkToken')

  useEffect(() => {
    const processLinking = async () => {
      if (!linkToken) {
        console.error('linkTokenが存在しません')
        router.push('/')
        return
      }

      const user = await getCurrentUser()

      if (!user) {
        // 未認証の場合、ログインページにリダイレクトし、linkTokenをクエリパラメータとして渡す
        router.push(`/login?linkToken=${encodeURIComponent(linkToken)}`)
        return
      }

      const response = await fetch('/api/line/nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebaseUserId: user.uid }),
      })

      if (!response.ok) {
        console.error('nonceの生成に失敗しました')
        router.push('/')
        return
      }

      const data = await response.json()
      const nonce = data.nonce
      const accountLinkUrl = `https://access.line.me/dialog/bot/accountLink?linkToken=${linkToken}&nonce=${encodeURIComponent(
        nonce
      )}`
      window.location.href = accountLinkUrl
    }

    processLinking()
  }, [linkToken, router])

  return <div>Processing...</div>
}
