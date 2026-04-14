import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const universityId = searchParams.get('universityId')
    
    if (!universityId) {
      return NextResponse.json({ error: 'University ID required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('university_system')
    
    const university = await db.collection('universities').findOne({
      _id: new ObjectId(universityId)
    })
    
    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, university })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}