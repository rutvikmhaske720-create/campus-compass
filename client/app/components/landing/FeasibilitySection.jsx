'use client'

import { CpuChipIcon, CurrencyDollarIcon, UserIcon, CloudIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function FeasibilitySection() {
  const feasibility = [
    { icon: CpuChipIcon, title: 'Technical', desc: 'CP-SAT & Gale-Shapley algorithms proven', color: 'blue' },
    { icon: CurrencyDollarIcon, title: 'Economic', desc: 'Open-source tools Free implementation', color: 'emerald' },
    { icon: UserIcon, title: 'User Viability', desc: 'Optimized timetables Reduced admin effort', color: 'purple' },
    { icon: CloudIcon, title: 'Operational', desc: 'Cloud-based system Zero maintenance', color: 'indigo' },
    { icon: ArrowTrendingUpIcon, title: 'Scalability', desc: 'Highly customizable Any scale university', color: 'pink' }
  ]

  const challenges = [
    {
      risk: 'Data Accuracy',
      issue: 'Input errors may cause invalid schedules',
      solution: 'Admin Validation Dashboard error-checking Admin acts as filter'
    },
    {
      risk: 'Variable Constraints',
      issue: 'Universities have unique complex policies',
      solution: 'Customizable Module University-specific rules Extensive admin tools'
    }
  ]

  return (
    <div className="py-10 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Feasibility & Viability</h2>
          <p className="text-base text-gray-600">Proven, scalable, and economically viable solution</p>
        </div>

        {/* Feasibility Cards with Flow */}
        <div className="relative mb-12">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {feasibility.map((item, i) => (
              <div key={i} className="relative animate-fade-in" style={{animationDelay: `${i * 150}ms`}}>
                <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 relative z-10">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 text-center">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed text-center">{item.desc}</p>
                </div>

                {i < feasibility.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 z-20 -translate-y-1/2">
                    <ArrowRightIcon className="h-6 w-6 text-purple-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Challenges & Solutions */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200">
          <div className="flex items-center justify-center mb-8">
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">Challenges & Solutions Flow</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {challenges.map((item, i) => (
              <div key={i} className="relative animate-fade-in" style={{animationDelay: `${(i + 5) * 150}ms`}}>
                <div className="flex items-start gap-4">
                  {/* Challenge */}
                  <div className="flex-1 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200">
                    <div className="flex items-center mb-3">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                      <h4 className="text-lg font-bold text-gray-900">{item.risk}</h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.issue}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center pt-8">
                    <ArrowRightIcon className="h-8 w-8 text-emerald-500 animate-pulse" />
                  </div>

                  {/* Solution */}
                  <div className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200">
                    <div className="flex items-center mb-3">
                      <ShieldCheckIcon className="h-6 w-6 text-emerald-600 mr-2" />
                      <h4 className="text-lg font-bold text-gray-900">Solution</h4>
                    </div>
                    <p className="text-sm text-emerald-700 font-medium leading-relaxed">{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
