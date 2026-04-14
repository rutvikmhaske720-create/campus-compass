import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import clientPromise from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const client = await clientPromise
    const db = client.db()
    
    const university = await db.collection('universities').findOne({
      'admin.email': session.user.email
    })
    
    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }
    
    // Extract credentials
    const credentials = university.departments.map(dept => ({
      department: dept.name,
      email: dept.coordinator.email,
      password: dept.coordinator.plainPassword
    }))
    
    return NextResponse.json({ 
      success: true, 
      credentials
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}