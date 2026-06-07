'use client'

import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { signOut } from 'next-auth/react'

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, tabs, portalLabel }) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="flex flex-col h-full relative z-10">
        {/* Logo Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-md opacity-40 rounded-2xl"></div>
              <div className="relative bg-gradient-primary p-3 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{portalLabel || 'CampusCompass'}</h2>
              <p className="text-xs text-gray-600 font-medium">Management System</p>
            </div>
          </div>
        </div>



        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSidebarOpen(false)
              }}
              className={`group relative w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100 border border-transparent'
              }`}
              style={{animationDelay: `${index * 50}ms`}}
            >
              {/* Active indicator */}
              {activeTab === tab.id && (
                <>

                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-white rounded-r-full shadow-lg"></div>
                </>
              )}
              

              
              <div className={`relative flex items-center w-full z-10`}>
                <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <tab.icon className={`h-5 w-5 transition-all duration-300 ${
                    activeTab === tab.id ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-110'
                  }`} />
                </div>
                <span className="flex-1 text-left font-semibold">{tab.label}</span>
                {tab.badge && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">

          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-all duration-300 group"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-100 mr-3 transition-all duration-300">
              <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
