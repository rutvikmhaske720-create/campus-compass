// MITAOE Points of Interest.
//
// Coordinates are APPROXIMATE and laid out on a rough 150m grid so the
// synthesized building boxes don't overlap. Replace with real on-site
// coordinates once available.
//
// Schema:
//   id:          stable slug, used in URLs and keys
//   name:        display name
//   category:    'academic' | 'admin' | 'facility' | 'hostel' | 'landmark'
//   lat, lng:    WGS84 degrees
//   description: 1-2 sentence blurb shown in the info panel

export const CAMPUS_CENTER = {
  lat: 18.6769,
  lng: 73.8984,
}

export const CAMPUS_NAME = 'MIT Academy of Engineering, Alandi'

// Rough campus layout (~150m spacing between neighbors)
//
//                       [it]    [library]    [boys-hostel]
//                [entc]                     [comp]
//   [girls-hostel]       [main-building]       [mech]
//                [civil]    [auditorium]    [chem]
//                           [canteen]
//                           [main-gate]
//                           [sports-ground]

export const POIS_SEED = [
  {
    id: 'main-gate',
    name: 'Main Entrance',
    category: 'landmark',
    lat: 18.67555,
    lng: 73.89840,
    description:
      'Primary entrance to MITAOE off the Pune–Alandi road. Security check and visitor registration.',
  },
  {
    id: 'main-building',
    name: 'Main Academic Building',
    category: 'academic',
    lat: 18.67690,
    lng: 73.89840,
    description:
      'Central academic block housing administrative offices and several department wings.',
  },
  {
    id: 'library',
    name: 'Central Library',
    category: 'facility',
    lat: 18.67810,
    lng: 73.89850,
    description:
      'Central library with reading halls, digital catalog, and reference sections.',
  },
  {
    id: 'auditorium',
    name: 'Main Auditorium',
    category: 'facility',
    lat: 18.67620,
    lng: 73.89820,
    description:
      'Auditorium used for seminars, cultural events, and guest lectures.',
  },
  {
    id: 'canteen',
    name: 'Student Canteen',
    category: 'facility',
    lat: 18.67600,
    lng: 73.89885,
    description:
      'Main student canteen and food court area.',
  },
  {
    id: 'computer-dept',
    name: 'Computer Engineering',
    category: 'academic',
    lat: 18.67750,
    lng: 73.89930,
    description:
      'Computer Engineering labs, classrooms, and faculty offices.',
  },
  {
    id: 'it-dept',
    name: 'Information Technology',
    category: 'academic',
    lat: 18.67830,
    lng: 73.89910,
    description:
      'IT department with software and networking labs.',
  },
  {
    id: 'entc-dept',
    name: 'Electronics & Telecommunication',
    category: 'academic',
    lat: 18.67830,
    lng: 73.89770,
    description:
      'E&TC labs including signal processing, embedded systems, and communication.',
  },
  {
    id: 'mech-dept',
    name: 'Mechanical Engineering',
    category: 'academic',
    lat: 18.67690,
    lng: 73.89965,
    description:
      'Mechanical workshops, CAD labs, and heat-transfer facilities.',
  },
  {
    id: 'civil-dept',
    name: 'Civil Engineering',
    category: 'academic',
    lat: 18.67625,
    lng: 73.89755,
    description:
      'Civil labs including surveying, concrete, and structures.',
  },
  {
    id: 'chem-dept',
    name: 'Chemical Engineering',
    category: 'academic',
    lat: 18.67625,
    lng: 73.89965,
    description:
      'Chemical and petrochemical engineering labs.',
  },
  {
    id: 'sports-ground',
    name: 'Sports Ground',
    category: 'facility',
    lat: 18.67490,
    lng: 73.89900,
    description:
      'Outdoor sports ground for cricket, football, and athletics.',
  },
  {
    id: 'boys-hostel',
    name: 'Boys Hostel',
    category: 'hostel',
    lat: 18.67900,
    lng: 73.90000,
    description:
      'On-campus boys residential hostel.',
  },
  {
    id: 'girls-hostel',
    name: 'Girls Hostel',
    category: 'hostel',
    lat: 18.67770,
    lng: 73.89680,
    description:
      'On-campus girls residential hostel.',
  },
]

export const CATEGORY_META = {
  landmark:  { label: 'Landmark',  color: '#f59e0b' },
  academic:  { label: 'Academic',  color: '#14b8a6' },
  admin:     { label: 'Admin',     color: '#6366f1' },
  facility:  { label: 'Facility',  color: '#0ea5e9' },
  hostel:    { label: 'Hostel',    color: '#ec4899' },
}

// Legacy re-export for client code that hasn't migrated to the API yet.
export const POIS = POIS_SEED

// Bounding box around MITAOE used for OSM Overpass queries.
// (south, west, north, east) — ~900x900m around the campus centroid.
export const CAMPUS_BBOX = {
  south: 18.6725,
  west:  73.8945,
  north: 18.6815,
  east:  73.9035,
}

// Synthesized 3D footprint/height per category. Used only as a fallback
// when OSM has no real building data for the campus.
export const BUILDING_STYLE = {
  academic: { width: 38, depth: 28, height: 22 },
  admin:    { width: 34, depth: 24, height: 16 },
  facility: { width: 36, depth: 26, height: 14 },
  hostel:   { width: 44, depth: 20, height: 20 },
  landmark: { width: 14, depth: 8,  height: 7  },
}
