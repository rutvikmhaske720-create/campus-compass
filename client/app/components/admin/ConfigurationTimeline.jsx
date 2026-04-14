'use client'

import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

const STEPS = [
  { id: 1, title: 'Upload Timetable', description: 'Upload Excel file with timetable data' },
  { id: 2, title: 'Lunch Slots', description: 'Configure lunch slots for all years' },
  { id: 3, title: 'TY MDM Slots', description: 'Configure MDM slots for Third Year' },
  { id: 4, title: 'B.Tech MDM Slots', description: 'Configure MDM slots for Fourth Year' },
  { id: 5, title: 'Review & Save', description: 'Review and finalize configuration' },
]

export default function ConfigurationTimeline({ currentStep, completedSteps, onStepClick }) {
  return (
    <div className="bg-white rounded-xl border border-secondary p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Configuration Progress</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-secondary">
          <div 
            className="h-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = currentStep === step.id
            
            return (
              <div key={step.id} className="flex flex-col items-center cursor-pointer" style={{ width: '20%' }} onClick={() => onStepClick(step.id)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 ${
                  isCompleted 
                    ? 'bg-primary border-primary text-white' 
                    : isCurrent
                    ? 'bg-white border-primary text-primary'
                    : 'bg-white border-secondary text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <span className="font-bold">{step.id}</span>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <div className={`text-sm font-semibold ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 hidden lg:block">
                    {step.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
