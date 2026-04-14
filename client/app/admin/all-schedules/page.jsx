'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/app/components/shared/DashboardNav'
import Sidebar from '@/app/components/shared/Sidebar'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import { ChartBarIcon, BuildingOfficeIcon, CalendarDaysIcon, BellIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'

export default function AllSchedulesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchAllSchedules()
    }
  }, [session])

  const fetchAllSchedules = async () => {
    try {
      const response = await fetch('/api/admin/get-university')
      const data = await response.json()
      if (data.success && data.university) {
        const allSchedules = []
        
        // Add MDM schedule if exists
        if (data.university.mdmSchedule) {
          allSchedules.push({
            department: 'MDM',
            type: 'MDM Schedule',
            ...data.university.mdmSchedule
          })
        }
        
        // Add department schedules
        if (data.university.departments) {
          data.university.departments
            .filter(dept => dept.selectedSchedule)
            .forEach(dept => {
              allSchedules.push({
                department: dept.name,
                type: 'Department Schedule',
                ...dept.selectedSchedule
              })
            })
        }
        
        setSchedules(allSchedules)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (schedule) => {
    const ws = XLSX.utils.json_to_sheet(schedule.scheduleData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule')
    XLSX.writeFile(wb, schedule.filename)
  }

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'departments', label: 'Departments', icon: BuildingOfficeIcon },
    { id: 'schedules', label: 'Generate MDM Schedule', icon: CalendarDaysIcon },
    { id: 'all-schedules', label: 'All Schedules', icon: DocumentTextIcon },
    { id: 'notify', label: 'Notify', icon: BellIcon }
  ]

  if (status === 'loading' || loading) {
    return <LoadingSpinner message="Loading schedules..." />
  }

  return (
    <div className="min-h-screen dark-bg flex">
      <Sidebar
        activeTab="all-schedules"
        setActiveTab={(tab) => {
          if (tab === 'overview') router.push('/admin/dashboard')
          else if (tab === 'departments') router.push('/admin/modify-dept')
          else if (tab === 'schedules') router.push('/admin/mdm-config')
          else if (tab === 'notify') router.push('/admin/notify')
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tabs={tabs}
      />

      <div className="flex-1 lg:ml-0">
        <DashboardNav 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          title="All Schedules"
          subtitle="View all saved MDM schedules"
        />
        <div className="p-4">
          <div className="bg-white rounded-xl border border-secondary p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Department Schedules</h2>
            {schedules.length === 0 ? (
              <p className="text-gray-600">No schedules saved yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map((schedule, idx) => (
                  <div key={idx} className={`rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all ${
                    schedule.type === 'MDM Schedule' ? 'bg-gradient-to-br from-orange-50 to-red-50' : 'bg-gradient-to-br from-blue-50 to-purple-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-base mb-1">{schedule.department}</h3>
                        <p className="text-xs text-gray-500">{new Date(schedule.selectedAt || schedule.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        schedule.type === 'MDM Schedule' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                      }`}>{schedule.type === 'MDM Schedule' ? 'MDM' : 'Active'}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600 mb-1">File:</p>
                        <p className="font-medium text-gray-800 text-xs truncate">{schedule.filename}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600 mb-1">Sessions:</p>
                        <p className="font-bold text-primary text-lg">{schedule.scheduleData?.length || 0}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(schedule)}
                      className="w-full bg-gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2 text-sm font-medium"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>Download Schedule</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
