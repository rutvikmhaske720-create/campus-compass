'use client'

import { CheckCircleIcon, UserGroupIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function SetupComplete({ credentials, onReset }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-xl">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            University Setup Complete!
          </h1>
          <p className="text-slate-300">
            Your institution has been successfully configured with AI-powered management capabilities.
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-white">Department Coordinator Accounts</h2>
          </div>
          <p className="text-slate-300 mb-4">
            Secure login credentials have been generated for each department coordinator. 
            Please share these credentials with the respective department heads.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-slate-600">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Temporary Password
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900/30 divide-y divide-slate-600">
                {credentials.map((cred, index) => (
                  <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {cred.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {cred.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono bg-slate-800 rounded px-2 py-1">
                      {cred.password}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-amber-400 font-semibold mb-1 text-sm">Security Notice</h3>
                <p className="text-amber-200 text-xs">
                  These are temporary passwords. Coordinators should change them upon first login. 
                  All credentials are encrypted and stored securely.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-gradient-primary rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Access Admin Dashboard
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </a>
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center px-6 py-3 font-semibold text-slate-300 border-2 border-slate-600 rounded-xl hover:border-primary hover:text-white transition-all duration-300"
            >
              Setup Another University
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
