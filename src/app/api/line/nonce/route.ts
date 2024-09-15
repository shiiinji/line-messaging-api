import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/firebase-admin/initialize'
import admin from 'firebase-admin'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firebaseUserId } = body

    if (!firebaseUserId) {
      return NextResponse.json({ error: 'Missing firebaseUserId' }, { status: 400 })
    }

    const nonce = crypto.randomBytes(16).toString('hex')
    await db.collection('account_link_nonces').add({
      nonce,
      firebaseUserId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      usedAt: null,
    })

    return NextResponse.json({ nonce }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ status: 500 })
  }
}
