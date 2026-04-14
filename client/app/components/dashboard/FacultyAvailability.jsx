'use client'

import { useState } from 'react'
import { UserGroupIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/outline'
import { DAYS } from '../../../lib/constants'

export default function FacultyAvailability({ extractedData, onSave, initialData = {}, timeSlots = [] }) {
  const [facultyAvailability, setFacultyAvailability] = useState(initialData)
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedDay, setSelectedDay] = useState(0)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [pendingDayConfig, setPendingDayConfig] = useState(null)

  const faculty = extractedData?.analytics?.faculty || []
  const slots = timeSlots

  const handleSlotToggle = (facultyName, dayIndex, slotIndex) => {
    setFacultyAvailability(prev => {
      const current = prev[facultyName] || Array(DAYS.length).fill(null).map(() => Array(slots.length).fill(0))
      const updated = current.map((day, dIdx) => 
        dIdx === dayIndex ? day.map((slot, sIdx) => sIdx === slotIndex ? (slot === 1 ? 0 : 1) : slot) : day
      )
      return { ...prev, [facultyName]: updated }
    })
  }

  const handleDayComplete = (facultyName, dayIndex) => {
    const currentConfig = facultyAvailability[facultyName]?.[dayIndex] || Array(slots.length).fill(0)
    setPendingDayConfig({ facultyName, dayIndex, config: currentConfig })
    setShowApplyModal(true)
  }

  const applyToAllDays = () => {
    if (!pendingDayConfig) return
    const { facultyName, config } = pendingDayConfig
    setFacultyAvailability(prev => {
      const current = prev[facultyName] || Array(DAYS.length).fill(null).map(() => Array(slots.length).fill(0))
      const updated = current.map(() => [...config])
      return { ...prev, [facultyName]: updated }
    })
    setShowApplyModal(false)
    setPendingDayConfig(null)
  }

  const applyOnlyToThisDay = () => {
    setShowApplyModal(false)
    setPendingDayConfig(null)
  }

  return (
    <div className="bg-white rounded-xl border border-secondary p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-secondary">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <UserGroupIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Faculty Availability</h3>
          <p className="text-sm text-gray-600">Configure time slot availability for each faculty member</p>
        </div>
      </div>

      {/* Faculty Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Faculty Member</label>
        <select
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          className="w-full px-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
        >
          <option value="">-- Select Faculty --</option>
          {faculty.map(f => (
            <option key={f.name} value={f.name}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Time Slot Configuration */}
      {selectedFaculty && (
        <div className="space-y-4 mb-6">
          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {DAYS.map((day, index) => {
              const dayConfig = facultyAvailability[selectedFaculty]?.[index] || Array(slots.length).fill(0)
              const unavailableCount = dayConfig.filter(s => s === 1).length
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                    selectedDay === index
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-700 border border-secondary hover:border-primary'
                  }`}
                >
                  {day.slice(0, 3)}
                  {unavailableCount > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      selectedDay === index ? 'bg-white/20' : 'bg-red-100 text-red-700'
                    }`}>
                      {unavailableCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Time Slots Grid */}
          <div className="bg-gray-50 rounded-lg border border-secondary p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-gray-800">{DAYS[selectedDay]}</h4>
              </div>
              <button
                onClick={() => handleDayComplete(selectedFaculty, selectedDay)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <CheckIcon className="h-4 w-4" />
                Apply to All Days
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-3">Click on time slots to mark as UNAVAILABLE</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {slots.map((slot, slotIndex) => {
                const isUnavailable = facultyAvailability[selectedFaculty]?.[selectedDay]?.[slotIndex] === 1
                return (
                  <button
                    key={slotIndex}
                    onClick={() => handleSlotToggle(selectedFaculty, selectedDay, slotIndex)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isUnavailable
                        ? 'bg-red-500 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                    }`}
                  >
                    <div>{slot}</div>
                    <div className="text-xs mt-1">{isUnavailable ? 'Not Avail' : 'Available'}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Configured Faculty Summary */}
      {Object.keys(facultyAvailability).length > 0 && (
        <div className="border border-secondary rounded-lg p-4 mb-4">
          <h4 className="font-bold text-primary mb-3">Configured Faculty ({Object.keys(facultyAvailability).length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Object.entries(facultyAvailability).map(([name, days]) => {
              const totalUnavailable = days.flat().filter(s => s === 1).length
              return (
                <div key={name} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-800 text-sm">{name}</span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                    {totalUnavailable} slots unavailable
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={() => onSave(facultyAvailability)}
        className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all"
      >
        Save Faculty Availability
      </button>

      {/* Apply to All Days Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Apply to All Days?</h3>
              <p className="text-sm text-gray-600">Do you want to apply this {DAYS[pendingDayConfig?.dayIndex]} configuration to all weekdays?</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-secondary">
              <p className="text-xs text-gray-700 font-medium mb-2">Current Configuration:</p>
              <div className="flex flex-wrap gap-1">
                {pendingDayConfig?.config.map((slot, idx) => (
                  <span key={idx} className={`px-2 py-1 rounded text-xs font-bold ${
                    slot === 1 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {slots[idx]}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={applyOnlyToThisDay}
                className="flex-1 px-4 py-3 border border-secondary rounded-lg hover:bg-gray-50 transition-all font-semibold text-gray-700"
              >
                Only This Day
              </button>
              <button
                onClick={applyToAllDays}
                className="flex-1 bg-primary text-white px-4 py-3 rounded-lg hover:opacity-90 transition-all font-semibold"
              >
                Apply to All Days
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
