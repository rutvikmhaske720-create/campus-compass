import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    const client = await clientPromise
    const db = client.db()

    let isValid = false
    const universityWithCoordinator = await db.collection('universities').findOne({
      'departments.coordinator.email': email
    })

    if (universityWithCoordinator) {
      const department = universityWithCoordinator.departments.find(
        dept => dept.coordinator.email === email
      )
      if (department && await bcrypt.compare(password, department.coordinator.passwordHash)) {
        isValid = true
      }
    }

    if (!isValid) {
      const university = await db.collection('universities').findOne({
        'admin.email': email
      })
      if (university && await bcrypt.compare(password, university.admin.passwordHash)) {
        isValid = true
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await db.collection('otps').updateOne(
      { email },
      { $set: { otp, expiresAt: otpExpiry } },
      { upsert: true }
    )

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      })

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Login OTP - University Portal',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Login Verification</h2>
            <p>Your OTP for login is:</p>
            <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1F2937; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #6B7280;">This OTP is valid for 10 minutes.</p>
            <p style="color: #6B7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      })
    } catch (emailError) {
      console.log(`OTP for ${email}: ${otp} (Email failed, check console)`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('send-otp error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 })
  }
}
