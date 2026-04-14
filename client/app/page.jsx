'use client'

import { useRouter } from 'next/navigation'
import { useScrollAnimationMultiple } from '../lib/useScrollAnimation'
import LandingNav from './components/landing/LandingNav'
import HeroSection from './components/landing/HeroSection'
import WorkflowSection from './components/landing/WorkflowSection'
import SystemArchitecture from './components/landing/SystemArchitecture'
import FeasibilitySection from './components/landing/FeasibilitySection'
import ImpactSection from './components/landing/ImpactSection'
import BusinessSection from './components/landing/BusinessSection'
import TechStackSection from './components/landing/TechStackSection'
import TeamSection from './components/landing/TeamSection'

export default function Home() {
  const router = useRouter()
  useScrollAnimationMultiple(0.1)

  const handleSetupClick = () => {
    router.push('/set-up-university')
  }

  return (
    <>
      <LandingNav onSetupClick={handleSetupClick} />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        <HeroSection onSetupClick={handleSetupClick} />
        <div id="workflow"><WorkflowSection /></div>
        <div id="architecture"><SystemArchitecture /></div>
        <FeasibilitySection />
        <ImpactSection />
        <BusinessSection />
        <div id="tech-stack"><TechStackSection /></div>
        <div id="team"><TeamSection /></div>
        <div className="py-8 bg-white/50 backdrop-blur-sm border-t border-teal-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} ATS - Automated Timetable Scheduler by Team Eklavya_01. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
