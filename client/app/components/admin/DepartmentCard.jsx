'use client'

import { useState } from 'react'
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  AcademicCapIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function DepartmentCard({ department, onClick }) {
  const [copiedText, setCopiedText] = useState('')

  const copyToClipboard = (text, label, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(''), 2000)
  }

  return (
    <div 
      onClick={() => onClick(department)}
      className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 hover:border-teal-200"
    >
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mr-4 group-hover:shadow-lg transition-all">
          <BuildingOfficeIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{department.name}</h3>
          {department.code && <p className="text-sm text-gray-500 font-medium">{department.code}</p>}
        </div>
      </div>

      {/* Credentials */}
      {(department.coordinator?.email || department.coordinator?.plainPassword) && (
        <div className="space-y-3">
          {department.coordinator?.email && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Email</span>
                <button 
                  onClick={(e) => copyToClipboard(department.coordinator.email, 'email', e)}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {copiedText === 'email' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm font-mono font-semibold text-gray-900 break-all">{department.coordinator.email}</p>
            </div>
          )}
          {department.coordinator?.plainPassword && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Password</span>
                <button 
                  onClick={(e) => copyToClipboard(department.coordinator.plainPassword, 'password', e)}
                  className="text-xs px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  {copiedText === 'password' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm font-mono font-semibold text-gray-900 break-all">{department.coordinator.plainPassword}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}