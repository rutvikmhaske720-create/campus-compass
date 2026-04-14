'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/app/components/shared/DashboardNav'
import Sidebar from '@/app/components/shared/Sidebar'
import MDMScheduleGenerator from '@/app/components/admin/MDMScheduleGenerator'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import { ChartBarIcon, BuildingOfficeIcon, CalendarDaysIcon, BellIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default function MDMConfigPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [university, setUniversity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchUniversityData()
    }
  }, [session])

  const fetchUniversityData = async () => {
    try {
      const response = await fetch('/api/admin/get-university')
      const data = await response.json()
      if (data.success) setUniversity(data.university)
    } catch (error) {
      console.error('Error fetching university data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'departments', label: 'Departments', icon: BuildingOfficeIcon },
    { id: 'schedules', label: 'Generate MDM Schedule', icon: CalendarDaysIcon },
    { id: 'all-schedules', label: 'All Schedules', icon: DocumentTextIcon },
    { id: 'notify', label: 'Notify', icon: BellIcon }
  ]

  if (loading || status === 'loading') {
    return <LoadingSpinner message="Loading MDM Configuration..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-white to-cyan-50/30 flex">
      <Sidebar
        activeTab="schedules"
        setActiveTab={(tab) => {
          if (tab === 'overview') router.push('/admin/dashboard')
          else if (tab === 'departments') router.push('/admin/modify-dept')
          else if (tab === 'all-schedules') router.push('/admin/all-schedules')
          else if (tab === 'notify') router.push('/admin/notify')
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tabs={tabs}
      />

      <div className="flex-1 lg:ml-0">
        <DashboardNav 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          title={university?.name || 'MDM Configuration'}
          subtitle="Generate MDM Schedule"
        />
        <div className="p-4">
          <MDMScheduleGenerator />
        </div>
      </div>
    </div>
  )
}
