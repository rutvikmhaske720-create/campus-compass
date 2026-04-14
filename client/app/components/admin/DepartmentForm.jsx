'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  KeyIcon, 
  HashtagIcon,
  AcademicCapIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function DepartmentForm({ onUniversityCreated }) {
  const [numDepartments, setNumDepartments] = useState('')
  const [departments, setDepartments] = useState([])
  const [universityName, setUniversityName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNumDepartmentsChange = (e) => {
    const num = parseInt(e.target.value)
    if (num > 0) {
      setNumDepartments(num)
      setDepartments(Array(num).fill(''))
    }
  }

  const handleDepartmentChange = (index, value) => {
    const newDepartments = [...departments]
    newDepartments[index] = value
    setDepartments(newDepartments)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const filteredDepartments = departments.filter(dept => dept.trim() !== '')
    
    if (filteredDepartments.length === 0) {
      toast.error('Please add at least one department')
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/admin/create-university', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          universityName: universityName.trim(),
          adminEmail: adminEmail.trim(),
          adminPassword: adminPassword,
          departments: filteredDepartments
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('University created successfully!')
        onUniversityCreated(data.credentials)
        // Reset form
        setUniversityName('')
        setAdminEmail('')
        setAdminPassword('')
        setNumDepartments('')
        setDepartments([])
      } else {
        toast.error('Error: ' + data.error)
      }
    } catch (error) {
      toast.error('Failed to create university: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-teal-700/30">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl shadow-lg">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Configure Your Institution</h2>
        <p className="text-teal-100">
          Set up your university with AI-powered management capabilities
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label htmlFor="universityName" className="flex items-center text-sm font-semibold text-teal-100 mb-3">
              <BuildingOfficeIcon className="h-5 w-5 text-teal-400 mr-2" />
              University Name
            </label>
            <input
              type="text"
              id="universityName"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              placeholder="Enter your university name"
              className="w-full border border-teal-600 rounded-2xl px-4 py-4 bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              required
            />
          </div>
          
          <div>
            <label htmlFor="adminEmail" className="flex items-center text-sm font-semibold text-teal-100 mb-3">
              <EnvelopeIcon className="h-5 w-5 text-teal-400 mr-2" />
              Administrator Email
            </label>
            <input
              type="email"
              id="adminEmail"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@university.edu"
              className="w-full border border-teal-600 rounded-2xl px-4 py-4 bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              required
            />
          </div>
          
          <div>
            <label htmlFor="adminPassword" className="flex items-center text-sm font-semibold text-teal-100 mb-3">
              <KeyIcon className="h-5 w-5 text-teal-400 mr-2" />
              Administrator Password
            </label>
            <input
              type="password"
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full border border-teal-600 rounded-2xl px-4 py-4 bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              required
            />
          </div>
        </div>
        
        <div className="bg-slate-700/50 rounded-2xl p-6 border border-teal-600/30">
          <label htmlFor="numDepartments" className="flex items-center text-sm font-semibold text-teal-100 mb-4">
            <HashtagIcon className="h-5 w-5 text-teal-400 mr-2" />
            Number of Departments
          </label>
          <input
            type="number"
            id="numDepartments"
            min="1"
            max="50"
            value={numDepartments}
            onChange={handleNumDepartmentsChange}
            placeholder="How many departments?"
            className="w-full border border-teal-600 rounded-2xl px-4 py-4 bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            required
          />
          {numDepartments && (
            <p className="text-sm text-teal-200 mt-2">
              We'll create {numDepartments} department coordinator accounts automatically
            </p>
          )}
        </div>
        
        {departments.length > 0 && (
          <div className="bg-slate-700/50 rounded-2xl p-6 border border-teal-600/30">
            <h3 className="flex items-center text-lg font-semibold text-white mb-6">
              <AcademicCapIcon className="h-6 w-6 text-teal-400 mr-2" />
              Department Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((_, index) => (
                <div key={index}>
                  <label htmlFor={`department-${index}`} className="block text-sm font-medium text-teal-100 mb-2">
                    Department {index + 1}
                  </label>
                  <input
                    type="text"
                    id={`department-${index}`}
                    value={departments[index]}
                    onChange={(e) => handleDepartmentChange(index, e.target.value)}
                    placeholder={`e.g., Computer Science, Mathematics`}
                    className="w-full border border-teal-600 rounded-xl px-4 py-3 bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-6">
          <button
            type="submit"

            disabled={loading || !universityName.trim() || !adminEmail.trim() || !adminPassword.trim() || departments.length === 0}
            className="group w-full flex items-center justify-center py-4 px-8 text-lg font-semibold text-white bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Setting up your university...
              </>
            ) : (
              <>
                <SparklesIcon className="h-6 w-6 mr-3" />
                Create University with AI
                <ArrowRightIcon className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-center text-sm text-teal-200 mt-4">
            This will create your university and generate secure coordinator accounts
          </p>
        </div>
      </form>
    </div>
  )
}