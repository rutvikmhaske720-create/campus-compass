'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldCheckIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import RoleSelection from '../../components/auth/RoleSelection'
import LoginForm from '../../components/auth/LoginForm'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!otpSent) {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        setOtpSent(true)
        setError('')
      } else {
        setError('Invalid credentials')
      }
      setLoading(false)
      return
    }

    const verifyRes = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    })

    if (!verifyRes.ok) {
      setError('Invalid or expired OTP')
      setLoading(false)
      return
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result.error) {
      setError('Authentication failed')
      setLoading(false)
    } else {
      const userResponse = await fetch('/api/auth/session')
      const session = await userResponse.json()
      
      if (!session?.user?.role) {
        setError('Session error. Please try again.')
        setLoading(false)
        return
      }
      
      if (session.user.role !== selectedRole) {
        setError(`Invalid credentials for ${selectedRole === 'admin' ? 'Institute Coordinator' : 'Department Coordinator'}. Please select the correct role.`)
        setLoading(false)
        return
      }
      
      if (session.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (session.user.role === 'coordinator') {
        router.push(`/${session.user.department}/dashboard`)
      }
    }
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleBack = () => {
    if (otpSent) {
      setOtpSent(false)
      setOtp('')
      setError('')
    } else {
      setSelectedRole(null)
      setEmail('')
      setPassword('')
      setError('')
    }
  }

  if (!selectedRole) {
    return <RoleSelection onRoleSelect={handleRoleSelect} />
  }

  const roleConfigs = {
    admin: {
      title: 'Institute Coordinator Portal',
      subtitle: 'Institute Management Dashboard',
      icon: ShieldCheckIcon,
      gradient: 'from-[#52796f] to-emerald-600',
      description: 'Complete oversight of all departments, analytics, and administrative controls.',
      emailPlaceholder: 'admin@university.edu',
      helpTitle: 'Institute Coordinator Access',
      helpText: 'Use the admin email and password you created during university setup.'
    },
    coordinator: {
      title: 'Department Coordinator Portal',
      subtitle: 'Department Management Dashboard',
      icon: AcademicCapIcon,
      gradient: 'from-[#778da9] to-blue-600',
      description: 'AI-powered scheduling, faculty coordination, and resource optimization for your department.',
      emailPlaceholder: 'coordinator@department.edu',
      helpTitle: 'Coordinator Access',
      helpText: 'Use the auto-generated credentials provided for your department.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-purple-100/50"></div>
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        otp={otp}
        setOtp={setOtp}
        otpSent={otpSent}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
        onBack={handleBack}
        config={roleConfigs[selectedRole]}
      />
    </div>
  )
}
