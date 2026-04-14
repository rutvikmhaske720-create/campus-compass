'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import StatCard from '../shared/StatCard'
import ConfigurationTimeline from './ConfigurationTimeline'
import ConfigurationStatus from './ConfigurationStatus'
import ExcelUpload from '../dashboard/ExcelUpload'
import TYMDMSlots from '../scheduler/TYMDMSlots'
import BTechMDMSlots from '../scheduler/BTechMDMSlots'
import LunchSlots from '../scheduler/LunchSlots'
import ReviewConfiguration from '../dashboard/ReviewConfiguration'
import FacultyAvailability from '../dashboard/FacultyAvailability'
import { BuildingOfficeIcon, UsersIcon, AcademicCapIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

export default function OverviewTab({ university, schedules }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [configuration, setConfiguration] = useState({
    tyMDM: null,
    btechMDM: null,
    lunchSlots: null,
    facultyAvailability: null
  })
  const [extractedData, setExtractedData] = useState(null)
  const [isConfigurationSaved, setIsConfigurationSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExistingConfiguration()
  }, [])

  const fetchExistingConfiguration = async () => {
    try {
      console.log('Fetching existing configuration...')
      const response = await fetch('/api/admin/get-university')
      if (response.ok) {
        const data = await response.json()
        console.log('University data received:', data)
        console.log('Configuration:', data.university?.configuration)
        
        if (data.university?.configuration) {
          const config = data.university.configuration
          console.log('Lunch slots:', config.lunchSlots)
          console.log('MDM slots:', config.mdmSlots)
          
          if (config.lunchSlots && config.mdmSlots) {
            console.log('Configuration found! Setting state...')
            setConfiguration({
              lunchSlots: config.lunchSlots,
              tyMDM: { mdmData: config.mdmSlots?.TY },
              btechMDM: { mdmData: config.mdmSlots?.BTech },
              facultyAvailability: config.facultyAvailability || {}
            })
            setExtractedData(config.extractedData)
            setIsConfigurationSaved(true)
            setCompletedSteps([1, 2, 3, 4, 5, 6])
            console.log('Configuration state updated')
          } else {
            console.log('Configuration incomplete or missing')
          }
        } else {
          console.log('No configuration found in university data')
        }
      } else {
        console.log('Response not OK:', response.status)
      }
    } catch (error) {
      console.error('Error fetching configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (data) => {
    console.log('Upload success handler called with data:', data)
    setExtractedData(data)
    setCompletedSteps([1])
    setCurrentStep(2)
    toast.success('File uploaded successfully! Proceeding to Lunch configuration.')
  }

  const handleLunchSlotsSave = (data) => {
    setConfiguration(prev => ({ ...prev, lunchSlots: data }))
    setCompletedSteps(prev => [...prev, 2])
    setCurrentStep(3)
  }

  const handleTYMDMSave = (data) => {
    setConfiguration(prev => ({ ...prev, tyMDM: data }))
    setCompletedSteps(prev => [...prev, 3])
    setCurrentStep(4)
  }

  const handleBTechMDMSave = (data) => {
    setConfiguration(prev => ({ ...prev, btechMDM: data }))
    setCompletedSteps(prev => [...prev, 4])
    setCurrentStep(5)
  }

  const handleFacultyAvailabilitySave = (data) => {
    setConfiguration(prev => ({ ...prev, facultyAvailability: data }))
    setCompletedSteps(prev => [...prev, 5])
    setCurrentStep(6)
  }

  const handleConfirm = async () => {
    try {
      const payload = {
        lunchSlots: configuration.lunchSlots,
        tyMDM: configuration.tyMDM,
        btechMDM: configuration.btechMDM,
        facultyAvailability: configuration.facultyAvailability,
        extractedData: extractedData,
        timestamp: new Date().toISOString()
      }
      
      console.log('Saving configuration to database:', payload)
      
      const response = await fetch('/api/admin/save-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }
      
      const result = await response.json()
      console.log('Configuration saved successfully:', result)
      
      setCompletedSteps(prev => [...prev, 6])
      setIsConfigurationSaved(true)
      toast.success('Configuration saved successfully to database!')
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast.error('Error saving configuration: ' + error.message)
    }
  }

  const handleModify = (step) => {
    setIsConfigurationSaved(false)
    setCurrentStep(step)
  }

  const handleEdit = (step) => {
    setCurrentStep(step)
  }

  const handleStepClick = (step) => {
    setCurrentStep(step)
  }

  return (
    <div className="space-y-4">
      {!loading && (
        <>
          {!isConfigurationSaved && (
            <ConfigurationTimeline currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} />
          )}

          {isConfigurationSaved ? (
            <ConfigurationStatus 
              configuration={configuration} 
              extractedData={extractedData}
              onModify={handleModify}
            />
          ) : (
            <>
              {currentStep === 1 && <ExcelUpload onUploadSuccess={handleUploadSuccess} />}
              {currentStep === 2 && <LunchSlots onSave={handleLunchSlotsSave} initialData={configuration.lunchSlots} extractedData={extractedData} />}
              {currentStep === 3 && <TYMDMSlots onSave={handleTYMDMSave} initialData={configuration.tyMDM} lockedSlots={configuration.lunchSlots} extractedData={extractedData} />}
              {currentStep === 4 && <BTechMDMSlots onSave={handleBTechMDMSave} initialData={configuration.btechMDM} lockedSlots={configuration.lunchSlots} extractedData={extractedData} />}
              {currentStep === 5 && <FacultyAvailability onSave={handleFacultyAvailabilitySave} initialData={configuration.facultyAvailability} extractedData={extractedData} />}
              {currentStep === 6 && <ReviewConfiguration configuration={configuration} onConfirm={handleConfirm} onEdit={handleEdit} extractedData={extractedData} />}
            </>
          )}
        </>
      )}
      {loading && (
        <div className="bg-white rounded-xl border border-secondary p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      )}
    </div>
  )
}
