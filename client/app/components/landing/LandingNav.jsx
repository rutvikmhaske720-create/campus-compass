'use client'

import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - 68
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setIsMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { id: 'workflow', label: 'Workflow' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'tech-stack', label: 'Tech Stack' },
    { id: 'team', label: 'Team' }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm'
    } border-b border-slate-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-2 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg shadow-md">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M 4 4 Q 2 12 4 20" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M 4 4 L 4 20" opacity="0.6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M 4 12 L 20 12" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M 16 8 L 20 12 L 16 16" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M 6 10 L 4 12 L 6 14" opacity="0.7" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Eklavya
              </div>
              <div className="text-xs text-slate-500 -mt-1">Automated Timetable Scheduler</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Sign In */}
          <div className="hidden md:flex items-center">
            <a
              href="/auth/signin"
              className="group relative px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3">
              <a
                href="/auth/signin"
                className="block w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg hover:shadow-lg transition-all text-center"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
