'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import DepartmentForm from '../components/admin/DepartmentForm'
import { useState } from 'react'
import SetupComplete from '../components/auth/SetupComplete'

export default function SetupUniversityPage() {
  const router = useRouter()
  const [universityCreated, setUniversityCreated] = useState(false)
  const [credentials, setCredentials] = useState([])

  const handleUniversityCreated = (creds) => {
    setUniversityCreated(true)
    setCredentials(creds)
  }

  const handleReset = () => {
    setUniversityCreated(false)
    setCredentials([])
    router.push('/')
  }

  if (universityCreated) {
    return <SetupComplete credentials={credentials} onReset={handleReset} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-emerald-900 to-cyan-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 px-4 py-2 text-teal-300 hover:text-teal-100 font-medium transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-teal-600 to-emerald-700 rounded-xl shadow-lg">
              <BuildingOfficeIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Setup Your University
          </h1>
          <p className="text-teal-100 max-w-2xl mx-auto">
            Configure your institution's departments and administrative structure. 
            We'll automatically generate secure coordinator accounts for each department.
          </p>
        </div>
        
        <DepartmentForm onUniversityCreated={handleUniversityCreated} />
      </div>
    </div>
  )
}
