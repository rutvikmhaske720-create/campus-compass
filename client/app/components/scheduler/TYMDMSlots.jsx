'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { ClockIcon, BeakerIcon } from '@heroicons/react/24/outline'
import { DAYS } from '../../../lib/constants'

const getSlots = (extractedData) => {
  if (!extractedData?.slots || extractedData.slots.length === 0) {
    throw new Error('No time slots data available. Please upload Excel file first.')
  }
  return extractedData.slots
}

const LAB_START_SLOTS = [1, 3, 6, 8]

export default function TYMDMSlots({ onSave, initialData, lockedSlots, extractedData }) {
  const [mdmData, setMdmData] = useState(initialData || {})
  const SLOTS = getSlots(extractedData)

  const getLockedSlots = () => {
    const locked = []
    if (lockedSlots?.TY) {
      locked.push(...lockedSlots.TY)
    }
    return locked
  }

  const isSlotLocked = (index) => getLockedSlots().includes(index)

  const isSlotOccupied = (day, index, type) => {
    if (type === 'lab') {
      const labSlots = mdmData[day]?.lab || []
      return labSlots.some(labStart => index === labStart || index === labStart + 1)
    }
    return mdmData[day]?.theory?.includes(index)
  }

  const isLabConflictingWithTheory = (day, labStartIndex) => {
    const theorySlots = mdmData[day]?.theory || []
    return theorySlots.includes(labStartIndex) || theorySlots.includes(labStartIndex + 1)
  }

  const isTheoryConflictingWithLab = (day, theoryIndex) => {
    const labSlots = mdmData[day]?.lab || []
    return labSlots.some(labStart => theoryIndex === labStart || theoryIndex === labStart + 1)
  }

  const toggleSlotForDay = (day, index, type) => {
    if (isSlotLocked(index)) return

    const currentDayData = mdmData[day] || { lab: [], theory: [] }
    let newData = { ...currentDayData }

    if (type === 'lab') {
      const labSlots = newData.lab || []
      if (labSlots.includes(index)) {
        newData.lab = labSlots.filter(s => s !== index)
      } else {
        if (isSlotLocked(index + 1) || isLabConflictingWithTheory(day, index)) {
          toast.error('Slot is not available (already used or locked)')
          return
        }
        newData.lab = [...labSlots, index].sort((a, b) => a - b)
      }
    } else {
      const theorySlots = newData.theory || []
      if (theorySlots.includes(index)) {
        newData.theory = theorySlots.filter(s => s !== index)
      } else {
        if (isTheoryConflictingWithLab(day, index)) {
          toast.error('Slot is already used by lab')
          return
        }
        newData.theory = [...theorySlots, index].sort((a, b) => a - b)
      }
    }

    setMdmData(prev => ({ ...prev, [day]: newData }))
  }

  const handleSave = () => {
    onSave({ year: 'TY', mdmData })
  }

  return (
    <div className="bg-white rounded-xl border border-secondary p-4">
      <div className="flex items-center space-x-2 mb-4">
        <ClockIcon className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-base font-bold text-gray-800">Third Year (TY) - MDM Slots</h3>
          <p className="text-xs text-gray-600">Select MDM slots for each day</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Lab Section */}
        <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
          <div className="flex items-center justify-center mb-3 bg-purple-500 text-white py-2 rounded-lg">
            <BeakerIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-bold">Lab (2 slots)</span>
          </div>
          {DAYS.map(day => (
            <div key={day} className="mb-3">
              <div className="text-xs font-semibold text-gray-700 mb-1">{day}</div>
              <div className="grid grid-cols-3 gap-1">
                {SLOTS.map(slot => {
                  const locked = isSlotLocked(slot.index)
                  const occupied = isSlotOccupied(day, slot.index, 'lab')
                  const isLabStart = LAB_START_SLOTS.includes(slot.index)
                  const occupiedByTheory = isLabStart && isLabConflictingWithTheory(day, slot.index)
                  return (
                    <button
                      key={slot.index}
                      onClick={() => isLabStart && toggleSlotForDay(day, slot.index, 'lab')}
                      disabled={locked || !isLabStart || occupiedByTheory}
                      className={`p-1 rounded text-[10px] border transition-all ${
                        locked
                          ? 'border-red-300 bg-red-50 text-red-400 cursor-not-allowed'
                          : occupiedByTheory
                          ? 'border-blue-300 bg-blue-100 text-blue-500 cursor-not-allowed'
                          : occupied
                          ? 'border-purple-500 bg-purple-500 text-white font-bold'
                          : isLabStart
                          ? 'border-gray-300 hover:border-purple-400 text-gray-700'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {slot.time.split('-')[0]}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Theory Section */}
        <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
          <div className="flex items-center justify-center mb-3 bg-blue-500 text-white py-2 rounded-lg">
            <span className="text-sm font-bold">Theory (1 slot)</span>
          </div>
          {DAYS.map(day => (
            <div key={day} className="mb-3">
              <div className="text-xs font-semibold text-gray-700 mb-1">{day}</div>
              <div className="grid grid-cols-3 gap-1">
                {SLOTS.map(slot => {
                  const locked = isSlotLocked(slot.index)
                  const occupied = isSlotOccupied(day, slot.index, 'theory')
                  const occupiedByLab = isTheoryConflictingWithLab(day, slot.index)
                  return (
                    <button
                      key={slot.index}
                      onClick={() => toggleSlotForDay(day, slot.index, 'theory')}
                      disabled={locked || occupiedByLab}
                      className={`p-1 rounded text-[10px] border transition-all ${
                        locked
                          ? 'border-red-300 bg-red-50 text-red-400 cursor-not-allowed'
                          : occupiedByLab
                          ? 'border-purple-300 bg-purple-100 text-purple-500 cursor-not-allowed'
                          : occupied
                          ? 'border-blue-500 bg-blue-500 text-white font-bold'
                          : 'border-gray-300 hover:border-blue-400 text-gray-700'
                      }`}
                    >
                      {slot.time.split('-')[0]}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-4 bg-gradient-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
      >
        Save TY MDM Slots
      </button>
    </div>
  )
}
