'use client'

import { SessionProvider } from 'next-auth/react'

export default function TeacherLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
