import { NextResponse } from 'next/server'
import { CAMPUS_BBOX } from '../../../explore/data/pois'

export const dynamic = 'force-dynamic'

// Simple in-process cache so we don't hammer the free Overpass endpoint
// on every page load. TTL: 1 hour.
let cache = null
let cacheAt = 0
const CACHE_TTL_MS = 60 * 60 * 1000

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
]

function buildQuery({ south, west, north, east }) {
  return `
[out:json][timeout:25];
(
  way["building"](${south},${west},${north},${east});
  relation["building"](${south},${west},${north},${east});
);
out body;
>;
out skel qt;
`.trim()
}

async function fetchOverpass(query) {
  let lastError
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(25000),
      })
      if (!res.ok) {
        lastError = new Error(`Overpass ${url} -> ${res.status}`)
        continue
      }
      return await res.json()
    } catch (e) {
      lastError = e
    }
  }
  throw lastError || new Error('All Overpass endpoints failed')
}

// Parse Overpass elements into an array of { id, name, footprint, height, levels, tags }
// where footprint is a flat [lng, lat, lng, lat, ...] array.
function parseOverpass(json) {
  const nodes = new Map()
  const ways = []

  for (const el of json.elements || []) {
    if (el.type === 'node') {
      nodes.set(el.id, { lat: el.lat, lng: el.lon })
    } else if (el.type === 'way' && el.nodes && el.tags?.building) {
      ways.push(el)
    }
  }

  const buildings = []
  for (const way of ways) {
    const coords = []
    for (const nodeId of way.nodes) {
      const n = nodes.get(nodeId)
      if (!n) continue
      coords.push(n.lng, n.lat)
    }
    if (coords.length < 6) continue // need at least 3 points

    const tags = way.tags || {}
    const heightTag = parseFloat(tags.height)
    const levelsTag = parseFloat(tags['building:levels'])
    const height = Number.isFinite(heightTag)
      ? heightTag
      : Number.isFinite(levelsTag)
      ? levelsTag * 3.5
      : 10

    buildings.push({
      id: `osm-${way.id}`,
      name: tags.name || null,
      category: tags.amenity || tags.building || 'building',
      footprint: coords,
      height,
      levels: Number.isFinite(levelsTag) ? levelsTag : null,
      tags,
    })
  }

  return buildings
}

export async function GET() {
  const now = Date.now()
  if (cache && now - cacheAt < CACHE_TTL_MS) {
    return NextResponse.json({ source: 'cache', ...cache })
  }

  try {
    const query = buildQuery(CAMPUS_BBOX)
    const json = await fetchOverpass(query)
    const buildings = parseOverpass(json)
    cache = {
      bbox: CAMPUS_BBOX,
      count: buildings.length,
      fetchedAt: new Date().toISOString(),
      buildings,
    }
    cacheAt = now
    return NextResponse.json({ source: 'overpass', ...cache })
  } catch (e) {
    return NextResponse.json(
      {
        error: e.message || String(e),
        bbox: CAMPUS_BBOX,
        buildings: [],
      },
      { status: 502 }
    )
  }
}
