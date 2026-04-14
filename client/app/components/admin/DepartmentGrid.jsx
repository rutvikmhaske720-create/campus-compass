'use client'

import { useState } from 'react'
import DepartmentCard from './DepartmentCard'
import DepartmentDetailModal from './DepartmentDetailModal'
import AddDepartmentModal from './AddDepartmentModal'

export default function DepartmentGrid({ departments, onUpdate, showAddModal, setShowAddModal }) {
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department)
    setShowDetailModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setSelectedDepartment(null)
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Departments Found</h3>
        <p className="text-gray-600">Create your first department to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department, index) => (
          <DepartmentCard
            key={department._id || index}
            department={department}
            onClick={handleDepartmentClick}
          />
        ))}
      </div>

      {showDetailModal && (
        <DepartmentDetailModal
          department={selectedDepartment}
          onClose={handleCloseModal}
          onUpdate={onUpdate}
        />
      )}

      {showAddModal && (
        <AddDepartmentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            onUpdate()
            setShowAddModal(false)
          }}
        />
      )}
    </>
  )
}