'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import DashboardNav from '@/app/components/shared/DashboardNav'
import Sidebar from '@/app/components/shared/Sidebar'
import CurrentScheduleView from '@/app/components/dashboard/CurrentScheduleView'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import { getDepartmentTabs, createTabNavigator } from '@/app/components/dashboard/DepartmentSidebarConfig'

export default function SchedulesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const departmentName = params.department
  const [department, setDepartment] = useState(null)
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
      fetchDepartmentData()
    }
  }, [session])

  const fetchDepartmentData = async () => {
    try {
      const response = await fetch(`/api/coordinators/get-department?department=${departmentName}`)
      const data = await response.json()
      if (data.success) setDepartment(data.department)
    } catch (error) {
      console.error('Error fetching department data:', error)
    } finally {
      setLoading(false)
    }
  }



  if (loading || status === 'loading') {
    return <LoadingSpinner message="Loading schedules..." />
  }

  return (
    <div className="min-h-screen content-bg flex">
      <Sidebar
        activeTab="schedules"
        setActiveTab={createTabNavigator(router, departmentName)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tabs={getDepartmentTabs(departmentName)}
      />

      <div className="flex-1 lg:ml-0">
        <DashboardNav 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          title={`${department?.name || departmentName} Department`}
          subtitle="Schedules"
        />
        <div className="p-4">
          <CurrentScheduleView department={department} departmentName={departmentName} />
        </div>
      </div>
    </div>
  )
}
