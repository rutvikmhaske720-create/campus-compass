'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  CalendarDaysIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { signOut } from 'next-auth/react'

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session.user.role !== 'student') {
      router.push('/')
    }
  }, [status, session, router])

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent" />
      </div>
    )
  }

  const cards = [
    { icon: CalendarDaysIcon, title: 'My Timetable', desc: 'View your weekly class schedule', color: 'blue', soon: false },
    { icon: BookOpenIcon, title: 'Course Progress', desc: 'Track completion across all courses', color: 'teal', soon: true },
    { icon: ChartBarIcon, title: 'Lecture Analytics', desc: 'Lectures attended vs total scheduled', color: 'purple', soon: true },
    { icon: ClockIcon, title: 'Academic Calendar', desc: 'Holidays, exams, and key dates', color: 'amber', soon: true },
    { icon: AcademicCapIcon, title: 'Pre-course Survey', desc: 'Complete surveys before the semester', color: 'rose', soon: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="h-7 w-7 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              3D Campus
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {session.user.name || session.user.email?.split('@')[0]}
          </h2>
          <p className="text-gray-600 mt-1">Here's your academic overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              {card.soon && (
                <span className="absolute top-3 right-3 text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              )}
              <div className={`inline-flex p-3 rounded-xl bg-${card.color}-100 mb-4`}>
                <card.icon className={`h-6 w-6 text-${card.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
