'use client'

import { AcademicCapIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

export default function ImpactSection() {
  const benefits = {
    students: [
      'Balanced Academic Schedule with healthy mixture of theory, labs, electives',
      'Reduced Idle Time - minimized waiting gaps between lectures',
      'Convenient Classroom allocations - nearby rooms reducing campus travel'
    ],
    faculty: [
      'Fair Workload Distribution - evenly allocated or strategically clustered',
      'Ease in Managing Preferences - select subjects and preferred time slots',
      'Support for Visiting and Part-Time Teachers with priority scheduling'
    ],
    admin: [
      'Reduced Administrative Burden - automated process saving weeks of effort',
      'Optimal Resource Utilization - efficient allocation of classrooms and labs',
      'Scalability Across Departments - handles single to thousands of students'
    ]
  }

  return (
    <div className="py-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Neural Network Background */}
      <svg className="absolute inset-0 w-full h-full opacity-10" style={{zIndex: 0}}>
        <circle cx="20%" cy="40%" r="5" fill="#3b82f6"/>
        <circle cx="50%" cy="60%" r="5" fill="#8b5cf6"/>
        <circle cx="80%" cy="30%" r="5" fill="#10b981"/>
        <path d="M 20% 40% L 50% 60% L 80% 30%" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="5,5"/>
      </svg>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Impact & Benefits</h2>
          <p className="text-lg text-slate-600">Transforming experiences for all stakeholders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200 -translate-y-1/2"></div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in relative z-10">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-600 rounded-xl">
                <AcademicCapIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 ml-3">Students</h3>
            </div>
            <div className="space-y-4">
              {benefits.students.map((benefit, i) => (
                <div key={i} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500 hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in relative z-10" style={{animationDelay: '200ms'}}>
            <div className="flex items-center mb-6">
              <div className="p-3 bg-purple-600 rounded-xl">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 ml-3">Faculty</h3>
            </div>
            <div className="space-y-4">
              {benefits.faculty.map((benefit, i) => (
                <div key={i} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-emerald-500 hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in relative z-10" style={{animationDelay: '400ms'}}>
            <div className="flex items-center mb-6">
              <div className="p-3 bg-emerald-600 rounded-xl">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 ml-3">Administration</h3>
            </div>
            <div className="space-y-4">
              {benefits.admin.map((benefit, i) => (
                <div key={i} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 bg-emerald-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
