'use client'

export default function LoadingSpinner({ message = 'Loading...', size = 'default' }) {
  const sizes = {
    small: 'h-8 w-8',
    default: 'h-16 w-16',
    large: 'h-24 w-24'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className={`${sizes[size]} border-4 border-gray-200 border-t-primary border-r-primary rounded-full animate-spin`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-900 font-semibold text-lg">{message}</p>
          <div className="flex items-center justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
