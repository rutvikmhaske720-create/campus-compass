'use client'

import { useState, useEffect } from 'react'
import { DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon, ChartBarIcon, CalendarIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'
import WaitingRoom from '../auth/WaitingRoom'
import TimetableAnalytics from '../dashboard/TimetableAnalytics'
import ScheduleComparison from '../dashboard/ScheduleComparison'

export default function MDMScheduleGenerator() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [scheduleData, setScheduleData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setError(null)
        setSchedule(null)
        setShowToast(true)
      } else {
        setError('Please upload a valid Excel file (.xlsx or .xls)')
        setFile(null)
      }
    }
  }

  const parseScheduleData = (base64Data) => {
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const workbook = XLSX.read(byteArray, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(firstSheet)
    
    // Calculate analytics
    const dayCount = {}
    const typeCount = {}
    const facultyCount = {}
    const courseCount = {}
    
    data.forEach(row => {
      dayCount[row.Day] = (dayCount[row.Day] || 0) + 1
      typeCount[row.Type] = (typeCount[row.Type] || 0) + 1
      facultyCount[row.Faculty] = (facultyCount[row.Faculty] || 0) + 1
      courseCount[row.Course] = (courseCount[row.Course] || 0) + 1
    })
    
    return {
      rows: data,
      analytics: {
        totalSessions: data.length,
        dayDistribution: dayCount,
        typeDistribution: typeCount,
        facultyCount: Object.keys(facultyCount).length,
        courseCount: Object.keys(courseCount).length,
        allFaculty: Object.entries(facultyCount).sort((a, b) => b[1] - a[1])
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setSchedule(null)
    setScheduleData(null)
    setAnalytics(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-mdm-schedule`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSchedule({
          filename: data.filename,
          data: data.data
        })
        
        const parsed = parseScheduleData(data.data)
        setScheduleData(parsed.rows)
        setAnalytics(parsed.analytics)
      } else {
        setError(data.error || 'Failed to generate schedule')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to generate schedule: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSelectSchedule = async () => {
    if (!schedule) return
    
    setUploading(true)
    try {
      const cloudinaryResponse = await fetch('/api/admin/save-mdm-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: schedule.filename,
          fileData: schedule.data
        })
      })
      
      const cloudinaryData = await cloudinaryResponse.json()
      if (!cloudinaryData.success) {
        throw new Error(cloudinaryData.error || 'Failed to upload to Cloudinary')
      }

      // Save to database
      const dbResponse = await fetch('/api/admin/save-mdm-to-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: schedule.filename,
          url: cloudinaryData.url,
          publicId: cloudinaryData.publicId,
          scheduleData: scheduleData
        })
      })
      
      const dbData = await dbResponse.json()
      if (dbData.success) {
        alert('Schedule saved successfully!')
      } else {
        alert('Failed to save schedule: ' + dbData.error)
      }
    } catch (err) {
      alert('Error saving schedule: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const downloadSchedule = () => {
    if (!schedule) return
    
    const byteCharacters = atob(schedule.data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = schedule.filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6 relative">
      {uploading && <WaitingRoom />}
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6" />
            <span className="font-medium">Schedule selected successfully!</span>
          </div>
        </div>
      )}
      <div className="bg-gradient-primary rounded-2xl border-2 border-white/20 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Generate MDM Schedule</h2>
            <p className="text-white/90 text-sm mt-1">Upload MDM input Excel file to generate schedule</p>
          </div>
          <svg className="w-12 h-12 text-white/40" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-white/30">
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Upload MDM Excel</h3>
                <p className="text-sm text-gray-600">Select your MDM input file</p>
              </div>

              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
                  <svg className="w-10 h-10 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Click to browse files</span>
                  <p className="text-xs text-gray-500 mt-1">Excel files only (.xlsx, .xls)</p>
                </div>
              </label>

              {file && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Schedule...
                    </span>
                  ) : 'Generate Schedule'}
                </button>
              )}
            </div>
          </div>

          {/* Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <svg className="w-full h-full max-w-md" viewBox="0 0 400 300" fill="none">
              {/* Calendar/Schedule Illustration */}
              <rect x="50" y="40" width="300" height="220" rx="12" fill="white" opacity="0.1"/>
              <rect x="50" y="40" width="300" height="220" rx="12" stroke="white" strokeWidth="3" opacity="0.3"/>
              
              {/* Header */}
              <rect x="50" y="40" width="300" height="50" rx="12" fill="white" opacity="0.2"/>
              <circle cx="80" cy="65" r="8" fill="white" opacity="0.6"/>
              <circle cx="105" cy="65" r="8" fill="white" opacity="0.6"/>
              <circle cx="130" cy="65" r="8" fill="white" opacity="0.6"/>
              
              {/* Grid Lines */}
              <line x1="70" y1="110" x2="330" y2="110" stroke="white" strokeWidth="2" opacity="0.2"/>
              <line x1="70" y1="140" x2="330" y2="140" stroke="white" strokeWidth="2" opacity="0.2"/>
              <line x1="70" y1="170" x2="330" y2="170" stroke="white" strokeWidth="2" opacity="0.2"/>
              <line x1="70" y1="200" x2="330" y2="200" stroke="white" strokeWidth="2" opacity="0.2"/>
              <line x1="70" y1="230" x2="330" y2="230" stroke="white" strokeWidth="2" opacity="0.2"/>
              
              {/* Schedule Blocks */}
              <rect x="70" y="115" width="80" height="20" rx="4" fill="white" opacity="0.4"/>
              <rect x="160" y="115" width="60" height="20" rx="4" fill="white" opacity="0.5"/>
              <rect x="230" y="115" width="90" height="20" rx="4" fill="white" opacity="0.3"/>
              
              <rect x="70" y="145" width="100" height="20" rx="4" fill="white" opacity="0.5"/>
              <rect x="180" y="145" width="70" height="20" rx="4" fill="white" opacity="0.4"/>
              <rect x="260" y="145" width="60" height="20" rx="4" fill="white" opacity="0.3"/>
              
              <rect x="70" y="175" width="70" height="20" rx="4" fill="white" opacity="0.4"/>
              <rect x="150" y="175" width="90" height="20" rx="4" fill="white" opacity="0.5"/>
              <rect x="250" y="175" width="70" height="20" rx="4" fill="white" opacity="0.3"/>
              
              <rect x="70" y="205" width="85" height="20" rx="4" fill="white" opacity="0.3"/>
              <rect x="165" y="205" width="75" height="20" rx="4" fill="white" opacity="0.4"/>
              <rect x="250" y="205" width="70" height="20" rx="4" fill="white" opacity="0.5"/>
              
              {/* Floating Elements */}
              <circle cx="360" cy="100" r="20" fill="white" opacity="0.2"/>
              <circle cx="30" cy="180" r="15" fill="white" opacity="0.2"/>
              <circle cx="370" cy="240" r="18" fill="white" opacity="0.2"/>
            </svg>
          </div>
        </div>
      </div>

      {analytics && scheduleData && (
        <div className="space-y-4">
          {/* Input Data Analytics */}
          <TimetableAnalytics analytics={{
            faculty: analytics.allFaculty.map(([name, hours]) => ({ name, hours: hours.toString() })),
            batches: scheduleData.map(s => ({ name: s.Batch, type: s.Type })).filter((v, i, a) => a.findIndex(t => t.name === v.name) === i),
            rooms: scheduleData.map(s => ({ name: s.Room, type: s.Type })).filter((v, i, a) => a.findIndex(t => t.name === v.name) === i),
            totalClasses: analytics.totalSessions
          }} />

          {/* Analytics Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-2">Generated Schedule Analytics</h2>
            <p className="text-white/90">Comprehensive analysis of generated timetable</p>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
              <CalendarIcon className="h-8 w-8 mb-2 opacity-90" />
              <p className="text-sm opacity-90 font-medium">Total Sessions</p>
              <p className="text-3xl font-bold mt-1">{analytics.totalSessions}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
              <UserGroupIcon className="h-8 w-8 mb-2 opacity-90" />
              <p className="text-sm opacity-90 font-medium">Faculty Members</p>
              <p className="text-3xl font-bold mt-1">{analytics.facultyCount}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
              <AcademicCapIcon className="h-8 w-8 mb-2 opacity-90" />
              <p className="text-sm opacity-90 font-medium">Courses</p>
              <p className="text-3xl font-bold mt-1">{analytics.courseCount}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
              <ChartBarIcon className="h-8 w-8 mb-2 opacity-90" />
              <p className="text-sm opacity-90 font-medium">Lab Sessions</p>
              <p className="text-3xl font-bold mt-1">{analytics.typeDistribution.Lab || 0}</p>
            </div>
          </div>

          {/* Day Distribution Chart */}
          <div className="bg-white rounded-2xl border-2 border-teal-100 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Day-wise Distribution</h3>
                <p className="text-sm text-gray-600 mt-1">Session allocation across weekdays</p>
              </div>
              <button
                onClick={downloadSchedule}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Download Excel</span>
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics.dayDistribution).map(([day, count]) => (
                <div key={day} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-gray-800">{day}</span>
                    <span className="font-semibold text-teal-600">{count} sessions ({Math.round((count / analytics.totalSessions) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all shadow-sm"
                      style={{ width: `${(count / analytics.totalSessions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Faculty */}
          <div className="bg-white rounded-2xl border-2 border-cyan-100 p-6 shadow-lg">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">Faculty Workload Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Teaching load per faculty member</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {analytics.allFaculty.map(([faculty, count]) => (
                <div key={faculty} className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-100 hover:border-cyan-300 transition-all">
                  <span className="font-semibold text-gray-800 text-sm truncate">{faculty}</span>
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm ml-2">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timetable Preview */}
          <div className="bg-white rounded-2xl border-2 border-emerald-100 p-6 shadow-lg">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">Timetable Preview</h3>
              <p className="text-sm text-gray-600 mt-1">Detailed view of scheduled sessions</p>
            </div>
            <div className="space-y-3">
              {scheduleData.slice(0, 8).map((row, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100 hover:border-emerald-300 transition-all">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs font-medium">Day</span>
                      <div className="font-bold text-gray-800 mt-0.5">{row.Day}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs font-medium">Time</span>
                      <div className="font-bold text-gray-800 mt-0.5">{row.Time}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs font-medium">Batch</span>
                      <div className="font-bold text-gray-800 mt-0.5">{row.Batch}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs font-medium">Type</span>
                      <div className="mt-0.5">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          row.Type === 'Lab' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white'
                        }`}>
                          {row.Type}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600 text-xs font-medium">Course</span>
                      <div className="font-bold text-gray-800 mt-0.5">{row.Course}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs font-medium">Faculty</span>
                      <div className="font-bold text-gray-800 mt-0.5">{row.Faculty}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs font-medium">Room</span>
                      <div className="font-bold text-gray-800 mt-0.5">{row.Room}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {scheduleData.length > 8 && (
              <p className="text-center text-gray-600 text-sm mt-4 font-medium">
                Showing 8 of {scheduleData.length} sessions • Download to view complete schedule
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSelectSchedule}
                disabled={uploading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl text-base font-bold hover:shadow-lg transition-all disabled:opacity-50 hover:scale-105"
              >
                {uploading ? 'Saving...' : '✓ Select This Schedule'}
              </button>
              <button
                onClick={downloadSchedule}
                className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-base font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Download Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
