"use client"

import { SessionProvider } from "next-auth/react"
import Chatbot from "../components/shared/Chatbot"

export default function AdminLayout({ children }) {
  return (
    <SessionProvider>
      {children}
      <Chatbot />
    </SessionProvider>
  )
}
