'use client'

import { ArrowRightIcon, BuildingOfficeIcon, AcademicCapIcon, CogIcon, DocumentCheckIcon } from '@heroicons/react/24/outline'

export default function SystemArchitecture() {
  return (
    <div className="py-12 bg-transparent relative overflow-hidden">
      <svg className="absolute top-10 left-10 w-32 h-32 text-teal-200 opacity-30" viewBox="0 0 100 100">
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" rx="10">
          <animate attributeName="stroke-dasharray" values="0,320;320,0;0,320" dur="8s" repeatCount="indefinite"/>
        </rect>
      </svg>
      <svg className="absolute bottom-10 right-10 w-40 h-40 text-cyan-200 opacity-30" viewBox="0 0 100 100">
        <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="none" stroke="currentColor" strokeWidth="2">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite"/>
        </path>
      </svg>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 animate-slide-in-right">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">How ATS Addresses the Problem</h2>
          <p className="text-lg text-slate-600">Intelligent automation for complex scheduling challenges</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Multi-Agent */}
          <div className="relative group animate-zoom-in" style={{animationDelay: '200ms'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-2xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 shadow-2xl transform hover:scale-105 transition-all">
              <svg className="absolute top-0 right-0 w-32 h-32 opacity-20" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <animate attributeName="r" values="80;90;80" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="50" cy="50" r="15" fill="#3b82f6" opacity="0.4"/>
                <circle cx="150" cy="50" r="15" fill="#3b82f6" opacity="0.4"/>
                <circle cx="50" cy="150" r="15" fill="#3b82f6" opacity="0.4"/>
                <circle cx="150" cy="150" r="15" fill="#3b82f6" opacity="0.4"/>
                <line x1="100" y1="100" x2="50" y2="50" stroke="#3b82f6" strokeWidth="2" opacity="0.4">
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>
                </line>
                <line x1="100" y1="100" x2="150" y2="50" stroke="#3b82f6" strokeWidth="2" opacity="0.4">
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                </line>
              </svg>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-900">Multi-Agent Orchestration</h3>
              </div>
              <p className="text-sm text-blue-700 relative z-10">Agents handle priorities, conflicts, and timing with distributed task management</p>
            </div>
          </div>

          {/* Advanced Algorithms */}
          <div className="relative group animate-zoom-in" style={{animationDelay: '350ms'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-pink-300 rounded-2xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-2xl transform hover:scale-105 transition-all">
              <svg className="absolute top-0 right-0 w-40 h-32 opacity-20" viewBox="0 0 200 150">
                <rect x="20" y="20" width="40" height="30" rx="4" fill="#a855f7" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                </rect>
                <rect x="80" y="20" width="40" height="30" rx="4" fill="#a855f7" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                </rect>
                <rect x="140" y="20" width="40" height="30" rx="4" fill="#a855f7" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="1s" repeatCount="indefinite"/>
                </rect>
                <path d="M 40 50 L 100 70" stroke="#a855f7" strokeWidth="2" opacity="0.5"/>
                <path d="M 100 50 L 100 70" stroke="#a855f7" strokeWidth="2" opacity="0.5"/>
                <path d="M 160 50 L 100 70" stroke="#a855f7" strokeWidth="2" opacity="0.5"/>
                <circle cx="100" cy="90" r="20" fill="#a855f7" opacity="0.4">
                  <animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/>
                </circle>
              </svg>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-purple-900">Advanced Algorithms</h3>
              </div>
              <p className="text-sm text-purple-700 relative z-10">CP-SAT, Heuristic Search, Gale-Shapley, Genetic Algorithm for optimization</p>
            </div>
          </div>

          {/* NEP 2020 */}
          <div className="relative group animate-zoom-in" style={{animationDelay: '500ms'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-emerald-300 rounded-2xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-2xl transform hover:scale-105 transition-all">
              <svg className="absolute top-0 right-0 w-40 h-32 opacity-20" viewBox="0 0 200 150">
                <rect x="50" y="20" width="100" height="25" rx="4" fill="#10b981" opacity="0.7"/>
                <rect x="40" y="55" width="120" height="25" rx="4" fill="#10b981" opacity="0.5"/>
                <rect x="30" y="90" width="140" height="25" rx="4" fill="#10b981" opacity="0.3"/>
                <circle cx="100" cy="130" r="10" fill="#10b981" opacity="0.6">
                  <animate attributeName="r" values="10;15;10" dur="2s" repeatCount="indefinite"/>
                </circle>
              </svg>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-900">NEP 2020 Aligned</h3>
              </div>
              <p className="text-sm text-green-700 relative z-10">Credit-based multidisciplinary framework for FYUP</p>
            </div>
          </div>

          {/* LLM Suggestions */}
          <div className="relative group animate-zoom-in" style={{animationDelay: '650ms'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-amber-300 rounded-2xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200 shadow-2xl transform hover:scale-105 transition-all">
              <svg className="absolute top-0 right-0 w-32 h-32 opacity-20" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="60" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.4">
                  <animate attributeName="r" values="60;70;60" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="100" cy="100" r="40" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.6">
                  <animate attributeName="r" values="40;50;40" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="100" cy="100" r="20" fill="#f97316" opacity="0.7"/>
                <path d="M 100 100 L 50 50" stroke="#f97316" strokeWidth="2" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/>
                </path>
                <path d="M 100 100 L 150 50" stroke="#f97316" strokeWidth="2" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                </path>
                <path d="M 100 100 L 50 150" stroke="#f97316" strokeWidth="2" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" begin="1s" repeatCount="indefinite"/>
                </path>
                <path d="M 100 100 L 150 150" stroke="#f97316" strokeWidth="2" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" begin="1.5s" repeatCount="indefinite"/>
                </path>
              </svg>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-orange-900">LLM Suggestions</h3>
              </div>
              <p className="text-sm text-orange-700 relative z-10">Gemini 2.5 provides intelligent suggestions for unfit lectures</p>
            </div>
          </div>
        </div>

        <div className="mt-10 mb-6 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Complete Workflow</h3>
          <p className="text-slate-600">End-to-end timetable generation process</p>
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Institute Level</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-900">Institute Co-ordinator</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Mandatory Electives</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• MDM Courses</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Skill-based Courses</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Common Time Slots</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <ArrowRightIcon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="lg:hidden">
            <ArrowRightIcon className="h-8 w-8 text-blue-500 rotate-90" />
          </div>

          <div className="flex-1 bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <AcademicCapIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Department Level</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="font-semibold text-purple-900">Department Co-ordinator</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Faculty Preferences</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Available Classrooms</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Elective Courses</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Number of Batches</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <ArrowRightIcon className="h-8 w-8 text-purple-500" />
          </div>
          <div className="lg:hidden">
            <ArrowRightIcon className="h-8 w-8 text-purple-500 rotate-90" />
          </div>

          <div className="flex-1 bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CogIcon className="h-8 w-8 text-white animate-spin-slow" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">ATS Processing</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-semibold text-green-900">Automated System</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Verify Inputs</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Resolve Conflicts</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Apply Preferences</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Allocate Lectures</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <ArrowRightIcon className="h-8 w-8 text-green-500" />
          </div>
          <div className="lg:hidden">
            <ArrowRightIcon className="h-8 w-8 text-green-500 rotate-90" />
          </div>

          <div className="flex-1 bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <DocumentCheckIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Final Timetable</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="font-semibold text-orange-900">University Timetable</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Division-wise Merged</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Zero Conflicts</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• Common Rules Applied</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-700">• All Constraints Met</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
