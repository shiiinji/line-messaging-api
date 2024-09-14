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
    // ここにLINE連携のロジックを実装
    console.log('LINE連携を開始します')
    // 実際の連携ロジックをここに追加
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
