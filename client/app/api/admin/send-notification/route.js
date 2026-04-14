import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import clientPromise from '@/lib/mongodb'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { recipient, department, title, body } = await request.json()
    
    const client = await clientPromise
    const db = client.db()

    const university = await db.collection('universities').findOne({
      'admin.email': session.user.email
    })

    if (!university) {
      return NextResponse.json({ success: false, message: 'University not found' }, { status: 404 })
    }

    let recipients = []
    if (recipient === 'all') {
      recipients = university.departments.map(dept => ({
        name: dept.name,
        email: dept.coordinator?.email
      })).filter(r => r.email)
    } else if (recipient === 'department' && department) {
      const dept = university.departments.find(d => d.name === department)
      if (dept?.coordinator?.email) {
        recipients = [{ name: dept.name, email: dept.coordinator.email }]
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, message: 'No recipients found' }, { status: 400 })
    }

    const notification = {
      universityId: university._id,
      sender: session.user.email,
      recipient,
      department: recipient === 'department' ? department : null,
      title,
      body,
      recipients: recipients.map(r => r.email),
      sentAt: new Date(),
      status: 'sent'
    }

    await db.collection('notifications').insertOne(notification)

    console.log('Notification sent:', {
      to: recipients.map(r => r.email),
      title,
      body
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent successfully',
      recipientCount: recipients.length
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
