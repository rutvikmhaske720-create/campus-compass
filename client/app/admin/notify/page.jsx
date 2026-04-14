'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/app/components/shared/DashboardNav'
import Sidebar from '@/app/components/shared/Sidebar'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import toast from 'react-hot-toast'
import { ChartBarIcon, BuildingOfficeIcon, CalendarDaysIcon, BellIcon, DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

export default function NotifyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [university, setUniversity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    recipient: 'all',
    department: '',
    title: '',
    body: ''
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.body) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.recipient === 'department' && !formData.department) {
      toast.error('Please select a department')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/admin/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Notification sent successfully!')
        setFormData({ recipient: 'all', department: '', title: '', body: '' })
      } else {
        toast.error('Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Error sending notification')
    } finally {
      setSending(false)
    }
  }

  if (loading || status === 'loading') {
    return <LoadingSpinner message="Loading notification panel..." />
  }

  return (
    <div className="min-h-screen dark-bg flex">
      <Sidebar
        activeTab="notify"
        setActiveTab={(tab) => {
          if (tab === 'overview') router.push('/admin/dashboard')
          else if (tab === 'departments') router.push('/admin/modify-dept')
          else if (tab === 'schedules') router.push('/admin/mdm-config')
          else if (tab === 'all-schedules') router.push('/admin/all-schedules')
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tabs={tabs}
      />

      <div className="flex-1 lg:ml-0">
        <DashboardNav 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          title={university?.name || 'Notifications'}
          subtitle="Send Notifications"
        />
        <div className="p-4">
          <div>
            {/* Header */}
            <div className="bg-white rounded-xl border border-secondary p-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BellIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Send Notification</h2>
                  <p className="text-sm text-gray-600">Send email notifications to coordinators</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-secondary p-4 space-y-4">
              {/* Recipient Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Send To <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value, department: '' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800"
                >
                  <option value="all">All Departments</option>
                  <option value="department">Specific Department</option>
                </select>
              </div>

              {/* Department Selection (conditional) */}
              {formData.recipient === 'department' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Select Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800"
                  >
                    <option value="">Choose a department...</option>
                    {university?.departments?.map((dept) => (
                      <option key={dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter notification title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Enter notification message"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                <span>{sending ? 'Sending...' : 'Send Notification'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
