'use client'

import { useState } from 'react'
import { DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'

export default function ExcelUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [configurationType, setConfigurationType] = useState('btech')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('Please upload a valid Excel file (.xlsx or .xls)')
        setFile(null)
      }
    }
  }

  const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Look for a sheet with time slot data
          let slots = []
          
          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
            
            // Look for rows with Index and Slot columns
            for (let i = 0; i < jsonData.length; i++) {
              const row = jsonData[i]
              if (!row || row.length < 2) continue
              
              const col1 = String(row[0] || '').toLowerCase()
              const col2 = String(row[1] || '')
              
              // Skip header row
              if (col1.includes('index') || col1.includes('slot')) continue
              
              // Check if this looks like a time slot (contains time pattern)
              if (/\d{1,2}:\d{2}/.test(col2)) {
                const index = parseInt(row[0])
                if (!isNaN(index) && index > 0) {
                  slots.push({ index, time: col2.trim() })
                }
              }
            }
            
            // If we found slots, break
            if (slots.length > 0) break
          }
          
          // Sort by index
          slots.sort((a, b) => a.index - b.index)
          
          console.log('Extracted slots:', slots)
          resolve(slots)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    console.log('=== STARTING EXCEL PARSING ===')
    console.log('File name:', file.name)
    console.log('File size:', file.size)
    
    try {
      const extractedSlots = await parseExcelFile(file)
      
      if (extractedSlots.length === 0) {
        setError('No time slots found in Excel file. Please ensure the file has Index and Slot columns.')
        setUploading(false)
        return
      }
      
      const extractedData = {
        fileName: file.name,
        fileSize: file.size,
        slots: extractedSlots,
        configurationType,
        analytics: {
          totalSlots: extractedSlots.length,
          totalDuration: `${extractedSlots.length * 55} minutes`,
          breakSlots: []
        }
      }
      
      console.log('=== EXCEL PARSING COMPLETE ===')
      console.log('Extracted data:', extractedData)
      onUploadSuccess(extractedData)
    } catch (err) {
      console.error('Excel parsing error:', err)
      setError('Failed to parse Excel file: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-secondary p-8">
      <div className="text-center">
        <DocumentArrowUpIcon className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Timetable Excel</h3>
        <p className="text-gray-600 mb-6">Upload your institution's timetable to extract slot information</p>

        <div className="space-y-4">
          <div className="max-w-xs mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">Configuration Type</label>
            <select
              value={configurationType}
              onChange={(e) => setConfigurationType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="btech">B.Tech (Default)</option>
              <option value="other">Other Degrees (B.A, B.CA, B.COM)</option>
            </select>
          </div>

          <label className="cursor-pointer inline-block">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="bg-primary/10 text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/20 transition-all inline-block border border-primary/30">
              Choose Excel File
            </span>
          </label>

          {file && (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-gray-700">{file.name}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center space-x-2 text-sm text-red-600">
              <XCircleIcon className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload & Extract Data'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
