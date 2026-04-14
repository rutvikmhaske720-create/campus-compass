'use client'

import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function WorkflowSection() {
  const steps = [
    { title: 'Upload Data', desc: 'Excel with faculty, rooms, courses', color: '#14b8a6' },
    { title: 'AI Processing', desc: 'CP-SAT + GA optimization', color: '#10b981' },
    { title: 'Review Options', desc: '3 optimized schedules', color: '#06b6d4' }
  ]

  return (
    <div className="py-16 bg-transparent relative overflow-hidden">
      {/* Animated Background Circles */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <circle cx="220" cy="170" r="290" fill="#14b8a6" opacity="0.1">
          <animate attributeName="r" values="290;310;290" dur="9s" repeatCount="indefinite"/>
        </circle>
        <circle cx="980" cy="630" r="340" fill="#10b981" opacity="0.1">
          <animate attributeName="r" values="340;360;340" dur="11s" repeatCount="indefinite"/>
        </circle>
      </svg>
      {/* Decorative SVG Background */}
      <svg className="absolute top-0 right-0 w-64 h-64 text-teal-100 opacity-50" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="30s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3">
          <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="20s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <svg className="absolute bottom-0 left-0 w-48 h-48 text-emerald-100 opacity-40" viewBox="0 0 100 100">
        <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="25s" repeatCount="indefinite"/>
        </polygon>
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3"/>
      </svg>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-slide-in-top">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">How It Works</h2>
          <p className="text-lg text-slate-600">Simple 3-step process to generate optimal timetables</p>
        </div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-teal-200 via-emerald-200 to-cyan-200 -translate-y-1/2 animate-fade-in" style={{animationDelay: '300ms'}}></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {steps.map((step, i) => (
              <div key={i} className="relative animate-slide-in-bottom" style={{animationDelay: `${i * 150}ms`}}>
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100 hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 relative z-10">
                  {/* Step Number Circle */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{backgroundColor: step.color}}>
                    {i + 1}
                  </div>

                  {/* SVG Icon */}
                  <div className="mb-4">
                    <svg className="w-20 h-20 mx-auto" viewBox="0 0 100 100">
                      {i === 0 && (
                        <>
                          <rect x="20" y="30" width="60" height="50" fill={step.color} opacity="0.2" rx="4"/>
                          <rect x="30" y="40" width="15" height="3" fill={step.color}/>
                          <rect x="30" y="50" width="25" height="3" fill={step.color}/>
                          <rect x="30" y="60" width="20" height="3" fill={step.color}/>
                          <path d="M 70 45 L 75 50 L 70 55" stroke={step.color} strokeWidth="2" fill="none"/>
                        </>
                      )}
                      {i === 1 && (
                        <>
                          <circle cx="50" cy="50" r="25" fill={step.color} opacity="0.2"/>
                          <path d="M 40 50 L 45 55 L 60 40" stroke={step.color} strokeWidth="3" fill="none" strokeLinecap="round"/>
                          <circle cx="35" cy="35" r="3" fill={step.color}/>
                          <circle cx="65" cy="35" r="3" fill={step.color}/>
                          <circle cx="35" cy="65" r="3" fill={step.color}/>
                        </>
                      )}
                      {i === 2 && (
                        <>
                          <rect x="15" y="35" width="25" height="35" fill={step.color} opacity="0.2" rx="2"/>
                          <rect x="45" y="30" width="25" height="35" fill={step.color} opacity="0.3" rx="2"/>
                          <rect x="75" y="25" width="10" height="35" fill={step.color} opacity="0.15" rx="2"/>
                          <path d="M 27 45 L 32 50 L 27 55" stroke={step.color} strokeWidth="2" fill="none"/>
                        </>
                      )}
                      {i === 3 && (
                        <>
                          <circle cx="50" cy="35" r="8" fill={step.color} opacity="0.3"/>
                          <path d="M 50 43 L 50 70" stroke={step.color} strokeWidth="3"/>
                          <path d="M 35 60 L 50 70 L 65 60" stroke={step.color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          <rect x="30" y="70" width="40" height="5" fill={step.color} opacity="0.2" rx="2"/>
                        </>
                      )}
                    </svg>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 text-center">{step.title}</h3>
                  <p className="text-sm text-slate-600 text-center leading-snug">{step.desc}</p>
                </div>

                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-20 -translate-y-1/2">
                    <ArrowRightIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
