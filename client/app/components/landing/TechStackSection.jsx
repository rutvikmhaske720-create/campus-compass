'use client'

import { CodeBracketIcon } from '@heroicons/react/24/outline'

export default function TechStackSection() {
  const techStack = {
    frontend: [
      { name: 'Next.js 15', color: '#000000', icon: 'N' },
      { name: 'React 18', color: '#61DAFB', icon: '⚛' },
      { name: 'Tailwind CSS', color: '#06B6D4', icon: 'T' },
      { name: 'Heroicons', color: '#8B5CF6', icon: '★' }
    ],
    backend: [
      { name: 'Python', color: '#3776AB', icon: 'Py' },
      { name: 'Flask', color: '#000000', icon: 'F' },
      { name: 'MongoDB', color: '#47A248', icon: 'M' },
      { name: 'NextAuth', color: '#000000', icon: 'A' }
    ],
    ai: [
      { name: 'Google OR-Tools', color: '#4285F4', icon: 'OR' },
      { name: 'Gemini AI', color: '#8E75B2', icon: 'G' },
      { name: 'NumPy', color: '#013243', icon: 'N' },
      { name: 'Pandas', color: '#150458', icon: 'P' }
    ],
    tools: [
      { name: 'XLSX', color: '#217346', icon: 'XL' },
      { name: 'Bcrypt', color: '#338033', icon: 'B' },
      { name: 'Gunicorn', color: '#499848', icon: 'G' },
      { name: 'Flask-CORS', color: '#FF6B6B', icon: 'C' }
    ]
  }

  return (
    <div className="pt-16 bg-transparent relative overflow-hidden">
      {/* Animated Background Circles */}
      <svg className="absolute inset-0 w-full h-full opacity-10" style={{zIndex: 0}} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <circle cx="250" cy="180" r="260" fill="#14b8a6" opacity="0.1">
          <animate attributeName="r" values="260;280;260" dur="7s" repeatCount="indefinite"/>
        </circle>
        <circle cx="950" cy="620" r="310" fill="#10b981" opacity="0.1">
          <animate attributeName="r" values="310;330;310" dur="9s" repeatCount="indefinite"/>
        </circle>
      </svg>

      {/* Decorative SVG Icons */}
      <svg className="absolute top-10 left-5 w-20 h-20 text-cyan-200 opacity-30" viewBox="0 0 100 100">
        <polygon points="50,10 90,35 75,75 25,75 10,35" fill="none" stroke="currentColor" strokeWidth="2">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="12s" repeatCount="indefinite"/>
        </polygon>
      </svg>
      <svg className="absolute bottom-10 right-5 w-24 h-24 text-emerald-200 opacity-30" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3">
          <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="10s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-3">
            <CodeBracketIcon className="h-8 w-8 text-teal-600 mr-2" />
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Tech Stack</h2>
          </div>
          <p className="text-lg text-slate-600">Powered by cutting-edge technologies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Frontend */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-teal-500 animate-fade-in hover:shadow-xl hover:scale-105 transition-all duration-300" style={{animationDelay: '100ms'}}>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
              Frontend
            </h3>
            <div className="space-y-3">
              {techStack.frontend.map((tech, i) => (
                <div key={i} className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" style={{animationDelay: `${i * 100}ms`}}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mr-3" style={{backgroundColor: tech.color}}>
                    {tech.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-emerald-500 animate-fade-in hover:shadow-xl hover:scale-105 transition-all duration-300" style={{animationDelay: '200ms'}}>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Backend
            </h3>
            <div className="space-y-3">
              {techStack.backend.map((tech, i) => (
                <div key={i} className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mr-3" style={{backgroundColor: tech.color}}>
                    {tech.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI & Algorithms */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-cyan-500 animate-fade-in hover:shadow-xl hover:scale-105 transition-all duration-300" style={{animationDelay: '300ms'}}>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
              AI & Algorithms
            </h3>
            <div className="space-y-3">
              {techStack.ai.map((tech, i) => (
                <div key={i} className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mr-3" style={{backgroundColor: tech.color}}>
                    {tech.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tools & Libraries */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-teal-600 animate-fade-in hover:shadow-xl hover:scale-105 transition-all duration-300" style={{animationDelay: '400ms'}}>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-teal-600 rounded-full mr-2"></span>
              Tools & Libraries
            </h3>
            <div className="space-y-3">
              {techStack.tools.map((tech, i) => (
                <div key={i} className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mr-3" style={{backgroundColor: tech.color}}>
                    {tech.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
