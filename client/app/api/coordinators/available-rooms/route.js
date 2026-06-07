import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import clientPromise from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const departmentName = searchParams.get('department')
    const day = searchParams.get('day')
    const fromTime = searchParams.get('fromTime')
    const toTime = searchParams.get('toTime')
    
    const client = await clientPromise
    const db = client.db()
    
    const university = await db.collection('universities').findOne({
      'departments.coordinator.email': session.user.email
    })
    
    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }
    
    const department = university.departments.find(
      dept => dept.name === departmentName
    )
    
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }
    
    const schedule = department.selectedSchedule?.scheduleData || []
    const timeSlots = department.timetableData?.timeSlots || []
    const rooms = department.timetableData?.rooms || []
    
    // Get time slot indices for range check
    const fromIndex = timeSlots.indexOf(fromTime)
    const toIndex = timeSlots.indexOf(toTime)
    const requiredSlots = timeSlots.slice(fromIndex, toIndex + 1)
    
    // Find rooms busy in ANY of the required time slots
    const busyRoomsBySlot = requiredSlots.map(slot => 
      schedule
        .filter(s => 
          (s.Day || s.day) === day && 
          (s.Time || s.time) === slot
        )
        .map(s => s.Room || s.room)
    )
    
    const busyRooms = [...new Set(busyRoomsBySlot.flat())]
    
    // Get available rooms
    const availableRooms = rooms
      .filter(r => !busyRooms.includes(r.name))
      .map(r => ({
        name: r.name,
        type: r.type,
        capacity: r.capacity
      }))
    
    return NextResponse.json({ 
      success: true, 
      rooms: availableRooms 
    })
  } catch (error) {
    console.error('Error fetching available rooms:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
