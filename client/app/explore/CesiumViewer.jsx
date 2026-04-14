'use client'

import './cesium-base-url'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

import { useEffect, useRef, useState } from 'react'

const metersToDegLat = (m) => m / 110574
const metersToDegLng = (m, lat) =>
  m / (111320 * Math.cos((lat * Math.PI) / 180))

function distMeters(a, b) {
  const dLat = (a.lat - b.lat) * 110574
  const dLng =
    (a.lng - b.lng) * 111320 * Math.cos((a.lat * Math.PI) / 180)
  return Math.sqrt(dLat * dLat + dLng * dLng)
}

function centroidOfFlat(coords) {
  let sx = 0
  let sy = 0
  const n = coords.length / 2
  for (let i = 0; i < coords.length; i += 2) {
    sx += coords[i]
    sy += coords[i + 1]
  }
  return { lng: sx / n, lat: sy / n }
}

function footprintFor(poi, style) {
  const dLat = metersToDegLat(style.depth / 2)
  const dLng = metersToDegLng(style.width / 2, poi.lat)
  return [
    poi.lng - dLng, poi.lat - dLat,
    poi.lng + dLng, poi.lat - dLat,
    poi.lng + dLng, poi.lat + dLat,
    poi.lng - dLng, poi.lat + dLat,
  ]
}

const DEFAULT_STYLE = {
  academic: { width: 38, depth: 28, height: 22 },
  admin:    { width: 34, depth: 24, height: 16 },
  facility: { width: 36, depth: 26, height: 14 },
  hostel:   { width: 44, depth: 20, height: 20 },
  landmark: { width: 14, depth: 8,  height: 7 },
}

const getPoiIdFromPicked = (picked) => {
  if (!picked || !picked.id) return null
  const entity = picked.id
  const prop = entity.properties?.poiId
  if (prop) {
    try {
      const v = prop.getValue ? prop.getValue() : prop
      if (typeof v === 'string') return v
    } catch {}
  }
  return null
}

export default function CesiumViewer({
  campus,
  pois,
  categories,
  selectedPoiId,
  onSelectPoi,
  resetSignal = 0,
}) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const handlerRef = useRef(null)
  const poiEntitiesRef = useRef(new Map())
  const buildingEntitiesRef = useRef([])
  const groundHeightsRef = useRef(new Map())
  const centerGroundRef = useRef(565)
  const onSelectPoiRef = useRef(onSelectPoi)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [osmCount, setOsmCount] = useState(0)

  useEffect(() => {
    onSelectPoiRef.current = onSelectPoi
  }, [onSelectPoi])

  useEffect(() => {
    if (!campus || !pois || pois.length === 0) return
    let cancelled = false

    async function init() {
      if (!containerRef.current) return

      const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN
      if (!ionToken) {
        setError(
          'Missing NEXT_PUBLIC_CESIUM_ION_TOKEN. Add it to client/.env and restart the dev server.'
        )
        return
      }
      Cesium.Ion.defaultAccessToken = ionToken

      let viewer
      try {
        viewer = new Cesium.Viewer(containerRef.current, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          timeline: false,
          animation: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          scene3DOnly: true,
        })
      } catch (e) {
        setError(`Cesium viewer init failed: ${e.message || e}`)
        return
      }

      if (cancelled) {
        viewer.destroy()
        return
      }

      viewerRef.current = viewer

      // Scene styling
      const scene = viewer.scene
      scene.globe.show = true
      scene.globe.depthTestAgainstTerrain = true
      scene.skyAtmosphere.show = true
      scene.fog.enabled = true
      scene.fog.density = 0.00015
      scene.backgroundColor = Cesium.Color.fromCssColorString('#0b1220')
      scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(0.35, 0.45, -0.82),
        intensity: 2.6,
      })
      scene.screenSpaceCameraController.minimumZoomDistance = 20
      scene.screenSpaceCameraController.maximumZoomDistance = 6000

      // Load Cesium OSM Buildings as a background layer (covers the wider
      // area beyond our bbox). Failure is non-fatal.
      try {
        const osmBuildings = await Cesium.createOsmBuildingsAsync({
          style: new Cesium.Cesium3DTileStyle({
            color: "color('#e7e2d5', 0.92)",
          }),
        })
        if (!cancelled) scene.primitives.add(osmBuildings)
      } catch (e) {
        console.warn('[CesiumViewer] Cesium OSM Buildings tileset failed:', e)
      }

      if (cancelled) {
        viewer.destroy()
        return
      }

      // Sample terrain at every POI and at the campus center
      const groundByPoi = new Map()
      try {
        const terrainForSampling = await Cesium.createWorldTerrainAsync()
        const cartos = [
          Cesium.Cartographic.fromDegrees(campus.center.lng, campus.center.lat),
          ...pois.map((p) => Cesium.Cartographic.fromDegrees(p.lng, p.lat)),
        ]
        const sampled = await Cesium.sampleTerrainMostDetailed(
          terrainForSampling,
          cartos
        )
        const centerH = sampled[0]?.height
        centerGroundRef.current = Number.isFinite(centerH) ? centerH : 565
        pois.forEach((p, i) => {
          const h = sampled[i + 1]?.height
          groundByPoi.set(p.id, Number.isFinite(h) ? h : centerGroundRef.current)
        })
      } catch (e) {
        console.warn('[CesiumViewer] terrain sampling failed:', e)
        pois.forEach((p) => groundByPoi.set(p.id, 565))
      }
      groundHeightsRef.current = groundByPoi

      if (cancelled) {
        viewer.destroy()
        return
      }

      // Fetch real MITAOE building footprints from our Overpass proxy.
      let osmBuildingsData = []
      try {
        const res = await fetch('/api/explore/osm-buildings', {
          cache: 'no-store',
        })
        if (res.ok) {
          const json = await res.json()
          osmBuildingsData = json.buildings || []
        }
      } catch (e) {
        console.warn('[CesiumViewer] OSM building fetch failed:', e)
      }

      if (cancelled) {
        viewer.destroy()
        return
      }

      // Render real OSM buildings — each gets an owner POI if one is
      // within 60m of its centroid.
      const realCentroids = []
      for (const b of osmBuildingsData) {
        if (!b.footprint || b.footprint.length < 6) continue
        const centroid = centroidOfFlat(b.footprint)
        let ownerPoi = null
        let best = Infinity
        for (const p of pois) {
          const d = distMeters(centroid, p)
          if (d < best && d < 60) {
            best = d
            ownerPoi = p
          }
        }
        const ground = ownerPoi
          ? groundByPoi.get(ownerPoi.id)
          : centerGroundRef.current
        const top = ground + Math.max(6, b.height || 10)
        const meta = ownerPoi ? categories?.[ownerPoi.category] : null
        const color = ownerPoi
          ? Cesium.Color.fromCssColorString(meta?.color || '#14b8a6').withAlpha(0.88)
          : Cesium.Color.fromCssColorString('#e4dfcf').withAlpha(0.9)

        const entity = viewer.entities.add({
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(b.footprint),
            height: ground,
            extrudedHeight: top,
            material: color,
            outline: true,
            outlineColor: Cesium.Color.BLACK.withAlpha(0.35),
          },
        })
        if (ownerPoi) {
          entity.properties = new Cesium.PropertyBag({ poiId: ownerPoi.id })
          realCentroids.push(ownerPoi.id)
        }
        buildingEntitiesRef.current.push(entity)
      }
      setOsmCount(osmBuildingsData.length)

      // For POIs that don't have any OSM building nearby, render a
      // synthesized fallback box so every POI is still visible in 3D.
      const poisWithRealBuilding = new Set(realCentroids)
      for (const poi of pois) {
        if (poisWithRealBuilding.has(poi.id)) continue
        const meta = categories?.[poi.category] || { color: '#14b8a6' }
        const style = DEFAULT_STYLE[poi.category] || DEFAULT_STYLE.academic
        const ground = groundByPoi.get(poi.id)
        const top = ground + style.height
        const color = Cesium.Color.fromCssColorString(meta.color).withAlpha(0.88)

        const entity = viewer.entities.add({
          id: `${poi.id}__fallback`,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(
              footprintFor(poi, style)
            ),
            height: ground,
            extrudedHeight: top,
            material: color,
            outline: true,
            outlineColor: Cesium.Color.WHITE.withAlpha(0.4),
          },
        })
        entity.properties = new Cesium.PropertyBag({ poiId: poi.id })
        buildingEntitiesRef.current.push(entity)
      }

      // Floating label per POI above its building top.
      for (const poi of pois) {
        const meta = categories?.[poi.category] || { color: '#14b8a6' }
        const style = DEFAULT_STYLE[poi.category] || DEFAULT_STYLE.academic
        const ground = groundByPoi.get(poi.id)
        const labelHeight = ground + style.height + 12
        const color = Cesium.Color.fromCssColorString(meta.color)

        const label = viewer.entities.add({
          id: `${poi.id}__label`,
          position: Cesium.Cartesian3.fromDegrees(poi.lng, poi.lat, labelHeight),
          point: {
            pixelSize: 9,
            color: Cesium.Color.WHITE,
            outlineColor: color,
            outlineWidth: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: poi.name,
            font: '600 13px "Inter", system-ui, sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.fromCssColorString('#0b1220'),
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            translucencyByDistance: new Cesium.NearFarScalar(400, 1.0, 4000, 0.0),
            scaleByDistance: new Cesium.NearFarScalar(100, 1.1, 2000, 0.8),
          },
        })
        label.properties = new Cesium.PropertyBag({ poiId: poi.id })
        poiEntitiesRef.current.set(poi.id, label)
      }

      // Click handling — only picks buildings/labels that have a poiId
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      handlerRef.current = handler
      handler.setInputAction((event) => {
        const picked = viewer.scene.pick(event.position)
        const poiId = getPoiIdFromPicked(picked)
        if (!poiId) return
        const poi = pois.find((p) => p.id === poiId)
        if (poi) onSelectPoiRef.current?.(poi)
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      // Initial cinematic fly-in
      const centerGround = centerGroundRef.current
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          campus.center.lng,
          campus.center.lat - 0.0025,
          centerGround + 260
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-22),
          roll: 0,
        },
        duration: 3.0,
      })

      setReady(true)
    }

    init()

    return () => {
      cancelled = true
      if (handlerRef.current) {
        handlerRef.current.destroy()
        handlerRef.current = null
      }
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy()
      }
      viewerRef.current = null
      poiEntitiesRef.current.clear()
      buildingEntitiesRef.current = []
      groundHeightsRef.current.clear()
    }
  }, [campus, pois, categories])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !ready || !selectedPoiId) return
    const poi = pois.find((p) => p.id === selectedPoiId)
    if (!poi) return
    const ground = groundHeightsRef.current.get(poi.id) ?? 565
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        poi.lng,
        poi.lat - 0.0006,
        ground + 130
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-26),
        roll: 0,
      },
      duration: 1.6,
    })
  }, [selectedPoiId, ready, pois])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !ready || resetSignal === 0 || !campus) return
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        campus.center.lng,
        campus.center.lat - 0.0025,
        centerGroundRef.current + 260
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-22),
        roll: 0,
      },
      duration: 1.8,
    })
  }, [resetSignal, ready, campus])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {ready && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-white/70 backdrop-blur">
          {osmCount > 0
            ? `${osmCount} OSM buildings loaded`
            : 'No OSM coverage — showing placeholder buildings'}
        </div>
      )}

      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950/95 via-teal-950/90 to-slate-950/95 text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-300 border-t-transparent" />
            <p className="text-sm opacity-80">Loading 3D campus…</p>
            <p className="mt-1 text-xs opacity-50">
              Streaming terrain, imagery and OSM buildings.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/95 p-6 text-red-100">
          <div className="max-w-md space-y-2 text-center">
            <p className="text-lg font-semibold">Could not load 3D campus</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
