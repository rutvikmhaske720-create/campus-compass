'use client'

import { CurrencyDollarIcon, RocketLaunchIcon, SparklesIcon, BellIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'

export default function BusinessSection() {
  const businessModel = [
    { title: 'Freemium Model', desc: 'Basic version free (single department), premium for multi-department and LLM suggestions' },
    { title: 'Integration Services', desc: 'One-time or recurring fees for ERP, LMS, or student portal connections' },
    { title: 'Government Tie-ups', desc: 'NAAC/AICTE compliance partnerships' }
  ]

  const futureScope = [
    { icon: DevicePhoneMobileIcon, title: 'Mobile-Friendly Interface', desc: 'Responsive design for students and faculty on-the-go' },
    { icon: BellIcon, title: 'Push Notifications', desc: 'Real-time alerts for sudden class or schedule changes' },
    { icon: SparklesIcon, title: 'AI Workload Balancing', desc: 'Smart recommendations for fair faculty workload distribution' }
  ]

  return (
    <div className="py-10 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Neural Network Background */}
      <svg className="absolute inset-0 w-full h-full opacity-10" style={{zIndex: 0}}>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5"/>
        <circle cx="20%" cy="30%" r="4" fill="#8b5cf6"/>
        <circle cx="50%" cy="20%" r="4" fill="#ec4899"/>
        <circle cx="80%" cy="40%" r="4" fill="#10b981"/>
        <line x1="20%" y1="30%" x2="50%" y2="20%" stroke="#8b5cf6" strokeWidth="1" opacity="0.5"/>
        <line x1="50%" y1="20%" x2="80%" y2="40%" stroke="#ec4899" strokeWidth="1" opacity="0.5"/>
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Business Model */}
          <div className="animate-fade-in">
            <div className="flex items-center mb-6">
              <CurrencyDollarIcon className="h-10 w-10 text-emerald-600 mr-3" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Business Model</h2>
            </div>

            {/* SVG Illustration */}
            <div className="mb-6">
              <svg viewBox="0 0 300 200" className="w-full h-auto">
                <rect x="20" y="40" width="80" height="60" fill="#10b981" opacity="0.2" rx="8"/>
                <text x="60" y="75" textAnchor="middle" fontSize="12" fill="#059669" fontWeight="bold">Free</text>
                <rect x="110" y="30" width="80" height="70" fill="#3b82f6" opacity="0.3" rx="8"/>
                <text x="150" y="70" textAnchor="middle" fontSize="12" fill="#2563eb" fontWeight="bold">Premium</text>
                <rect x="200" y="20" width="80" height="80" fill="#8b5cf6" opacity="0.4" rx="8"/>
                <text x="240" y="65" textAnchor="middle" fontSize="12" fill="#7c3aed" fontWeight="bold">Enterprise</text>
                <path d="M 60 100 L 150 100 L 240 100" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5"/>
              </svg>
            </div>

            <div className="space-y-4">
              {businessModel.map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-md border-l-4 border-emerald-500 hover:shadow-lg hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in" style={{animationDelay: `${i * 150}ms`}}>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Future Scope */}
          <div className="animate-fade-in" style={{animationDelay: '300ms'}}>
            <div className="flex items-center mb-6">
              <RocketLaunchIcon className="h-10 w-10 text-indigo-600 mr-3" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Future Scope</h2>
            </div>

            {/* SVG Illustration */}
            <div className="mb-6">
              <svg viewBox="0 0 300 200" className="w-full h-auto">
                <circle cx="150" cy="100" r="60" fill="#6366f1" opacity="0.1"/>
                <circle cx="150" cy="100" r="40" fill="#8b5cf6" opacity="0.2"/>
                <circle cx="150" cy="100" r="20" fill="#ec4899" opacity="0.3"/>
                <path d="M 150 40 L 150 20" stroke="#6366f1" strokeWidth="3"/>
                <circle cx="150" cy="15" r="5" fill="#6366f1"/>
                <path d="M 90 70 L 70 50" stroke="#8b5cf6" strokeWidth="2"/>
                <path d="M 210 70 L 230 50" stroke="#ec4899" strokeWidth="2"/>
                <path d="M 90 130 L 70 150" stroke="#10b981" strokeWidth="2"/>
                <path d="M 210 130 L 230 150" stroke="#f59e0b" strokeWidth="2"/>
              </svg>
            </div>

            <div className="space-y-4">
              {futureScope.map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-md border-l-4 border-indigo-500 hover:shadow-lg hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in" style={{animationDelay: `${(i + 3) * 150}ms`}}>
                  <div className="flex items-start">
                    <item.icon className="h-8 w-8 text-indigo-600 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
