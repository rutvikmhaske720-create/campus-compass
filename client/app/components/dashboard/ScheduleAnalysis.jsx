'use client'

import { useState } from 'react'
import { ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import PasswordModal from '../auth/PasswordModal'
import { DAYS } from '../../../lib/constants'

export default function ScheduleAnalysis({ schedule, onClose, departmentName }) {
  const [activeView, setActiveView] = useState('overview')
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfTab, setPdfTab] = useState('combined')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingDownload, setPendingDownload] = useState(null)

  const groupByRoom = () => {
    const grouped = {}
    schedule.forEach(row => {
      const room = row.Room || row.room || 'Unassigned'
      if (room.toUpperCase() === 'ONLINE') return
      if (!grouped[room]) grouped[room] = []
      grouped[room].push(row)
    })
    return grouped
  }

  const groupByParentBatch = () => {
    const grouped = {}
    schedule.forEach(row => {
      const batch = row.Batch || row.batch || 'Unknown'
      const parentBatch = batch.match(/^[A-Z]+_[A-Z]+/) ? batch.match(/^[A-Z]+_[A-Z]+/)[0] : batch
      if (!grouped[parentBatch]) grouped[parentBatch] = []
      grouped[parentBatch].push(row)
    })
    return grouped
  }

  const extractTimeSlots = () => {
    const slots = new Set()
    schedule.forEach(row => {
      const time = row.Time || row.time
      if (time) {
        const timeStr = String(time).trim()
        if (timeStr.includes('&')) {
          timeStr.split('&').forEach(t => slots.add(t.trim()))
        } else {
          slots.add(timeStr)
        }
      }
    })
    return Array.from(slots).sort((a, b) => {
      const timeA = a.match(/(\d{1,2}):(\d{2})/)
      const timeB = b.match(/(\d{1,2}):(\d{2})/)
      if (timeA && timeB) {
        const minutesA = parseInt(timeA[1]) * 60 + parseInt(timeA[2])
        const minutesB = parseInt(timeB[1]) * 60 + parseInt(timeB[2])
        return minutesA - minutesB
      }
      return 0
    })
  }

  const buildGridForEntity = (sessions, days = DAYS) => {
    const timeSlots = extractTimeSlots()
    const grid = {}
    
    timeSlots.forEach(slot => {
      grid[slot] = {}
      days.forEach(day => {
        grid[slot][day] = []
      })
    })

    sessions.forEach(s => {
      const day = s.Day || s.day
      const time = s.Time || s.time
      const type = s.Type || s.type
      
      if (time && day) {
        if (type === 'Lab' && time.includes('&')) {
          const slots = time.split('&').map(t => t.trim())
          slots.forEach(slot => {
            if (grid[slot] && grid[slot][day]) {
              grid[slot][day].push(s)
            }
          })
        } else if (grid[time] && grid[time][day]) {
          grid[time][day].push(s)
        }
      }
    })

    return { grid, timeSlots, days }
  }

  const groupByFaculty = () => {
    const grouped = {}
    schedule.forEach(row => {
      const faculty = row.Faculty || row.faculty || 'Unknown'
      if (!grouped[faculty]) grouped[faculty] = []
      grouped[faculty].push(row)
    })
    return grouped
  }

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.json_to_sheet(schedule)
    XLSX.utils.book_append_sheet(wb, ws1, 'Complete Schedule')
    
    const roomData = []
    Object.entries(groupByRoom()).forEach(([room, sessions]) => {
      roomData.push({ Room: room, 'Total Sessions': sessions.length })
      sessions.forEach(s => roomData.push(s))
      roomData.push({})
    })
    const ws2 = XLSX.utils.json_to_sheet(roomData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Room-wise')
    
    const divData = []
    Object.entries(groupByParentBatch()).forEach(([batch, sessions]) => {
      divData.push({ Division: batch, 'Total Sessions': sessions.length })
      sessions.forEach(s => divData.push(s))
      divData.push({})
    })
    const ws3 = XLSX.utils.json_to_sheet(divData)
    XLSX.utils.book_append_sheet(wb, ws3, 'Division-wise')
    
    const facultyData = []
    Object.entries(groupByFaculty()).forEach(([faculty, sessions]) => {
      facultyData.push({ Faculty: faculty, 'Total Sessions': sessions.length })
      sessions.forEach(s => facultyData.push(s))
      facultyData.push({})
    })
    const ws4 = XLSX.utils.json_to_sheet(facultyData)
    XLSX.utils.book_append_sheet(wb, ws4, 'Faculty-wise')
    
    XLSX.writeFile(wb, `schedule_analysis_${Date.now()}.xlsx`)
  }

  const handlePdfClick = () => {
    setShowPasswordModal(true)
    setPendingDownload({ type: 'combined' })
  }

  const handleIndividualPdfClick = (type, name, sessions) => {
    setShowPasswordModal(true)
    setPendingDownload({ type: 'individual', pdfType: type, name, sessions })
  }

  const executePendingDownload = () => {
    if (!pendingDownload) return
    
    if (pendingDownload.type === 'combined') {
      downloadPDF()
    } else if (pendingDownload.type === 'individual') {
      downloadIndividualPDF(pendingDownload.pdfType, pendingDownload.name, pendingDownload.sessions)
    }
    
    setPendingDownload(null)
    setShowPdfModal(false)
  }

  const downloadPDF = () => {
    const pdf = new jsPDF('l', 'mm', 'a4')
    const colors = [
      [147, 51, 234], [59, 130, 246], [16, 185, 129], [245, 158, 11], [239, 68, 68], [168, 85, 247]
    ]

    pdf.setFontSize(20)
    pdf.setFont(undefined, 'bold')
    pdf.text('Schedule Analysis Report', 15, 15)

    const rooms = Object.entries(groupByRoom())
    rooms.forEach(([room, sessions], idx) => {
      if (idx > 0) pdf.addPage()
      
      pdf.setFontSize(16)
      pdf.setFont(undefined, 'bold')
      pdf.text(`Room: ${room}`, 15, 15)

      const { grid, timeSlots, days } = buildGridForEntity(sessions)
      const tableData = timeSlots.map(slot => {
        const row = [slot]
        days.forEach(day => {
          const cells = grid[slot][day]
          if (cells.length > 0) {
            row.push(cells.map(c => `${c.Batch || c.batch}\n${c.Course || c.course}\n${c.Faculty || c.faculty}`).join('\n---\n'))
          } else {
            row.push('')
          }
        })
        return row
      })

      autoTable(pdf, {
        startY: 24,
        head: [['Time', ...days]],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', minCellHeight: 12 },
        headStyles: { fillColor: colors[idx % colors.length], fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 10, right: 10 },
        columnStyles: { 0: { cellWidth: 24, fillColor: [237, 233, 254] } }
      })
    })

    const faculty = Object.entries(groupByFaculty())
    faculty.forEach(([fac, sessions], idx) => {
      pdf.addPage()
      
      pdf.setFontSize(16)
      pdf.setFont(undefined, 'bold')
      pdf.text(`Faculty: ${fac}`, 15, 15)

      const { grid, timeSlots, days } = buildGridForEntity(sessions)
      const tableData = timeSlots.map(slot => {
        const row = [slot]
        days.forEach(day => {
          const cells = grid[slot][day]
          if (cells.length > 0) {
            row.push(cells.map(c => `${c.Batch || c.batch}\n${c.Course || c.course}\n${c.Room || c.room}`).join('\n---\n'))
          } else {
            row.push('')
          }
        })
        return row
      })

      autoTable(pdf, {
        startY: 24,
        head: [['Time', ...days]],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', minCellHeight: 12 },
        headStyles: { fillColor: colors[idx % colors.length], fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 10, right: 10 },
        columnStyles: { 0: { cellWidth: 24, fillColor: [254, 243, 199] } }
      })
    })

    pdf.save(`schedule_analysis_${Date.now()}.pdf`)
  }

  const downloadIndividualPDF = (type, name, sessions) => {
    const pdf = new jsPDF('l', 'mm', 'a4')
    pdf.setFontSize(20)
    pdf.setFont(undefined, 'bold')
    pdf.text(`${type}: ${name}`, 15, 15)

    const { grid, timeSlots, days } = buildGridForEntity(sessions)
    const tableData = timeSlots.map(slot => {
      const row = [slot]
      days.forEach(day => {
        const cells = grid[slot][day]
        if (cells.length > 0) {
          const content = type === 'Room' 
            ? cells.map(c => `${c.Batch || c.batch}\n${c.Course || c.course}\n${c.Faculty || c.faculty}`).join('\n---\n')
            : type === 'Faculty'
            ? cells.map(c => `${c.Batch || c.batch}\n${c.Course || c.course}\n${c.Room || c.room}`).join('\n---\n')
            : cells.map(c => `${c.Course || c.course}\n${c.Faculty || c.faculty}\n${c.Room || c.room}`).join('\n---\n')
          row.push(content)
        } else {
          row.push('')
        }
      })
      return row
    })

    autoTable(pdf, {
      startY: 24,
      head: [['Time', ...days]],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', minCellHeight: 12 },
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 10, right: 10 },
      columnStyles: { 0: { cellWidth: 24, fillColor: [237, 233, 254] } }
    })

    pdf.save(`${name.replace(/\s+/g, '_')}.pdf`)
  }

  const renderRoomView = () => {
    const rooms = groupByRoom()
    return (
      <div className="space-y-4">
        {Object.entries(rooms).map(([room, sessions]) => (
          <div key={room} className="bg-white rounded-xl border-2 border-purple-100 p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h4 className="font-bold text-gray-800">{room} <span className="text-sm text-gray-500">({sessions.length} sessions)</span></h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-purple-100 to-blue-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Day</th>
                    <th className="px-3 py-2 text-left font-semibold">Time</th>
                    <th className="px-3 py-2 text-left font-semibold">Batch</th>
                    <th className="px-3 py-2 text-left font-semibold">Course</th>
                    <th className="px-3 py-2 text-left font-semibold">Faculty</th>
                    <th className="px-3 py-2 text-left font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={i} className="border-t hover:bg-purple-50 transition-colors">
                      <td className="px-3 py-2">{s.Day || s.day}</td>
                      <td className="px-3 py-2">{s.Time || s.time}</td>
                      <td className="px-3 py-2">{s.Batch || s.batch}</td>
                      <td className="px-3 py-2">{s.Course || s.course}</td>
                      <td className="px-3 py-2">{s.Faculty || s.faculty}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${s.Type === 'Lab' || s.type === 'Lab' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {s.Type || s.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderBatchView = () => {
    const batches = groupByParentBatch()
    return (
      <div className="space-y-4">
        {Object.entries(batches).map(([batch, sessions]) => (
          <div key={batch} className="bg-white rounded-xl border-2 border-blue-100 p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h4 className="font-bold text-gray-800">{batch} <span className="text-sm text-gray-500">({sessions.length} sessions)</span></h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-100 to-cyan-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Day</th>
                    <th className="px-3 py-2 text-left font-semibold">Time</th>
                    <th className="px-3 py-2 text-left font-semibold">Course</th>
                    <th className="px-3 py-2 text-left font-semibold">Faculty</th>
                    <th className="px-3 py-2 text-left font-semibold">Room</th>
                    <th className="px-3 py-2 text-left font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={i} className="border-t hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-2">{s.Day || s.day}</td>
                      <td className="px-3 py-2">{s.Time || s.time}</td>
                      <td className="px-3 py-2">{s.Course || s.course}</td>
                      <td className="px-3 py-2">{s.Faculty || s.faculty}</td>
                      <td className="px-3 py-2">{s.Room || s.room}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${s.Type === 'Lab' || s.type === 'Lab' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {s.Type || s.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderFacultyView = () => {
    const faculty = groupByFaculty()
    return (
      <div className="space-y-4">
        {Object.entries(faculty).map(([fac, sessions]) => (
          <div key={fac} className="bg-white rounded-xl border-2 border-pink-100 p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h4 className="font-bold text-gray-800">{fac} <span className="text-sm text-gray-500">({sessions.length} sessions)</span></h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-pink-100 to-purple-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Day</th>
                    <th className="px-3 py-2 text-left font-semibold">Time</th>
                    <th className="px-3 py-2 text-left font-semibold">Batch</th>
                    <th className="px-3 py-2 text-left font-semibold">Course</th>
                    <th className="px-3 py-2 text-left font-semibold">Room</th>
                    <th className="px-3 py-2 text-left font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={i} className="border-t hover:bg-pink-50 transition-colors">
                      <td className="px-3 py-2">{s.Day || s.day}</td>
                      <td className="px-3 py-2">{s.Time || s.time}</td>
                      <td className="px-3 py-2">{s.Batch || s.batch}</td>
                      <td className="px-3 py-2">{s.Course || s.course}</td>
                      <td className="px-3 py-2">{s.Room || s.room}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${s.Type === 'Lab' || s.type === 'Lab' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {s.Type || s.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-primary/20 shadow-lg relative overflow-hidden">
      <svg className="absolute top-0 right-0 w-32 h-32 text-primary opacity-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-24 h-24 text-primary opacity-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-lg">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-primary">
            Schedule Analysis
          </h3>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
          <button onClick={() => setShowPdfModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
        </div>
      </div>

      {showPdfModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowPdfModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Download PDF</h3>
              <button onClick={() => setShowPdfModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex gap-2 mb-4 border-b">
              <button onClick={() => setPdfTab('combined')} className={`px-4 py-2 font-semibold text-sm ${pdfTab === 'combined' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}>
                Combined
              </button>
              <button onClick={() => setPdfTab('rooms')} className={`px-4 py-2 font-semibold text-sm ${pdfTab === 'rooms' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}>
                Rooms
              </button>
              <button onClick={() => setPdfTab('faculty')} className={`px-4 py-2 font-semibold text-sm ${pdfTab === 'faculty' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}>
                Faculty
              </button>
              <button onClick={() => setPdfTab('divisions')} className={`px-4 py-2 font-semibold text-sm ${pdfTab === 'divisions' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}>
                Divisions
              </button>
            </div>

            {pdfTab === 'combined' && (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-red-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 mb-4">Download complete schedule with all rooms, faculty, and divisions</p>
                <button onClick={handlePdfClick} className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all">
                  Download Combined PDF
                </button>
              </div>
            )}

            {pdfTab === 'rooms' && (
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {Object.entries(groupByRoom()).map(([room, sessions]) => (
                  <button key={room} onClick={() => handleIndividualPdfClick('Room', room, sessions)} className="p-3 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all text-left">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="font-semibold text-gray-800">{room}</div>
                    </div>
                    <div className="text-xs text-gray-500 ml-7">{sessions.length} sessions</div>
                  </button>
                ))}
              </div>
            )}

            {pdfTab === 'faculty' && (
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {Object.entries(groupByFaculty()).map(([fac, sessions]) => (
                  <button key={fac} onClick={() => handleIndividualPdfClick('Faculty', fac, sessions)} className="p-3 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all text-left">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div className="font-semibold text-gray-800">{fac}</div>
                    </div>
                    <div className="text-xs text-gray-500 ml-7">{sessions.length} sessions</div>
                  </button>
                ))}
              </div>
            )}

            {pdfTab === 'divisions' && (
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {Object.entries(groupByParentBatch()).map(([batch, sessions]) => (
                  <button key={batch} onClick={() => handleIndividualPdfClick('Division', batch, sessions)} className="p-3 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all text-left">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div className="font-semibold text-gray-800">{batch}</div>
                    </div>
                    <div className="text-xs text-gray-500 ml-7">{sessions.length} sessions</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex gap-2 mb-4 relative z-10">
        <button onClick={() => setActiveView('rooms')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeView === 'rooms' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Room-wise
        </button>
        <button onClick={() => setActiveView('batches')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeView === 'batches' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Division-wise
        </button>
        <button onClick={() => setActiveView('faculty')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeView === 'faculty' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Faculty-wise
        </button>
      </div>

      <div className="max-h-[600px] overflow-y-auto relative z-10">
        {activeView === 'rooms' && renderRoomView()}
        {activeView === 'batches' && renderBatchView()}
        {activeView === 'faculty' && renderFacultyView()}
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setPendingDownload(null)
        }}
        onVerify={executePendingDownload}
        departmentName={departmentName}
      />
    </div>
  )
}
