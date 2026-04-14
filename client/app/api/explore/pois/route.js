import { NextResponse } from 'next/server'
import {
  CAMPUS_CENTER,
  CAMPUS_NAME,
  POIS_SEED,
  CATEGORY_META,
} from '../../../explore/data/pois'

// GET /api/explore/pois
// Returns the list of Points of Interest for the 3D campus explorer.
// Currently backed by a seed file; swap for a MongoDB collection later
// without touching the client.
export async function GET() {
  return NextResponse.json({
    campus: { name: CAMPUS_NAME, center: CAMPUS_CENTER },
    categories: CATEGORY_META,
    pois: POIS_SEED,
  })
}
