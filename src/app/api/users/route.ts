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
    const { firebaseUserId, email } = await req.json()

    await db.collection('users').doc(firebaseUserId).set({
      firebaseUserId,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ message: 'User data added successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error adding user data:', error)
    return NextResponse.json({ error: 'Failed to add user data' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { firebaseUserId, lineProfile } = await req.json()

    if (!firebaseUserId || !lineProfile || !lineProfile.userId) {
      return NextResponse.json({ error: 'Invalid LINE profile data' }, { status: 400 })
    }

    await db.collection('users').doc(firebaseUserId).update({
      lineUserId: lineProfile.userId,
      lineDisplayName: lineProfile.displayName || null,
      linePictureUrl: lineProfile.pictureUrl || null,
      lineLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ message: 'LINE account linked successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error linking LINE account:', error)
    return NextResponse.json({ error: 'Failed to link LINE account' }, { status: 500 })
  }
}
