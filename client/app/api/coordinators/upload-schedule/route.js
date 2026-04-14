import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { spawn } from 'child_process'
import * as XLSX from 'xlsx'

export async function POST(request) {
  try {
    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save uploaded file as timetable_data.xlsx (as expected by Python script)
    const uploadPath = join(process.cwd(), '..', 'python', 'timetable_data.xlsx')
    await writeFile(uploadPath, buffer)

    // Call Python script and capture output
    const pythonPath = join(process.cwd(), '..', 'python', 'main.py')
    
    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [pythonPath])
      let consoleOutput = ''
      
      // Capture stdout
      pythonProcess.stdout.on('data', (data) => {
        consoleOutput += data.toString()
      })
      
      // Capture stderr
      pythonProcess.stderr.on('data', (data) => {
        consoleOutput += data.toString()
      })
      
      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          try {
            // Read the generated Excel files (Python generates final_timetable_run1.xlsx, etc.)
            const schedule1Path = join(process.cwd(), '..', 'python', 'final_timetable_run1.xlsx')
            const schedule2Path = join(process.cwd(), '..', 'python', 'final_timetable_run2.xlsx')
            const schedule3Path = join(process.cwd(), '..', 'python', 'final_timetable_run3.xlsx')

            const results = {}

            try {
              const workbook1 = XLSX.readFile(schedule1Path)
              const worksheet1 = workbook1.Sheets['Overview'] || workbook1.Sheets[workbook1.SheetNames[0]]
              results.schedule1 = XLSX.utils.sheet_to_json(worksheet1)
            } catch (e) {
              consoleOutput += '\nSchedule 1 (final_timetable_run1.xlsx) not found'
            }

            try {
              const workbook2 = XLSX.readFile(schedule2Path)
              const worksheet2 = workbook2.Sheets['Overview'] || workbook2.Sheets[workbook2.SheetNames[0]]
              results.schedule2 = XLSX.utils.sheet_to_json(worksheet2)
            } catch (e) {
              consoleOutput += '\nSchedule 2 (final_timetable_run2.xlsx) not found'
            }

            try {
              const workbook3 = XLSX.readFile(schedule3Path)
              const worksheet3 = workbook3.Sheets['Overview'] || workbook3.Sheets[workbook3.SheetNames[0]]
              results.schedule3 = XLSX.utils.sheet_to_json(worksheet3)
            } catch (e) {
              consoleOutput += '\nSchedule 3 (final_timetable_run3.xlsx) not found'
            }

            resolve(NextResponse.json({ success: true, results, consoleOutput }))
          } catch (error) {
            resolve(NextResponse.json({ success: false, error: 'Failed to read generated files', consoleOutput }))
          }
        } else {
          resolve(NextResponse.json({ success: false, error: 'Python script failed', consoleOutput }))
        }
      })

      pythonProcess.on('error', (error) => {
        resolve(NextResponse.json({ success: false, error: 'Failed to run Python script', consoleOutput: consoleOutput + '\n' + error.message }))
      })
    })

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' })
  }
}