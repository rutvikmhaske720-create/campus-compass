'use client'

import { DAYS } from '../../../lib/constants'

const LunchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M4 3h2v7.5c0 .83.67 1.5 1.5 1.5S9 11.33 9 10.5V3h2v7.5C11 12.99 9.49 14.5 7.5 14.5S4 12.99 4 10.5V3zm9 0h6v2h-2v3.5c0 2.49-2.01 4.5-4.5 4.5S8 10.99 8 8.5V6h2v2.5C10 9.33 10.67 10 11.5 10S13 9.33 13 8.5V3zm-9 11h4v7H4v-7zm9 0h6v7h-6v-7z" fill="currentColor" />
  </svg>
)

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M6 3h9.5A2.5 2.5 0 0 1 18 5.5V20a1 1 0 0 1-1.2.98L12 19.5l-4.8 1.48A1 1 0 0 1 6 20V5a2 2 0 0 1 2-2zM8 5v12.53l3.8-1.17a1 1 0 0 1 .6 0L16 17.53V5H8z" fill="currentColor" />
  </svg>
)

const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M12 3 2 9l10 6 10-6-10-6zm-6.5 8.09V16c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2v-4.91l-7 4.2-7-4.2z" fill="currentColor" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <path d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25zM19.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L14 5.25l3.75 3.75 1.96-1.96z" fill="currentColor" />
  </svg>
)

export default function ConfigurationStatus({ configuration, extractedData, onModify }) {
  const getSlotTime = (index) => {
    const slot = extractedData?.slots?.find((s) => s.index === index)
    return slot?.time || `Slot ${index}`
  }

  const getDayData = (mdmData) => {
    if (!mdmData) return []
    const days = DAYS
    return days
      .filter((day) => mdmData[day])
      .map((day) => ({
        day,
        lab: mdmData[day]?.lab || [],
        theory: mdmData[day]?.theory || [],
      }))
  }

  const getStats = () => {
    const lunchCount = Object.values(configuration.lunchSlots || {}).reduce(
      (sum, slots) => sum + slots.length,
      0
    )

    const tyData = getDayData(configuration.tyMDM?.mdmData)
    const btechData = getDayData(configuration.btechMDM?.mdmData)

    const tySlots = tyData.reduce(
      (sum, day) => sum + day.lab.length + day.theory.length,
      0
    )
    const btechSlots = btechData.reduce(
      (sum, day) => sum + day.lab.length + day.theory.length,
      0
    )

    return {
      totalLunchSlots: lunchCount,
      tyMDMDays: tyData.length,
      tyMDMSlots: tySlots,
      btechMDMDays: btechData.length,
      btechMDMSlots: btechSlots,
      totalConfigured: lunchCount + tySlots + btechSlots,
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-4">
      {/* Row 1: Lunch Break + SVG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lunch Slots */}
        <div className="bg-white rounded-xl border border-teal-200/60 shadow-sm hover:shadow-md transition-all">
          <div className="bg-teal-50/50 px-5 py-3 flex items-center justify-between border-b border-teal-100">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <div className="w-5 h-5 text-teal-600">
                  <LunchIcon />
                </div>
              </div>
              <div className="leading-tight">
                <h4 className="text-lg font-semibold text-gray-800">
                  Lunch Break Schedule
                </h4>
                <p className="text-sm text-gray-600">
                  {stats.totalLunchSlots} slots configured
                </p>
              </div>
            </div>
            <button
              onClick={() => onModify(2)}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <EditIcon />
              <span>Modify</span>
            </button>
          </div>

          <div className="p-4">
            {stats.totalLunchSlots === 0 ? (
              <p className="text-gray-500 text-sm">No lunch slots configured yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {['FY', 'SY', 'TY', 'BTech'].map((year) => {
                  const slots = configuration.lunchSlots?.[year] || []
                  if (slots.length === 0) return null

                  return (
                    <div
                      key={year}
                      className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                    >
                      <div className="w-9 h-9 rounded-md bg-teal-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                        {year}
                      </div>
                      <div className="grid grid-cols-2 gap-1 w-full">
                        {slots.map((slot) => (
                          <span
                            key={slot}
                            className="px-2 py-1.5 bg-teal-600 text-white rounded-md text-xs font-medium text-center"
                          >
                            {getSlotTime(slot)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* SVG Design (responsive + extra small elements) */}
        <div className="bg-white rounded-xl border border-teal-200/60 shadow-sm flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
            <svg
              className="w-full h-auto"
              viewBox="0 0 400 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Main board */}
              <rect
                x="40"
                y="30"
                width="320"
                height="220"
                rx="14"
                fill="#0d9488"
                opacity="0.06"
              />
              <rect
                x="40"
                y="30"
                width="320"
                height="220"
                rx="14"
                stroke="#0d9488"
                strokeWidth="3"
                opacity="0.3"
              />

              {/* Header bar */}
              <rect
                x="40"
                y="30"
                width="320"
                height="52"
                rx="14"
                fill="#0d9488"
                opacity="0.18"
              />
              <circle cx="72" cy="56" r="6" fill="#0d9488" opacity="0.7" />
              <circle cx="96" cy="56" r="6" fill="#0d9488" opacity="0.7" />
              <circle cx="120" cy="56" r="6" fill="#0d9488" opacity="0.7" />

              {/* Timetable rows */}
              {[0, 1, 2, 3, 4].map((row) => (
                <line
                  key={row}
                  x1="62"
                  x2="338"
                  y1={105 + row * 30}
                  y2={105 + row * 30}
                  stroke="#0d9488"
                  strokeWidth="2"
                  opacity="0.18"
                />
              ))}

              {/* Slot blocks */}
              <rect
                x="62"
                y="112"
                width="76"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.45"
              />
              <rect
                x="150"
                y="112"
                width="60"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.55"
              />
              <rect
                x="222"
                y="112"
                width="90"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.35"
              />

              <rect
                x="62"
                y="142"
                width="96"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.55"
              />
              <rect
                x="170"
                y="142"
                width="70"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.45"
              />
              <rect
                x="252"
                y="142"
                width="64"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.35"
              />

              <rect
                x="62"
                y="172"
                width="70"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.45"
              />
              <rect
                x="146"
                y="172"
                width="86"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.55"
              />
              <rect
                x="242"
                y="172"
                width="72"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.35"
              />

              <rect
                x="62"
                y="202"
                width="84"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.35"
              />
              <rect
                x="158"
                y="202"
                width="78"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.45"
              />
              <rect
                x="248"
                y="202"
                width="70"
                height="18"
                rx="4"
                fill="#0d9488"
                opacity="0.55"
              />

              {/* Decorative small SVGs (clock, plate, utensils) */}
              {/* Clock */}
              <g opacity="0.8">
                <circle cx="332" cy="72" r="16" fill="#0d9488" opacity="0.16" />
                <circle cx="332" cy="72" r="11" stroke="#0d9488" strokeWidth="2" />
                <line
                  x1="332"
                  y1="72"
                  x2="332"
                  y2="66"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="332"
                  y1="72"
                  x2="338"
                  y2="72"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>

              {/* Plate + spoon/fork */}
              <g opacity="0.85">
                <circle cx="72" cy="210" r="14" fill="#0d9488" opacity="0.16" />
                <circle cx="72" cy="210" r="9" stroke="#0d9488" strokeWidth="2" />
                {/* Spoon */}
                <path
                  d="M90 203c1.8 0 3.2 1.4 3.2 3.2 0 1.2-.7 2.3-1.8 2.8v4.5a1.4 1.4 0 0 1-2.8 0v-4.5a3.2 3.2 0 0 1-1.8-2.8c0-1.8 1.4-3.2 3.2-3.2z"
                  fill="#0d9488"
                  opacity="0.7"
                />
                {/* Fork */}
                <path
                  d="M98 203v4.5M101 203v4.5M104 203v4.5M100.5 209v6"
                  stroke="#0d9488"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>

              {/* Floating decorative circles */}
              <circle cx="34" cy="176" r="13" fill="#0d9488" opacity="0.18" />
              <circle cx="366" cy="220" r="17" fill="#0d9488" opacity="0.16" />
              <circle cx="54" cy="60" r="9" fill="#0d9488" opacity="0.1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Row 2: TY-MDM + BTech-MDM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* TY MDM */}
        <div className="bg-white rounded-xl border border-teal-200/60 shadow-sm hover:shadow-md transition-all">
          <div className="bg-teal-50/50 px-5 py-3 flex items-center justify-between border-b border-teal-100">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <div className="w-5 h-5 text-teal-600">
                  <BookIcon />
                </div>
              </div>
              <div className="leading-tight">
                <h4 className="text-lg font-semibold text-gray-800">
                  TY Multidisciplinary Minor
                </h4>
                <p className="text-sm text-gray-600">
                  {stats.tyMDMDays} days configured
                </p>
              </div>
            </div>
            <button
              onClick={() => onModify(3)}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <EditIcon />
              <span>Modify</span>
            </button>
          </div>

          <div className="p-4">
            {stats.tyMDMDays === 0 ? (
              <p className="text-gray-500 text-sm">No TY MDM slots configured yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getDayData(configuration.tyMDM?.mdmData).map(
                  ({ day, lab, theory }) => (
                    <div
                      key={day}
                      className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-md bg-teal-600 flex items-center justify-center text-white font-semibold text-[10px] shrink-0">
                          {day.slice(0, 3)}
                        </div>
                        <span className="font-semibold text-sm text-gray-700">
                          {day}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {lab.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-medium text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                              Lab
                            </span>
                            <div className="grid grid-cols-2 gap-1 w-full">
                              {lab.map((slot) => (
                                <span
                                  key={slot}
                                  className="px-2 py-1 bg-cyan-600 text-white rounded-md text-xs font-medium text-center"
                                >
                                  {getSlotTime(slot)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {theory.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                              Theory
                            </span>
                            <div className="grid grid-cols-2 gap-1 w-full">
                              {theory.map((slot) => (
                                <span
                                  key={slot}
                                  className="px-2 py-1 bg-teal-600 text-white rounded-md text-xs font-medium text-center"
                                >
                                  {getSlotTime(slot)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* BTech MDM */}
        <div className="bg-white rounded-xl border border-teal-200/60 shadow-sm hover:shadow-md transition-all">
          <div className="bg-teal-50/50 px-5 py-3 flex items-center justify-between border-b border-teal-100">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <div className="w-5 h-5 text-teal-600">
                  <GraduationIcon />
                </div>
              </div>
              <div className="leading-tight">
                <h4 className="text-lg font-semibold text-gray-800">
                  BTech Multidisciplinary Minor
                </h4>
                <p className="text-sm text-gray-600">
                  {stats.btechMDMDays} days configured
                </p>
              </div>
            </div>
            <button
              onClick={() => onModify(4)}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <EditIcon />
              <span>Modify</span>
            </button>
          </div>

          <div className="p-4">
            {stats.btechMDMDays === 0 ? (
              <p className="text-gray-500 text-sm">No BTech MDM slots configured yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getDayData(configuration.btechMDM?.mdmData).map(
                  ({ day, lab, theory }) => (
                    <div
                      key={day}
                      className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-md bg-teal-600 flex items-center justify-center text-white font-semibold text-[10px] shrink-0">
                          {day.slice(0, 3)}
                        </div>
                        <span className="font-semibold text-sm text-gray-700">
                          {day}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {lab.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-medium text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                              Lab
                            </span>
                            <div className="grid grid-cols-2 gap-1 w-full">
                              {lab.map((slot) => (
                                <span
                                  key={slot}
                                  className="px-2 py-1 bg-cyan-600 text-white rounded-md text-xs font-medium text-center"
                                >
                                  {getSlotTime(slot)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {theory.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                              Theory
                            </span>
                            <div className="grid grid-cols-2 gap-1 w-full">
                              {theory.map((slot) => (
                                <span
                                  key={slot}
                                  className="px-2 py-1 bg-teal-600 text-white rounded-md text-xs font-medium text-center"
                                >
                                  {getSlotTime(slot)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
