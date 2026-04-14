'use client'

import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function RoleCard({ role, icon: Icon, title, description, features, gradient, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
    >
      <div className={`bg-white backdrop-blur-sm rounded-xl p-6 border ${gradient === 'indigo' ? 'border-indigo-300 hover:border-indigo-500' : 'border-purple-300 hover:border-purple-500'} shadow-lg hover:shadow-xl transition-all duration-300`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-6 bg-gradient-to-br ${gradient === 'indigo' ? 'from-[#3c6e71] to-[#2a5a5d]' : 'from-[#52796f] to-[#354f52]'} rounded-2xl group-hover:scale-110 transition-transform shadow-2xl`}>
              {gradient === 'indigo' ? (
                <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" opacity="0.3" />
                </svg>
              ) : (
                <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M16 10h.01M8 14h.01M16 14h.01" opacity="0.5" />
                </svg>
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">{description}</p>
          <div className="space-y-2 mb-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center justify-center text-sm text-gray-700">
                <feature.icon className={`h-4 w-4 mr-2 ${gradient === 'indigo' ? 'text-indigo-600' : 'text-purple-600'}`} />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
          <div className={`flex items-center justify-center ${gradient === 'indigo' ? 'text-indigo-700' : 'text-purple-700'} font-semibold ${gradient === 'indigo' ? 'group-hover:text-indigo-800' : 'group-hover:text-purple-800'} transition-colors`}>
            <span>Sign in as {role}</span>
            <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  )
}
