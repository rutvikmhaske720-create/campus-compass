import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const wb = XLSX.utils.book_new()

    const roomsData = [['Rooms', 'Type'], ['R101', 'Theory'], ['LAB1', 'Lab']]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(roomsData), 'Rooms')

    const timeData = [
      ['Index', 'Slot'],
      [1, '08:30-09:25'],
      [2, '09:25-10:20'],
      [3, '10:30-11:25'],
      [4, '11:25-12:20'],
      [5, '12:20-13:15'],
      [6, '13:15-14:10'],
      [7, '14:10-15:05'],
      [8, '15:15-16:10'],
      [9, '16:10-17:50'],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(timeData), 'Time')

    const studentData = [
      ['Batch', 'Type'],
      ['FY_A', 'Theory'],
      ['FY_A1', 'Lab'],
      ['FY_A2', 'Lab'],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(studentData), 'Student')

    const facultyData = [
      ['Name of Faculty', 'Course Name', 'Batch', 'Theory (Hours/week)', 'Lab(Hours/Week)', 'Hours'],
      ['F1', 'Contemporary India & Education', 'FY_A', 3, 0, 6],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(facultyData), 'Faculty')

    const subjectData = [
      ['Type', 'Name', 'Hours/Week', '', 'Credit'],
      ['', '', 'Theory', 'Lab', ''],
      ['Theory', 'Contemporary India & Education', 3, 0, 4],
      ['Theory', 'Childhood & Growing Up', 3, 0, 4],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(subjectData), 'Subject')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', compression: true })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="timetable_template.xlsx"',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate template', details: error.message },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const incoming = await request.formData()
    const file = incoming.get('file')

    if (!file) {
      return NextResponse.json(
        { success: false, consoleOutput: 'No file provided' },
        { status: 400 },
      )
    }

    const upstream = new FormData()
    upstream.append('file', file, file.name || 'upload.xlsx')

    const response = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      body: upstream,
    })

    const result = await response.json()
    return NextResponse.json({
      success: Boolean(result?.success),
      consoleOutput: result?.output ?? 'Validation complete',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        consoleOutput: `Validation request failed: ${error.message}`,
      },
      { status: 502 },
    )
  }
}
