'use client'

import { useEffect } from 'react'

export default function ErrorBoundary() {
  useEffect(() => {
    const originalError = console.error
    console.error = (...args) => {
      const msg = args[0]?.toString() || ''
      if (msg.includes('[next-auth]') || msg.includes('CLIENT_FETCH_ERROR')) {
        return
      }
      originalError(...args)
    }
    return () => { console.error = originalError }
  }, [])
  return null
}
