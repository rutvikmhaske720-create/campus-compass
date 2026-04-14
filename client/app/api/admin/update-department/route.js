import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import clientPromise from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { universityId, departmentName, updates } = await request.json()
    
    const client = await clientPromise
    const db = client.db()
    
    // Check if this is a detailed update (has coordinator and department fields)
    let updateFields = {}
    
    if (updates.coordinator && updates.department) {
      // Detailed update for coordinator and department info
      updateFields = {
        'departments.$.code': updates.department.code,
        'departments.$.established': updates.department.established,
        'departments.$.building': updates.department.building,
        'departments.$.stats.students': updates.department.students,
        'departments.$.stats.faculty': updates.department.faculty,
        'departments.$.coordinator.name': updates.coordinator.name,
        'departments.$.coordinator.email': updates.coordinator.email,
        'departments.$.coordinator.phone': updates.coordinator.phone,
        'updatedAt': new Date()
      }
    } else {
      // Original update logic
      updateFields = {
        'departments.$.stats': updates.stats,
        'departments.$.vision': updates.vision,
        'departments.$.mission': updates.mission,
        'updatedAt': new Date()
      }
    }
    
    const result = await db.collection('universities').updateOne(
      { 
        _id: new ObjectId(universityId),
        'departments.name': departmentName
      },
      { 
        $set: updateFields
      }
    )
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Department not found or no changes made' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const { name, code, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 })
    }

    const university = await db.collection('universities').findOne({ 'admin.email': session.user.email })
    if (!university) {
      return NextResponse.json({ success: false, message: 'University not found' }, { status: 404 })
    }

    // Check if email already exists
    const existingDept = university.departments?.find(dept => dept.coordinator?.email === email)
    if (existingDept) {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.collection('universities').updateOne(
      { _id: university._id },
      { 
        $push: { 
          departments: {
            name,
            code,
            coordinator: { 
              email,
              passwordHash: hashedPassword,
              plainPassword: password
            },
            stats: { students: 0, faculty: 0, classes: 0 },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }
    )

    return NextResponse.json({ success: true, credentials: { email, password } })
  } catch (error) {
    console.error('Error adding department:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}