'use client'

import { ArrowRightIcon } from '@heroicons/react/24/outline'

const GRADIENT_STYLES = {
  blue: {
    border: 'border-blue-300 hover:border-blue-500',
    icon: 'from-blue-600 to-blue-700',
    feature: 'text-blue-600',
    cta: 'text-blue-700 group-hover:text-blue-800',
  },
  purple: {
    border: 'border-purple-300 hover:border-purple-500',
    icon: 'from-purple-600 to-purple-700',
    feature: 'text-purple-600',
    cta: 'text-purple-700 group-hover:text-purple-800',
  },
  teal: {
    border: 'border-teal-300 hover:border-teal-500',
    icon: 'from-teal-600 to-teal-700',
    feature: 'text-teal-600',
    cta: 'text-teal-700 group-hover:text-teal-800',
  },
}

export default function RoleCard({ role, icon: Icon, title, description, features, gradient, onClick }) {
  const s = GRADIENT_STYLES[gradient] || GRADIENT_STYLES.teal

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
    >
      <div className={`bg-white backdrop-blur-sm rounded-xl p-6 border ${s.border} shadow-lg hover:shadow-xl transition-all duration-300`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-5 bg-gradient-to-br ${s.icon} rounded-2xl group-hover:scale-110 transition-transform shadow-2xl`}>
              <Icon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">{description}</p>
          <div className="space-y-2 mb-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center justify-center text-sm text-gray-700">
                <feature.icon className={`h-4 w-4 mr-2 ${s.feature}`} />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
          <div className={`flex items-center justify-center ${s.cta} font-semibold transition-colors`}>
            <span>Sign in as {role}</span>
            <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  )
}
