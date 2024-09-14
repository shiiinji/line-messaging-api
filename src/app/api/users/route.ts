import { NextResponse } from 'next/server'
import admin from 'firebase-admin'

// Firebase Adminの初期化
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

const db = admin.firestore()

export async function POST(request: Request) {
  try {
    const { uid, email, displayName } = await request.json()

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