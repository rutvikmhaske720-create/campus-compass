import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { universityName, adminEmail, adminPassword, departments } = body

    if (!universityName || !adminEmail || !adminPassword || !departments?.length) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if university already exists
    const existingUniversity = await db.collection('universities').findOne({
      name: universityName
    })

    if (existingUniversity) {
      return NextResponse.json({ 
        success: false, 
        error: 'University already exists' 
      }, { status: 400 })
    }

    // Hash admin password
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12)

    // Generate coordinator credentials
    const departmentsWithCoordinators = departments.map((dept) => {
      const coordinatorEmail = `coordinator-${dept.toLowerCase().replace(/\s+/g, '-')}@${universityName.toLowerCase().replace(/\s+/g, '-')}.edu`
      const coordinatorPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      
      return {
        name: dept,
        coordinator: {
          email: coordinatorEmail,
          password: coordinatorPassword,
          passwordHash: bcrypt.hashSync(coordinatorPassword, 12)
        },
        stats: {
          students: 0,
          faculty: 0
        }
      }
    })

    // Create university document
    const universityDoc = {
      name: universityName,
      admin: {
        email: adminEmail,
        passwordHash: adminPasswordHash
      },
      departments: departmentsWithCoordinators,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Insert into database
    const result = await db.collection('universities').insertOne(universityDoc)

    if (!result.insertedId) {
      throw new Error('Failed to create university')
    }

    // Return success with credentials
    const credentials = departmentsWithCoordinators.map(dept => ({
      department: dept.name,
      email: dept.coordinator.email,
      password: dept.coordinator.password
    }))

    return NextResponse.json({
      success: true,
      universityId: result.insertedId,
      credentials: credentials
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}