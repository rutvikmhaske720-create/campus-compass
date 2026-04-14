import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import clientPromise from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'coordinator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const departmentName = searchParams.get('department')
    
    console.log('Fetching department:', departmentName, 'for user:', session.user.email)
    
    const client = await clientPromise
    const db = client.db()
    
    // First, let's check if any universities exist
    const universityCount = await db.collection('universities').countDocuments()
    console.log('Total universities in DB:', universityCount)
    
    const university = await db.collection('universities').findOne({
      'departments.coordinator.email': session.user.email
    })
    
    console.log('Found university:', university ? 'Yes' : 'No')
    
    if (!university) {
      // Return a default department structure for development
      return NextResponse.json({ 
        success: true, 
        department: {
          name: departmentName,
          stats: { students: 0, faculty: 0, courses: 0 },
          vision: 'Department vision not set',
          mission: 'Department mission not set'
        }
      })
    }
    
    const department = university.departments.find(
      dept => dept.name === departmentName
    )
    
    console.log('Found department:', department ? 'Yes' : 'No')
    
    if (!department) {
      // Return a default department structure
      return NextResponse.json({ 
        success: true, 
        department: {
          name: departmentName,
          stats: { students: 0, faculty: 0, courses: 0 },
          vision: 'Department vision not set',
          mission: 'Department mission not set'
        }
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      department: {
        name: department.name,
        stats: department.stats || { students: 0, faculty: 0, courses: 0 },
        vision: department.vision || 'Department vision not set',
        mission: department.mission || 'Department mission not set',
        timetableData: department.timetableData || null,
        pecConfig: department.pecConfig || null,
        selectedSchedule: department.selectedSchedule || null,
        onlineConfig: department.onlineConfig || null,
        facultyAvailability: department.facultyAvailability || null
      }
    })
  } catch (error) {
    console.error('Department fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'coordinator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { department, tyPecTheorySlots, tyPecLabSlots, btechPecTheorySlots, btechPecLabSlots, fileName, fileData, analytics, timeSlots, selectedSchedule, updateScheduleData, onlineConfig, facultyAvailability } = body
    
    const client = await clientPromise
    const db = client.db()
    
    const university = await db.collection('universities').findOne({
      'departments.coordinator.email': session.user.email
    })
    
    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }
    
    const updateData = {}
    
    // Update PEC config if provided
    if (tyPecTheorySlots !== undefined) {
      updateData['departments.$.pecConfig'] = {
        TY: {
          theory: tyPecTheorySlots,
          lab: tyPecLabSlots
        },
        BTech: {
          theory: btechPecTheorySlots,
          lab: btechPecLabSlots
        },
        updatedAt: new Date()
      }
    }
    
    // Update timetable data if provided
    if (fileName && fileData) {
      updateData['departments.$.timetableData'] = {
        fileName,
        fileData,
        analytics,
        timeSlots,
        uploadedAt: new Date()
      }
    }
    
    // Save selected schedule if provided
    if (selectedSchedule) {
      updateData['departments.$.selectedSchedule'] = selectedSchedule
    }
    
    // Update schedule data if provided (for room replacement)
    if (updateScheduleData) {
      updateData['departments.$.selectedSchedule.scheduleData'] = updateScheduleData
    }
    
    // Save online config if provided
    if (onlineConfig !== undefined) {
      updateData['departments.$.onlineConfig'] = onlineConfig
    }
    
    // Save faculty availability if provided
    if (facultyAvailability !== undefined) {
      updateData['departments.$.facultyAvailability'] = facultyAvailability
    }
    
    await db.collection('universities').updateOne(
      { 
        _id: university._id,
        'departments.name': department
      },
      { $set: updateData }
    )
    
    return NextResponse.json({ 
      success: true,
      message: 'Data saved successfully'
    })
  } catch (error) {
    console.error('Error saving data:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}