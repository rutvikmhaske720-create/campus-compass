'use client'

import { SessionProvider } from 'next-auth/react'

export default function StudentLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
