'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function LunchSlots({ degree, onSave, initialData, extractedData, department }) {
  const [lunchData, setLunchData] = useState(initialData || {})
  const SLOTS = extractedData?.slots || []

  const toggleSlotForYear = (year, index) => {
    const currentData = lunchData[year]
    
    let newData
    if (currentData === index) {
      newData = null
    } else {
      newData = index
    }

    setLunchData(prev => ({
      ...prev,
      [year]: newData
    }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/save-lunch-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department, lunchData })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Lunch slots saved successfully!')
        onSave({ degree, lunchData })
      } else {
        toast.error('Failed to save lunch slots')
      }
    } catch (error) {
      toast.error('Error saving lunch slots')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-secondary p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{degree} - Lunch Timings Configuration</h3>
      <p className="text-sm text-gray-600 mb-6">Select lunch time slots for each year</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['FY', 'SY', 'TY', 'FoY'].map(year => (
          <div key={year} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="text-center mb-4 bg-blue-500 text-white py-2 rounded-lg font-bold">
              {year} Lunch Time
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SLOTS.map(slot => {
                const occupied = lunchData[year] === slot.index
                return (
                  <button
                    key={slot.index}
                    onClick={() => toggleSlotForYear(year, slot.index)}
                    className={`p-2 rounded text-sm border transition-all ${
                      occupied
                        ? 'border-blue-500 bg-blue-500 text-white font-bold'
                        : 'border-gray-300 hover:border-blue-400 text-gray-700'
                    }`}
                  >
                    {slot.time}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-6 bg-gradient-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all"
      >
        Save Lunch Timings
      </button>
    </div>
  )
}
