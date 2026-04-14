'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/app/components/shared/DashboardNav'
import Sidebar from '@/app/components/shared/Sidebar'
import DepartmentGrid from '@/app/components/admin/DepartmentGrid'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import { ChartBarIcon, BuildingOfficeIcon, CalendarDaysIcon, BellIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function ModifyDeptPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [university, setUniversity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

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
    return <LoadingSpinner message="Loading departments..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-white to-cyan-50/30 flex relative overflow-hidden">
      {/* Decorative SVG Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-20 -right-20 w-96 h-96 text-teal-100 opacity-50" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="currentColor"/>
        </svg>
        <svg className="absolute -bottom-32 -left-32 w-[500px] h-[500px] text-cyan-100 opacity-40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,40.1,76.8C26.4,84.6,10,87.6,-5.7,87.1C-21.4,86.6,-36.1,82.6,-48.9,74.4C-61.7,66.2,-72.6,53.8,-79.8,39.4C-87,25,-90.5,8.6,-88.7,-6.9C-86.9,-22.4,-79.8,-37,-69.8,-48.9C-59.8,-60.8,-46.9,-70,-32.8,-76.8C-18.7,-83.6,-3.4,-88,11.5,-87.4C26.4,-86.8,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute top-1/2 -right-10 w-64 h-64 text-teal-50 opacity-60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M0,100 Q50,50 100,100 T200,100 L200,200 L0,200 Z" />
        </svg>
        <svg className="absolute top-32 left-1/4 w-32 h-32 text-cyan-200 opacity-30" viewBox="0 0 100 100">
          <circle cx="20" cy="20" r="15" fill="currentColor"/>
          <circle cx="60" cy="40" r="10" fill="currentColor"/>
          <circle cx="40" cy="70" r="12" fill="currentColor"/>
        </svg>
        <svg className="absolute bottom-20 right-1/4 w-40 h-40 text-teal-100 opacity-40" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="currentColor"/>
        </svg>
      </div>
      <Sidebar
        activeTab="departments"
        setActiveTab={(tab) => {
          if (tab === 'overview') router.push('/admin/dashboard')
          else if (tab === 'schedules') router.push('/admin/mdm-config')
          else if (tab === 'all-schedules') router.push('/admin/all-schedules')
          else if (tab === 'notify') router.push('/admin/notify')
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tabs={tabs}
      />

      <div className="flex-1 lg:ml-0 relative z-10">
        <DashboardNav 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          title={university?.name || 'Department Management'}
          subtitle="Manage Departments"
        />
        <div className="p-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
                <p className="text-gray-600">View and manage department credentials</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)} 
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 font-semibold hover:scale-105 active:scale-95"
              >
                <PlusIcon className="h-5 w-5" />
                Add Department
              </button>
            </div>
            <DepartmentGrid departments={university?.departments || []} onUpdate={fetchUniversityData} showAddModal={showAddModal} setShowAddModal={setShowAddModal} />
          </div>
        </div>
      </div>
    </div>
  )
}
