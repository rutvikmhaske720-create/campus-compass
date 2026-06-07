/**
 * Seed data for the 3D campus explorer.
 * Currently hardcoded for MITAOE, Pune. Swap for a DB collection later.
 */

// [lat, lng, altitude(m)]
export const CAMPUS_CENTER = [18.5117, 73.7985, 0]

export const CAMPUS_NAME = 'MIT Academy of Engineering, Alandi, Pune'

// Overpass bounding box  { south, west, north, east }
export const CAMPUS_BBOX = {
  south: 18.5085,
  west: 73.7950,
  north: 18.5150,
  east: 73.8020,
}

export const CATEGORY_META = {
  academic: { label: 'Academic', color: '#3b82f6' },
  lab: { label: 'Lab / Workshop', color: '#8b5cf6' },
  admin: { label: 'Administration', color: '#f59e0b' },
  hostel: { label: 'Hostel', color: '#10b981' },
  sports: { label: 'Sports', color: '#ef4444' },
  amenity: { label: 'Amenity', color: '#6366f1' },
}

export const POIS_SEED = [
  { id: 'main-building', name: 'Main Building', category: 'academic', lat: 18.5118, lng: 73.7983 },
  { id: 'library', name: 'Central Library', category: 'academic', lat: 18.5120, lng: 73.7990 },
  { id: 'admin-block', name: 'Admin Block', category: 'admin', lat: 18.5115, lng: 73.7980 },
  { id: 'cs-dept', name: 'Computer Science Dept', category: 'academic', lat: 18.5122, lng: 73.7987 },
  { id: 'workshop', name: 'Workshop', category: 'lab', lat: 18.5110, lng: 73.7992 },
  { id: 'boys-hostel', name: 'Boys Hostel', category: 'hostel', lat: 18.5105, lng: 73.7975 },
  { id: 'girls-hostel', name: 'Girls Hostel', category: 'hostel', lat: 18.5108, lng: 73.7970 },
  { id: 'canteen', name: 'Canteen', category: 'amenity', lat: 18.5116, lng: 73.7995 },
  { id: 'sports-complex', name: 'Sports Complex', category: 'sports', lat: 18.5100, lng: 73.7985 },
]
