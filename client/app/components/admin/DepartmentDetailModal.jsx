'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function DepartmentDetailModal({ department, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [editData, setEditData] = useState({
    coordinator: {
      name: department?.coordinator?.name || '',
      email: department?.coordinator?.email || '',
      phone: department?.coordinator?.phone || ''
    },
    department: {
      code: department?.code || '',
      established: department?.established || '',
      building: department?.building || '',
      students: department?.stats?.students || 0,
      faculty: department?.stats?.faculty || 0
    }
  })

  useEffect(() => {
    if (department && activeTab === 'documents') {
      fetchDocuments()
    }
  }, [department, activeTab])

  useEffect(() => {
    const handleStorageChange = () => {
      if (activeTab === 'documents') {
        fetchDocuments()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [activeTab])

  const fetchDocuments = async () => {
    setLoadingDocs(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/${department.name}`)
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setLoadingDocs(false)
    }
  }

  const handleDocumentStatusUpdate = async (documentId, status, adminResponse = '') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-document-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, status, adminResponse })
      })
      
      const data = await response.json()
      if (data.success) {
        fetchDocuments()
        alert('Document status updated successfully!')
      } else {
        alert('Error updating document status')
      }
    } catch (error) {
      alert('Error updating document status')
    }
  }

  if (!department) return null

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/update-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId: 'temp-id', // This will be handled by the backend
          departmentName: department.name,
          updates: editData
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setIsEditing(false)
        onUpdate?.()
        alert('Department updated successfully!')
      } else {
        alert('Error updating department')
      }
    } catch (error) {
      alert('Error updating department')
    }
  }



  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />
      case 'pending': return <ClockIcon className="h-4 w-4" />
      case 'rejected': return <ExclamationTriangleIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-xl mr-4">
                <BuildingOfficeIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{department.name}</h2>
                <p className="text-white/80">
                  {department.code && <span>{department.code}</span>}
                  {department.code && department.coordinator?.name && <span> • </span>}
                  {department.coordinator?.name && <span>{department.coordinator.name}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Save
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'documents', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Coordinator Credentials */}
              <div className="bg-gray-50 p-6 rounded-xl max-w-md mx-auto">
                  {(department.coordinator?.email || department.coordinator?.plainPassword) && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Coordinator Credentials</h3>
                      <div className="space-y-3">
                        {department.coordinator?.email && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Email:</span>
                            <p className="text-gray-800 font-mono">{department.coordinator.email}</p>
                          </div>
                        )}
                        {department.coordinator?.plainPassword && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Password:</span>
                            <p className="text-gray-800 font-mono">{department.coordinator.plainPassword}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Document History</h3>
                <span className="text-sm text-gray-500">{documents.length} documents</span>
              </div>

              {loadingDocs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No documents submitted yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc._id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                            <h4 className="font-medium text-gray-800">{doc.title}</h4>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(doc.status)}`}>
                              {getStatusIcon(doc.status)}
                              <span>{doc.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Type: {doc.type}</span>
                            <span>Size: {doc.fileSize}</span>
                            <span>Date: {new Date(doc.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 italic">"{doc.comments}"</p>
                          {doc.adminResponse && (
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800"><strong>Admin Response:</strong> {doc.adminResponse}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => window.open(doc.cloudinaryUrl, '_blank')}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const a = document.createElement('a')
                              a.href = doc.cloudinaryUrl
                              a.download = doc.filename
                              a.target = '_blank'
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                            }}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                          {doc.status === 'pending' && (
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => {
                                  const response = prompt('Enter admin response (optional):')
                                  handleDocumentStatusUpdate(doc._id, 'approved', response || '')
                                }}
                                className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => {
                                  const response = prompt('Enter rejection reason:')
                                  if (response) handleDocumentStatusUpdate(doc._id, 'rejected', response)
                                }}
                                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Analytics coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}