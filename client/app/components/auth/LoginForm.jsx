'use client'

import { useState } from 'react'
import { EnvelopeIcon, KeyIcon, ArrowRightIcon, ChevronLeftIcon, HomeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
  onBack,
  config
}) {
  const [showPassword, setShowPassword] = useState(false)
  const IconComponent = config.icon

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row">
      {/* Top Left Navigation */}
      <div className="absolute top-4 left-4 z-20 flex gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
        >
          Back
        </button>
        <Link
          href="/"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
        >
          Home
        </Link>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-indigo-50/80 backdrop-blur-sm"></div>
        
        {/* Decorative SVG Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Circles */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-200/20 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/20 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-200/15 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-indigo-300/20 rounded-full animate-float"></div>
          
          {/* SVG Shapes */}
          <svg className="absolute top-20 right-1/4 w-24 h-24 text-indigo-300/25 animate-float" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="currentColor"/>
          </svg>
          <svg className="absolute bottom-32 left-1/3 w-28 h-28 text-purple-300/20 animate-float-delayed" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" rx="10" fill="currentColor"/>
          </svg>
          <svg className="absolute top-1/3 left-20 w-20 h-20 text-blue-300/25 animate-float-slow" viewBox="0 0 100 100">
            <polygon points="50,10 90,40 75,85 25,85 10,40" fill="currentColor"/>
          </svg>
          <svg className="absolute bottom-1/4 right-20 w-32 h-32 text-indigo-200/20 animate-float" viewBox="0 0 100 100">
            <polygon points="50,5 90,25 90,65 50,85 10,65 10,25" fill="currentColor"/>
          </svg>
          <svg className="absolute top-1/2 right-1/3 w-16 h-16 text-purple-300/30 animate-float-delayed" viewBox="0 0 100 100">
            <polygon points="50,10 61,35 88,35 66,52 77,77 50,60 23,77 34,52 12,35 39,35" fill="currentColor"/>
          </svg>
          <svg className="absolute top-2/3 left-1/4 w-20 h-20 text-blue-300/20 animate-float-slow" viewBox="0 0 100 100">
            <circle cx="30" cy="30" r="20" fill="currentColor"/>
            <circle cx="70" cy="70" r="15" fill="currentColor"/>
          </svg>
          <svg className="absolute top-1/4 left-1/2 w-22 h-22 text-indigo-300/25 animate-float" viewBox="0 0 100 100">
            <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="currentColor"/>
          </svg>
          <svg className="absolute bottom-1/3 right-1/4 w-26 h-26 text-purple-200/20 animate-float-delayed" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="40" ry="25" fill="currentColor"/>
          </svg>
          <svg className="absolute top-1/2 left-1/3 w-18 h-18 text-blue-300/30 animate-float-slow" viewBox="0 0 100 100">
            <rect x="25" y="25" width="50" height="50" rx="15" fill="currentColor" transform="rotate(45 50 50)"/>
          </svg>
          <svg className="absolute bottom-1/2 right-1/2 w-24 h-24 text-indigo-300/20 animate-float" viewBox="0 0 100 100">
            <path d="M50,20 Q80,50 50,80 Q20,50 50,20" fill="currentColor"/>
          </svg>
          <svg className="absolute top-16 left-1/4 w-20 h-20 text-purple-300/25 animate-float-delayed" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="8"/>
          </svg>
          <svg className="absolute bottom-16 right-1/3 w-28 h-28 text-blue-200/20 animate-float-slow" viewBox="0 0 100 100">
            <polygon points="50,15 65,40 92,40 70,58 78,85 50,67 22,85 30,58 8,40 35,40" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="relative z-10 text-center max-w-lg w-full">
          <div className="mb-6 sm:mb-8 mt-16 lg:mt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{config.title}</h1>
            <p className="text-base text-gray-700 mb-4 font-medium">{config.subtitle}</p>
            <p className="text-sm text-gray-600 leading-relaxed px-4 lg:px-0">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Decorative SVG Background Elements for Right Side */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-10 left-10 w-20 h-20 text-indigo-200/20 animate-spin-slow" viewBox="0 0 100 100">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="currentColor"/>
          </svg>
          <svg className="absolute bottom-10 right-10 w-24 h-24 text-purple-200/20 animate-float" viewBox="0 0 100 100">
            <circle cx="25" cy="25" r="15" fill="currentColor"/>
            <circle cx="75" cy="25" r="15" fill="currentColor"/>
            <circle cx="25" cy="75" r="15" fill="currentColor"/>
            <circle cx="75" cy="75" r="15" fill="currentColor"/>
          </svg>
          <svg className="absolute top-1/3 right-16 w-16 h-16 text-blue-200/25 animate-float-delayed" viewBox="0 0 100 100">
            <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="currentColor"/>
          </svg>
          <svg className="absolute bottom-1/3 left-16 w-18 h-18 text-indigo-200/20 animate-float-slow" viewBox="0 0 100 100">
            <polygon points="50,5 80,25 80,65 50,85 20,65 20,25" fill="currentColor"/>
          </svg>
          <svg className="absolute top-1/2 left-1/4 w-14 h-14 text-purple-200/25 animate-float" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" rx="10" fill="currentColor" transform="rotate(20 50 50)"/>
          </svg>
          <svg className="absolute bottom-1/2 right-1/4 w-16 h-16 text-blue-200/20 animate-float-delayed" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="6"/>
            <circle cx="50" cy="50" r="15" fill="currentColor"/>
          </svg>
          <div className="absolute top-20 right-1/3 w-28 h-28 bg-indigo-200/15 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-24 left-1/3 w-20 h-20 bg-purple-200/15 rounded-full animate-float"></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-indigo-200">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label htmlFor="email-address" className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                  placeholder={config.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`group w-full flex items-center justify-center py-3 px-6 text-sm font-semibold text-white bg-gradient-to-r ${config.gradient} rounded-lg hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-3"></div>
                      <span className="text-sm">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <IconComponent className="h-5 w-5 mr-3" />
                      <span className="text-sm">Sign In</span>
                      <ArrowRightIcon className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className={`mt-4 p-3 bg-gradient-to-r ${config.gradient}/10 rounded-lg border border-indigo-200`}>
              <h3 className="text-xs font-semibold text-gray-800 mb-2">
                {config.helpTitle}
              </h3>
              <p className="text-xs text-gray-600">{config.helpText}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  )
}
