'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import ExploreUI from './ExploreUI'

const CesiumViewer = dynamic(() => import('./CesiumViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-300 border-t-transparent" />
        <p className="text-sm opacity-80">Preparing 3D viewer…</p>
      </div>
    </div>
  ),
})

export default function ExplorePage() {
  const [campus, setCampus] = useState(null)
  const [pois, setPois] = useState([])
  const [categories, setCategories] = useState({})
  const [selectedPoi, setSelectedPoi] = useState(null)
  const [resetSignal, setResetSignal] = useState(0)
  const [loadError, setLoadError] = useState(null)

  // Fetch POIs from the API so the data source can later move to MongoDB
  // without touching the viewer.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/explore/pois', { cache: 'no-store' })
        if (!res.ok) throw new Error(`POIs API ${res.status}`)
        const json = await res.json()
        if (cancelled) return
        setCampus(json.campus)
        setPois(json.pois || [])
        setCategories(json.categories || {})
      } catch (e) {
        if (!cancelled) setLoadError(e.message || String(e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSelect = useCallback((poi) => {
    setSelectedPoi(poi)
  }, [])

  const handleReset = useCallback(() => {
    setSelectedPoi(null)
    setResetSignal((n) => n + 1)
  }, [])

  if (loadError) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-slate-950 text-red-200">
        <div className="max-w-md space-y-2 p-6 text-center">
          <p className="text-lg font-semibold">Could not load campus data</p>
          <p className="text-sm opacity-70">{loadError}</p>
        </div>
      </main>
    )
  }

  if (!campus || pois.length === 0) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-300 border-t-transparent" />
          <p className="text-sm opacity-80">Loading campus…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-slate-950">
      <CesiumViewer
        campus={campus}
        pois={pois}
        categories={categories}
        selectedPoiId={selectedPoi?.id || null}
        onSelectPoi={handleSelect}
        resetSignal={resetSignal}
      />
      <ExploreUI
        campus={campus}
        pois={pois}
        categories={categories}
        selectedPoi={selectedPoi}
        onSelect={handleSelect}
        onResetView={handleReset}
      />
    </main>
  )
}
