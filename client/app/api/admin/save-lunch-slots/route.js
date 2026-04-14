import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request) {
  try {
    const { department, lunchData } = await request.json()

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('universities').updateOne(
      { 'departments.code': department },
      { 
        $set: { 
          'departments.$.timetableData.mdmConfig.lunch': lunchData 
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Department not found' })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving lunch slots:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
