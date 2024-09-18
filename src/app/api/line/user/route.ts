import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/firebase-admin/initialize'
import admin from 'firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firebaseUserId, lineUserId } = body

    console.log('firebaseUserId', firebaseUserId)
    console.log('lineUserId', lineUserId)

    await db
      .collection('users')
      .doc(firebaseUserId)
      .set(
        {
          lineUserId: lineUserId,
          linkedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

    NextResponse.json({ message: 'LINEアカウントを紐付けました' }, { status: 200 })
  } catch (error) {
    console.error('ユーザーデータの更新中にエラーが発生しました', error)
    NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
