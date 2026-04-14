'use client'

import { ShieldCheckIcon, AcademicCapIcon, BuildingOfficeIcon, CogIcon, UserGroupIcon, SparklesIcon, HomeIcon } from '@heroicons/react/24/outline'
import RoleCard from './RoleCard'
import Link from 'next/link'

export default function RoleSelection({ onRoleSelect }) {
  const roles = [
    {
      role: 'Institute Coordinator',
      icon: ShieldCheckIcon,
      title: 'Institute Coordinator',
      description: 'Complete oversight of all departments with automated scheduling, analytics, and administrative controls.',
      features: [
        { icon: BuildingOfficeIcon, text: 'Institute-wide oversight' },
        { icon: CogIcon, text: 'System configuration' },
        { icon: UserGroupIcon, text: 'User management' }
      ],
      gradient: 'indigo',
      value: 'admin'
    },
    {
      role: 'Department Coordinator',
      icon: AcademicCapIcon,
      title: 'Department Coordinator',
      description: 'Department-specific access for managing schedules, faculty, and academic resources within your department.',
      features: [
        { icon: AcademicCapIcon, text: 'Department management' },
        { icon: CogIcon, text: 'Schedule optimization' },
        { icon: UserGroupIcon, text: 'Faculty coordination' }
      ],
      gradient: 'purple',
      value: 'coordinator'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-100/50 to-cyan-100/50"></div>
      <div className="relative flex items-center justify-center min-h-screen py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <Link
            href="/"
            className="absolute top-8 left-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            <span className="text-sm sm:text-base">Home</span>
          </Link>
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Access your automated timetable scheduling dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            {roles.map((role) => (
              <RoleCard
                key={role.value}
                {...role}
                onClick={() => onRoleSelect(role.value)}
              />
            ))}
          </div>

          <div className="text-center mt-4 sm:mt-6">
            <p className="text-gray-600 text-xs sm:text-sm px-4">
              Powered by Team Eklavya • Secure AI-Driven University Timetable Management
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
