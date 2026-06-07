'use client'

import { AcademicCapIcon, UserGroupIcon, ShieldCheckIcon, HomeIcon, BookOpenIcon, CogIcon, CalendarDaysIcon, ClipboardDocumentListIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import RoleCard from './RoleCard'
import Link from 'next/link'

export default function RoleSelection({ onRoleSelect }) {
  const roles = [
    {
      role: 'Student',
      icon: AcademicCapIcon,
      title: 'Student',
      description: 'Access your timetable, track course progress, and view academic analytics.',
      features: [
        { icon: CalendarDaysIcon, text: 'View timetable' },
        { icon: BookOpenIcon, text: 'Course progress' },
        { icon: ChartBarIcon, text: 'Academic analytics' }
      ],
      gradient: 'blue',
      value: 'student'
    },
    {
      role: 'Teacher',
      icon: UserGroupIcon,
      title: 'Teacher',
      description: 'Manage your schedule, track lectures, and view student analytics.',
      features: [
        { icon: CalendarDaysIcon, text: 'Teaching schedule' },
        { icon: ClipboardDocumentListIcon, text: 'Lecture tracking' },
        { icon: ChartBarIcon, text: 'Student analytics' }
      ],
      gradient: 'purple',
      value: 'teacher'
    },
    {
      role: 'Admin',
      icon: ShieldCheckIcon,
      title: 'Admin',
      description: 'Department management, schedule generation, faculty coordination, and resource optimization.',
      features: [
        { icon: CogIcon, text: 'Schedule generation' },
        { icon: UserGroupIcon, text: 'Faculty management' },
        { icon: ChartBarIcon, text: 'Department analytics' }
      ],
      gradient: 'teal',
      value: 'admin'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-100/50 to-cyan-100/50"></div>
      <div className="relative flex items-center justify-center min-h-screen py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full">
          <Link
            href="/"
            className="absolute top-8 left-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            <span className="text-sm sm:text-base">Home</span>
          </Link>
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Welcome to CampusCompass</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Select your role to access your dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
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
              Powered by Team Eklavya_01 • CampusCompass
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
