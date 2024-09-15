'use client'
import Button from '@mui/material/Button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/utils/firebase/auth'
import { Typography } from '@mui/material'
import { User } from 'firebase/auth'

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

  const handleLineConnect = () => {
    const lineAddFriendUrl = process.env.NEXT_PUBLIC_LINE_FRIEND_ADD_URL

    if (!lineAddFriendUrl) {
      throw new Error('LINE友だち追加URLが設定されていません')
    }

    window.location.href = lineAddFriendUrl
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
