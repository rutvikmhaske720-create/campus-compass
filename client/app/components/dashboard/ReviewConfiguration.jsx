'use client'

import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

const getSlots = (extractedData) => {
  if (!extractedData?.slots || extractedData.slots.length === 0) {
    return []
  }
  return extractedData.slots
}

export default function ReviewConfiguration({ configuration, onConfirm, onEdit, extractedData }) {
  const SLOTS = getSlots(extractedData)
  const getSlotTime = (index) => SLOTS.find(s => s.index === index)?.time || ''
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  return (
    <div className="bg-white rounded-xl border border-secondary p-6">
      <div className="flex items-center space-x-3 mb-6">
        <CheckCircleIcon className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-bold text-gray-800">Review Configuration</h3>
          <p className="text-sm text-gray-600">Review all settings before saving</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* TY MDM */}
        <div className="border border-secondary rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-primary">TY - MDM Slots</h4>
            <button onClick={() => onEdit(2)} className="text-sm text-primary hover:underline">
              Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {configuration.tyMDM?.slots?.map(slot => (
              <span key={slot} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                Slot {slot}: {getSlotTime(slot)}
              </span>
            ))}
          </div>
        </div>

        {/* BTech MDM */}
        <div className="border border-secondary rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-primary">B.Tech - MDM Slots</h4>
            <button onClick={() => onEdit(3)} className="text-sm text-primary hover:underline">
              Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {configuration.btechMDM?.slots?.map(slot => (
              <span key={slot} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                Slot {slot}: {getSlotTime(slot)}
              </span>
            ))}
          </div>
        </div>

        {/* Lunch Slots */}
        <div className="border border-secondary rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-primary">Lunch Slots - All Years</h4>
            <button onClick={() => onEdit(2)} className="text-sm text-primary hover:underline">
              Edit
            </button>
          </div>
          <div className="space-y-3">
            {['FY', 'SY', 'TY', 'BTech'].map(year => (
              <div key={year}>
                <div className="text-sm font-semibold text-gray-700 mb-1">{year}:</div>
                <div className="flex flex-wrap gap-2">
                  {configuration.lunchSlots?.[year]?.map(slot => (
                    <span key={slot} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                      Slot {slot}: {getSlotTime(slot)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Availability */}
        {configuration.facultyAvailability && Object.keys(configuration.facultyAvailability).length > 0 && (
          <div className="border border-secondary rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-primary">Faculty Availability</h4>
              <button onClick={() => onEdit(5)} className="text-sm text-primary hover:underline">
                Edit
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(configuration.facultyAvailability).map(([name, days]) => {
                const unavailableDays = days.map((val, idx) => val === 1 ? DAYS[idx] : null).filter(Boolean)
                return (
                  <div key={name} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm">{name}</span>
                    <div className="flex gap-1">
                      {unavailableDays.length > 0 ? (
                        unavailableDays.map(day => (
                          <span key={day} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                            {day}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">All days available</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onConfirm}
        className="w-full mt-6 bg-gradient-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all"
      >
        Confirm & Save Configuration
      </button>
    </div>
  )
}
