import { NextRequest, NextResponse } from 'next/server'
import admin from 'firebase-admin'
import { db } from '@/utils/firebase-admin/initialize'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { uid, email, displayName } = await req.json()

    await db.collection('users').doc(uid).set({
      uid,
      email,
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ message: 'User data added successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error adding user data:', error)
    return NextResponse.json({ error: 'Failed to add user data' }, { status: 500 })
  }
}