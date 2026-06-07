'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { signOut } from 'next-auth/react'

export default function TeacherDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session.user.role !== 'teacher') {
      router.push('/')
    }
  }, [status, session, router])

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent" />
      </div>
    )
  }

  const cards = [
    { icon: CalendarDaysIcon, title: 'My Schedule', desc: 'View your teaching timetable', color: 'purple', soon: false },
    { icon: ClipboardDocumentListIcon, title: 'Lecture Tracking', desc: 'Log completed lectures', color: 'teal', soon: true },
    { icon: UserGroupIcon, title: 'Student Analytics', desc: 'View student attendance and progress', color: 'blue', soon: true },
    { icon: ChartBarIcon, title: 'Lecture Analytics', desc: 'Lectures delivered vs planned', color: 'amber', soon: true },
    { icon: ClockIcon, title: 'Leave Management', desc: 'Apply for leave, view substitutes', color: 'rose', soon: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-7 w-7 text-purple-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
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
          <p className="text-gray-600 mt-1">Here's your teaching overview.</p>
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
