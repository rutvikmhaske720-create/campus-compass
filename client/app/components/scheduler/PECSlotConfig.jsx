'use client'

import { useState } from 'react'
import { DAYS } from '../../../lib/constants'

export default function PECSlotConfig({ timeSlots, lockedSlotsByDay, onNext, initialTheory, initialLab }) {
  const days = DAYS
  const validLabStarts = [0, 2, 5, 7]
  const [theorySlots, setTheorySlots] = useState(initialTheory || {})
  const [labSlots, setLabSlots] = useState(initialLab || {})

  const isLabConflictingWithLocked = (day, startIndex) => {
    const dayLocked = lockedSlotsByDay[day] || []
    return dayLocked.includes(startIndex) || dayLocked.includes(startIndex + 1)
  }

  const isTheoryLockedByLab = (day, slotIndex) => {
    const dayLabSlots = labSlots[day] || []
    for (const labStart of dayLabSlots) {
      if (slotIndex === labStart || slotIndex === labStart + 1) {
        return true
      }
    }
    return false
  }

  const handleTheoryToggle = (day, slotIndex) => {
    const dayLocked = lockedSlotsByDay[day] || []
    if (dayLocked.includes(slotIndex) || isTheoryLockedByLab(day, slotIndex)) return
    
    setTheorySlots(prev => {
      const daySlots = prev[day] || []
      if (daySlots.includes(slotIndex)) {
        return { ...prev, [day]: daySlots.filter(s => s !== slotIndex) }
      } else {
        return { ...prev, [day]: [...daySlots, slotIndex] }
      }
    })
  }

  const isValidLabStart = (index) => {
    // Lab can only start at indices 0, 2, 5, 7 (1-based: 1, 3, 6, 8)
    return [0, 2, 5, 7].includes(index)
  }

  const handleLabToggle = (day, startIndex) => {
    // Only allow valid lab start positions
    if (!isValidLabStart(startIndex)) return
    if (isLabConflictingWithLocked(day, startIndex)) return
    
    setLabSlots(prev => {
      const daySlots = prev[day] || []
      if (daySlots.includes(startIndex)) {
        return { ...prev, [day]: daySlots.filter(s => s !== startIndex) }
      } else {
        // Remove theory slots at startIndex and startIndex+1 when lab is selected
        setTheorySlots(prevTheory => {
          const dayTheorySlots = prevTheory[day] || []
          return {
            ...prevTheory,
            [day]: dayTheorySlots.filter(s => s !== startIndex && s !== startIndex + 1)
          }
        })
        return { ...prev, [day]: [...daySlots, startIndex] }
      }
    })
  }

  const handleNext = () => {
    onNext(theorySlots, labSlots)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Configure PEC Slots</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Lab Section - Left */}
        <div className="border-r border-gray-200 pr-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-3">Lab Slots (2 consecutive)</h4>
          <div className="space-y-3">
            {days.map(day => (
              <div key={day}>
                <p className="text-[10px] font-medium text-gray-700 mb-1">{day}</p>
                <div className="grid grid-cols-5 gap-1">
                  {timeSlots.map((slot, idx) => {
                    const dayLocked = lockedSlotsByDay[day] || []
                    const isLocked = dayLocked.includes(idx) || dayLocked.includes(idx + 1)
                    const isSelected = labSlots[day]?.includes(idx)
                    const isValidStart = [0, 2, 5, 7].includes(idx)
                    const isDisabled = isLocked || !isValidStart
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleLabToggle(day, idx)}
                        disabled={isDisabled}
                        className={`text-[9px] p-1 rounded border transition-all ${
                          isLocked
                            ? 'bg-red-100 border-red-300 text-red-600 cursor-not-allowed'
                            : !isValidStart
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theory Section - Right */}
        <div className="pl-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-3">Theory Slots</h4>
          <div className="space-y-3">
            {days.map(day => (
              <div key={day}>
                <p className="text-[10px] font-medium text-gray-700 mb-1">{day}</p>
                <div className="grid grid-cols-5 gap-1">
                  {timeSlots.map((slot, idx) => {
                    const dayLocked = lockedSlotsByDay[day] || []
                    const isLocked = dayLocked.includes(idx) || isTheoryLockedByLab(day, idx)
                    const isSelected = theorySlots[day]?.includes(idx)
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleTheoryToggle(day, idx)}
                        disabled={isLocked}
                        className={`text-[9px] p-1 rounded border transition-all ${
                          isLocked
                            ? 'bg-red-100 border-red-300 text-red-600 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="mt-4 w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
      >
        Next
      </button>
    </div>
  )
}
