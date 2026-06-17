'use client'

import { useScrollAnimationMultiple } from '../lib/useScrollAnimation'
import LandingNav from './components/landing/LandingNav'
import HeroSection from './components/landing/HeroSection'
import ExploreSection from './components/landing/ExploreSection'
import WatchDemo from './components/WatchDemo'
import FAQSection from './components/FAQSection'

export default function Home() {
  useScrollAnimationMultiple(0.1)

  return (
    <>
      <LandingNav />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        <HeroSection />
<ExploreSection />

<div id="watch-demo">
  <WatchDemo />
</div>

<FAQSection />
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