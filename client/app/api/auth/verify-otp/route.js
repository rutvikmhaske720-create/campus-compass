import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request) {
  try {
    const { email, otp } = await request.json()
    const client = await clientPromise
    const db = client.db()

    const otpDoc = await db.collection('otps').findOne({ email })

    if (!otpDoc || otpDoc.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    }

    if (new Date() > otpDoc.expiresAt) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 401 })
    }

    await db.collection('otps').deleteOne({ email })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
