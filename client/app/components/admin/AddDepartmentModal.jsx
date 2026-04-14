'use client'

import { useState } from 'react'
import { XMarkIcon, BuildingOfficeIcon, KeyIcon, EnvelopeIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function AddDepartmentModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', code: '', email: '', password: '' })
  const [credentials, setCredentials] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/admin/update-department', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        setCredentials(data.credentials)
        toast.success('Department created successfully!')
        onSuccess()
      } else {
        toast.error(data.message || 'Failed to create department')
      }
    } catch (error) {
      toast.error('Error creating department')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (credentials) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative">
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-10">
            <svg className="absolute top-4 right-4 w-24 h-24 text-purple-300 opacity-30" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative p-8">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-scaleIn">
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </div>
                <SparklesIcon className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">Department Created Successfully!</h3>
              <p className="text-sm text-gray-600">🔐 Save these credentials securely - they won't be shown again</p>
            </div>

            {/* Credentials Display */}
            <div className="space-y-4 mb-6">
              <div className="group relative bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border-2 border-teal-100 hover:border-teal-300 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <EnvelopeIcon className="w-4 h-4 text-teal-600" />
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Email Address</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono font-bold text-gray-900 break-all">{credentials.email}</p>
                  <button onClick={() => copyToClipboard(credentials.email)} className="ml-2 px-3 py-1 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700 transition-all shadow-md hover:shadow-lg flex-shrink-0">
                    Copy
                  </button>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-4 border-2 border-cyan-100 hover:border-cyan-300 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <KeyIcon className="w-4 h-4 text-cyan-600" />
                  <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">Password</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono font-bold text-gray-900 break-all">{credentials.password}</p>
                  <button onClick={() => copyToClipboard(credentials.password)} className="ml-2 px-3 py-1 bg-cyan-600 text-white text-xs rounded-lg hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg flex-shrink-0">
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-lg mb-6">
              <p className="text-xs text-amber-800">⚠️ Make sure to save these credentials before closing this window</p>
            </div>

            {/* Done Button */}
            <button onClick={onClose} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-xl hover:shadow-xl transition-all font-semibold text-lg hover:scale-[1.02] active:scale-[0.98]">
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative border border-gray-700">
        {/* Decorative Header Background */}
        <div className="relative bg-gradient-to-br from-teal-600 to-cyan-600 p-8 pb-20">
          {/* Decorative SVG Elements */}
          <svg className="absolute top-0 right-0 w-64 h-64 opacity-20" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgb(255,255,255)', stopOpacity: 0.8}} />
                <stop offset="100%" style={{stopColor: 'rgb(255,255,255)', stopOpacity: 0.2}} />
              </linearGradient>
            </defs>
            <circle cx="100" cy="50" r="60" fill="url(#grad1)" />
            <circle cx="150" cy="100" r="40" fill="url(#grad1)" />
            <circle cx="50" cy="120" r="30" fill="url(#grad1)" />
          </svg>

          <svg className="absolute bottom-0 left-0 w-48 h-48 opacity-10" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="white" />
            <polygon points="30,30 70,30 50,70" fill="white" />
          </svg>

          {/* Header Content */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <BuildingOfficeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-1">Add New Department</h3>
                <p className="text-blue-100 text-sm">Create a new department and generate credentials</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="relative -mt-12 px-8 pb-8">
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6 border border-gray-700">
            {/* Department Name Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <BuildingOfficeIcon className="w-4 h-4 text-teal-400" />
                Department Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-white bg-gray-700 group-hover:border-gray-500 placeholder-gray-400"
                  placeholder="e.g., Computer Science & Engineering"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Department Code Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Department Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white bg-gray-700 font-mono font-bold uppercase group-hover:border-gray-500 placeholder-gray-400"
                  placeholder="e.g., CSE"
                  maxLength="10"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">💡 Use a short, unique code (2-10 characters)</p>
            </div>

            {/* Coordinator Email Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-purple-400" />
                Coordinator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-white bg-gray-700 group-hover:border-gray-500 placeholder-gray-400"
                  placeholder="coordinator@example.com"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Coordinator Password Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <KeyIcon className="w-4 h-4 text-pink-400" />
                Coordinator Password
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-white bg-gray-700 group-hover:border-gray-500 placeholder-gray-400"
                  placeholder="Enter password"
                  minLength="6"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">🔒 Minimum 6 characters</p>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border-2 border-teal-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200 mb-1">What happens next?</p>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>✓ Department will be created in the system</li>
                    <li>✓ Coordinator credentials will be saved securely</li>
                    <li>✓ Coordinator can access the department dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-600 rounded-xl hover:bg-gray-700 transition-all font-semibold text-gray-200 hover:border-gray-500">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-xl hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Create Department
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
