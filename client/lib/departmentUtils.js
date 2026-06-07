/**
 * Normalize a department name: uppercase, strip whitespace/punctuation.
 * "First Year", "first-year", "FY_2024" → "FIRSTYEAR", "FY", "FY2024"
 */
export function normalizeDepartmentName(name) {
  if (!name) return ''
  return String(name).toUpperCase().replace(/[\s._\-]/g, '')
}

/**
 * Returns true if this department represents First Year.
 * Accepts: "FY", "First Year", "FY-2024", "first year", "First-Year", etc.
 */
export function isFYDepartment(name) {
  const clean = normalizeDepartmentName(name)
  if (!clean) return false
  // Match FY exactly, or any name starting with FIRSTYEAR / FY followed by digits.
  return clean === 'FY' || clean === 'FIRSTYEAR' || /^FY\d+$/.test(clean) || /^FIRSTYEAR\d+$/.test(clean)
}
