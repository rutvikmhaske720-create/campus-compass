'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  X,
  MapPin,
  Menu,
  Home,
} from 'lucide-react'
export default function ExploreUI({
  campus,
  pois,
  categories,
  selectedPoi,
  onSelect,
  onResetView,
}) {
  const [query, setQuery] = useState('')
  const [listOpen, setListOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pois
    return pois.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    )
  }, [query, pois])

  return (
    <>
      {/* Top bar */}
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2 text-white shadow-lg backdrop-blur">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium hover:bg-white/10"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="mx-1 h-5 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-300" />
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-wide opacity-60">
                Exploring
              </p>
              <p className="text-sm font-semibold">{campus?.name || 'Campus'}</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onResetView}
            className="flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-2 text-sm text-white shadow-lg backdrop-blur hover:bg-slate-900"
            aria-label="Reset view"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Reset view</span>
          </button>
          <button
            type="button"
            onClick={() => setListOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-lg hover:bg-teal-500 md:hidden"
            aria-label="Toggle places list"
          >
            <Menu className="h-4 w-4" />
            Places
          </button>
        </div>
      </header>

      {/* Desktop left sidebar */}
      <aside
        className={
          'pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-80 p-3 pt-20 md:block'
        }
      >
        <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-2xl bg-slate-900/85 text-white shadow-xl backdrop-blur">
          <SearchBox query={query} setQuery={setQuery} />
          <PoiList
            items={filtered}
            categories={categories}
            selectedId={selectedPoi?.id}
            onSelect={onSelect}
          />
        </div>
      </aside>

      {/* Mobile places drawer */}
      {listOpen && (
        <div
          className="absolute inset-0 z-30 md:hidden"
          onClick={() => setListOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-950/60" />
          <div
            className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-2xl bg-slate-900/95 text-white shadow-2xl backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="font-semibold">Places</p>
              <button
                type="button"
                onClick={() => setListOpen(false)}
                className="rounded-full p-1 hover:bg-white/10"
                aria-label="Close places list"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SearchBox query={query} setQuery={setQuery} />
            <PoiList
              items={filtered}
              categories={categories}
              selectedId={selectedPoi?.id}
              onSelect={(poi) => {
                onSelect(poi)
                setListOpen(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Info panel: desktop right, mobile bottom sheet */}
      {selectedPoi && (
        <InfoPanel
          poi={selectedPoi}
          categories={categories}
          onClose={() => onSelect(null)}
        />
      )}
    </>
  )
}

function SearchBox({ query, setQuery }) {
  return (
    <div className="border-b border-white/10 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search buildings, departments…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-9 text-sm text-white placeholder-white/40 outline-none focus:border-teal-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 hover:bg-white/10"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function PoiList({ items, categories, selectedId, onSelect }) {
  if (items.length === 0) {
    return (
      <div className="flex-1 px-4 py-8 text-center text-sm text-white/60">
        No places match your search.
      </div>
    )
  }
  return (
    <ul className="flex-1 space-y-1 overflow-y-auto p-2">
      {items.map((poi) => {
        const meta = categories?.[poi.category]
        const active = poi.id === selectedId
        return (
          <li key={poi.id}>
            <button
              type="button"
              onClick={() => onSelect(poi)}
              className={
                'flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition ' +
                (active
                  ? 'bg-teal-600/30 ring-1 ring-teal-400'
                  : 'hover:bg-white/5')
              }
            >
              <span
                className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta?.color || '#14b8a6' }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {poi.name}
                </span>
                <span className="block text-xs text-white/50">
                  {meta?.label || poi.category}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function InfoPanel({ poi, categories, onClose }) {
  const meta = categories?.[poi.category]
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-3 sm:p-4 md:inset-auto md:bottom-4 md:right-4 md:top-20 md:w-96 md:flex-col">
      <div className="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900/90 text-white shadow-2xl backdrop-blur md:max-w-none">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: meta?.color || '#14b8a6' }}
                aria-hidden
              />
              <span className="text-xs uppercase tracking-wide text-white/60">
                {meta?.label || poi.category}
              </span>
            </div>
            <h2 className="truncate text-lg font-semibold">{poi.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Close info panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[40vh] space-y-3 overflow-y-auto p-4 text-sm leading-relaxed text-white/80 md:max-h-none">
          <p>{poi.description}</p>
          <p className="text-xs text-white/40">
            {poi.lat.toFixed(5)}°N, {poi.lng.toFixed(5)}°E
          </p>
        </div>
      </div>
    </div>
  )
}
