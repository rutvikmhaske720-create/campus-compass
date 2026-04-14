'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/app/components/shared/DashboardNav'
import Sidebar from '@/app/components/shared/Sidebar'
import OverviewTab from '@/app/components/admin/OverviewTab'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import { ChartBarIcon, BuildingOfficeIcon, CalendarDaysIcon, BellIcon, DocumentTextIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [university, setUniversity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
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
      fetchSchedules()
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

  const fetchSchedules = async () => {
    setSchedules([])
  }

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'departments', label: 'Departments', icon: BuildingOfficeIcon },
    { id: 'schedules', label: 'Generate MDM Schedule', icon: CalendarDaysIcon },
    { id: 'all-schedules', label: 'All Schedules', icon: DocumentTextIcon },
    { id: 'notify', label: 'Notify', icon: BellIcon }
  ]

  if (loading || status === 'loading') {
    return <LoadingSpinner message="Loading your dashboard..." />
  }

  if (!university) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="text-center p-12 bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">We couldn't fetch your university information.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-primary hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2 inline" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-white to-cyan-50/30 flex relative overflow-hidden">
      {/* Decorative SVG Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Right Circle */}
        <svg className="absolute -top-20 -right-20 w-96 h-96 text-teal-100 opacity-50" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="currentColor"/>
        </svg>
        
        {/* Bottom Left Blob */}
        <svg className="absolute -bottom-32 -left-32 w-[500px] h-[500px] text-cyan-100 opacity-40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,40.1,76.8C26.4,84.6,10,87.6,-5.7,87.1C-21.4,86.6,-36.1,82.6,-48.9,74.4C-61.7,66.2,-72.6,53.8,-79.8,39.4C-87,25,-90.5,8.6,-88.7,-6.9C-86.9,-22.4,-79.8,-37,-69.8,-48.9C-59.8,-60.8,-46.9,-70,-32.8,-76.8C-18.7,-83.6,-3.4,-88,11.5,-87.4C26.4,-86.8,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
        
        {/* Middle Right Wave */}
        <svg className="absolute top-1/2 -right-10 w-64 h-64 text-teal-50 opacity-60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M0,100 Q50,50 100,100 T200,100 L200,200 L0,200 Z" />
        </svg>
        
        {/* Top Left Small Circles */}
        <svg className="absolute top-32 left-1/4 w-32 h-32 text-cyan-200 opacity-30" viewBox="0 0 100 100">
          <circle cx="20" cy="20" r="15" fill="currentColor"/>
          <circle cx="60" cy="40" r="10" fill="currentColor"/>
          <circle cx="40" cy="70" r="12" fill="currentColor"/>
        </svg>
        
        {/* Bottom Right Geometric */}
        <svg className="absolute bottom-20 right-1/4 w-40 h-40 text-teal-100 opacity-40" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="currentColor"/>
        </svg>
        
        {/* Additional Decorative Elements */}
        {/* Top Center Hexagons */}
        <svg className="absolute top-10 left-1/2 w-24 h-24 text-teal-200 opacity-25" viewBox="0 0 100 100">
          <polygon points="50,5 90,25 90,65 50,85 10,65 10,25" fill="currentColor"/>
        </svg>
        
        {/* Middle Left Dots Pattern */}
        <svg className="absolute top-1/3 left-10 w-48 h-48 text-cyan-100 opacity-30" viewBox="0 0 100 100">
          <circle cx="10" cy="10" r="3" fill="currentColor"/>
          <circle cx="30" cy="10" r="3" fill="currentColor"/>
          <circle cx="50" cy="10" r="3" fill="currentColor"/>
          <circle cx="70" cy="10" r="3" fill="currentColor"/>
          <circle cx="10" cy="30" r="3" fill="currentColor"/>
          <circle cx="30" cy="30" r="3" fill="currentColor"/>
          <circle cx="50" cy="30" r="3" fill="currentColor"/>
          <circle cx="70" cy="30" r="3" fill="currentColor"/>
          <circle cx="10" cy="50" r="3" fill="currentColor"/>
          <circle cx="30" cy="50" r="3" fill="currentColor"/>
          <circle cx="50" cy="50" r="3" fill="currentColor"/>
          <circle cx="70" cy="50" r="3" fill="currentColor"/>
        </svg>
        
        {/* Bottom Center Wave */}
        <svg className="absolute bottom-0 left-1/3 w-80 h-32 text-teal-100 opacity-40" viewBox="0 0 200 50" preserveAspectRatio="none">
          <path d="M0,25 Q50,0 100,25 T200,25 L200,50 L0,50 Z" fill="currentColor"/>
        </svg>
        
        {/* Top Right Corner Stars */}
        <svg className="absolute top-40 right-32 w-20 h-20 text-cyan-200 opacity-35" viewBox="0 0 100 100">
          <polygon points="50,10 61,35 88,35 66,52 77,77 50,60 23,77 34,52 12,35 39,35" fill="currentColor"/>
        </svg>
        
        {/* Middle Right Rings */}
        <svg className="absolute top-2/3 right-20 w-32 h-32 text-teal-100 opacity-30" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        {/* Bottom Left Squares */}
        <svg className="absolute bottom-40 left-20 w-28 h-28 text-cyan-100 opacity-25" viewBox="0 0 100 100">
          <rect x="10" y="10" width="30" height="30" fill="currentColor" transform="rotate(15 25 25)"/>
          <rect x="50" y="50" width="20" height="20" fill="currentColor" transform="rotate(30 60 60)"/>
        </svg>
        
        {/* Top Left Arc */}
        <svg className="absolute top-20 left-40 w-40 h-40 text-teal-200 opacity-30" viewBox="0 0 100 100">
          <path d="M10,90 Q10,10 90,10" fill="none" stroke="currentColor" strokeWidth="3"/>
          <path d="M20,85 Q20,20 85,20" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        {/* Even More Decorative Elements */}
        {/* Top Right Spiral */}
        <svg className="absolute top-60 right-40 w-36 h-36 text-cyan-200 opacity-25" viewBox="0 0 100 100">
          <path d="M50,50 Q60,30 70,40 T80,60 Q75,75 60,75 T40,65 Q35,50 45,40" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        {/* Middle Center Diamond Grid */}
        <svg className="absolute top-1/2 left-1/2 w-32 h-32 text-teal-100 opacity-20" viewBox="0 0 100 100">
          <polygon points="50,10 70,30 50,50 30,30" fill="currentColor"/>
          <polygon points="50,50 70,70 50,90 30,70" fill="currentColor"/>
        </svg>
        
        {/* Bottom Right Flower Pattern */}
        <svg className="absolute bottom-60 right-60 w-28 h-28 text-cyan-100 opacity-30" viewBox="0 0 100 100">
          <circle cx="50" cy="20" r="12" fill="currentColor"/>
          <circle cx="80" cy="50" r="12" fill="currentColor"/>
          <circle cx="50" cy="80" r="12" fill="currentColor"/>
          <circle cx="20" cy="50" r="12" fill="currentColor"/>
          <circle cx="50" cy="50" r="15" fill="currentColor"/>
        </svg>
        
        {/* Top Left Corner Zigzag */}
        <svg className="absolute top-5 left-60 w-44 h-20 text-teal-200 opacity-25" viewBox="0 0 100 20">
          <polyline points="0,10 10,5 20,10 30,5 40,10 50,5 60,10 70,5 80,10 90,5 100,10" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        {/* Middle Right Triangles */}
        <svg className="absolute top-1/3 right-5 w-24 h-24 text-cyan-200 opacity-30" viewBox="0 0 100 100">
          <polygon points="50,10 70,40 30,40" fill="currentColor"/>
          <polygon points="50,60 70,90 30,90" fill="currentColor"/>
        </svg>
        
        {/* Bottom Left Curved Lines */}
        <svg className="absolute bottom-10 left-60 w-40 h-40 text-teal-100 opacity-25" viewBox="0 0 100 100">
          <path d="M10,10 Q50,30 90,10" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10,40 Q50,60 90,40" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10,70 Q50,90 90,70" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        {/* Top Center Cross Pattern */}
        <svg className="absolute top-16 left-2/3 w-20 h-20 text-cyan-100 opacity-30" viewBox="0 0 100 100">
          <rect x="40" y="10" width="20" height="80" fill="currentColor"/>
          <rect x="10" y="40" width="80" height="20" fill="currentColor"/>
        </svg>
        
        {/* Middle Left Pentagon */}
        <svg className="absolute top-2/3 left-32 w-28 h-28 text-teal-200 opacity-25" viewBox="0 0 100 100">
          <polygon points="50,10 90,40 75,85 25,85 10,40" fill="currentColor"/>
        </svg>
        
        {/* Bottom Center Circles Chain */}
        <svg className="absolute bottom-32 left-1/2 w-48 h-16 text-cyan-100 opacity-25" viewBox="0 0 120 30">
          <circle cx="15" cy="15" r="10" fill="currentColor"/>
          <circle cx="40" cy="15" r="10" fill="currentColor"/>
          <circle cx="65" cy="15" r="10" fill="currentColor"/>
          <circle cx="90" cy="15" r="10" fill="currentColor"/>
          <circle cx="115" cy="15" r="10" fill="currentColor"/>
        </svg>
        
        {/* Top Right Dotted Arc */}
        <svg className="absolute top-1/4 right-16 w-32 h-32 text-teal-100 opacity-30" viewBox="0 0 100 100">
          <circle cx="20" cy="80" r="4" fill="currentColor"/>
          <circle cx="30" cy="60" r="4" fill="currentColor"/>
          <circle cx="45" cy="45" r="4" fill="currentColor"/>
          <circle cx="60" cy="30" r="4" fill="currentColor"/>
          <circle cx="80" cy="20" r="4" fill="currentColor"/>
        </svg>
        
        {/* Middle Bottom Wavy Lines */}
        <svg className="absolute bottom-1/4 left-1/4 w-40 h-24 text-cyan-200 opacity-25" viewBox="0 0 100 50">
          <path d="M0,10 Q25,5 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M0,25 Q25,20 50,25 T100,25" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M0,40 Q25,35 50,40 T100,40" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        {/* Top Left Starburst */}
        <svg className="absolute top-48 left-16 w-24 h-24 text-teal-200 opacity-25" viewBox="0 0 100 100">
          <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="2"/>
          <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2"/>
          <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="2"/>
          <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        {/* Bottom Right Rounded Squares */}
        <svg className="absolute bottom-16 right-1/3 w-28 h-28 text-cyan-100 opacity-25" viewBox="0 0 100 100">
          <rect x="10" y="10" width="35" height="35" rx="8" fill="currentColor"/>
          <rect x="55" y="55" width="35" height="35" rx="8" fill="currentColor"/>
        </svg>
        
        {/* Middle Top Ellipses */}
        <svg className="absolute top-1/4 left-1/3 w-36 h-24 text-teal-100 opacity-25" viewBox="0 0 100 50">
          <ellipse cx="30" cy="25" rx="25" ry="15" fill="currentColor"/>
          <ellipse cx="70" cy="25" rx="25" ry="15" fill="currentColor"/>
        </svg>
        
        {/* Bottom Left Concentric Triangles */}
        <svg className="absolute bottom-1/3 left-1/4 w-32 h-32 text-cyan-200 opacity-25" viewBox="0 0 100 100">
          <polygon points="50,20 80,70 20,70" fill="none" stroke="currentColor" strokeWidth="2"/>
          <polygon points="50,35 70,65 30,65" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      <Sidebar
        activeTab="overview"
        setActiveTab={(tab) => {
          if (tab === 'departments') router.push('/admin/modify-dept')
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
          title={university.name}
          subtitle="Institute Coordinator"
        />
        <div className="p-6">
          <OverviewTab university={university} schedules={schedules} />
        </div>
      </div>

    </div>
  )
}
