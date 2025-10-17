/**
 * Version management helper functions for SOP version control
 */

/**
 * Increments the version number (last segment)
 * @param version - Current version string (e.g., "1.0" or "1.3.7")
 * @returns New incremented version (e.g., "1.1" or "1.3.8")
 * @example
 * incrementVersion("1.0") // Returns "1.1"
 * incrementVersion("1.3.7") // Returns "1.3.8"
 * incrementVersion("1.3.9") // Returns "1.3.10"
 * incrementVersion("2.15.42") // Returns "2.15.43"
 */
export function incrementVersion(version: string): string {
  const parts = version.split('.')
  
  // Increment the last part
  const lastIndex = parts.length - 1
  const lastNumber = parseInt(parts[lastIndex] || '0')
  parts[lastIndex] = String(lastNumber + 1)
  
  return parts.join('.')
}

/**
 * Compares two version strings
 * @param v1 - First version string
 * @param v2 - Second version string
 * @returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 * @example
 * compareVersions("1.0", "1.1") // Returns -1
 * compareVersions("2.0", "1.5") // Returns 1
 * compareVersions("1.5", "1.5") // Returns 0
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(p => parseInt(p || '0'))
  const parts2 = v2.split('.').map(p => parseInt(p || '0'))
  
  // Compare major version
  if (parts1[0] !== parts2[0]) {
    return parts1[0] < parts2[0] ? -1 : 1
  }
  
  // Compare minor version
  const minor1 = parts1[1] || 0
  const minor2 = parts2[1] || 0
  
  if (minor1 !== minor2) {
    return minor1 < minor2 ? -1 : 1
  }
  
  return 0
}

/**
 * Checks if version v1 is newer than v2
 * @param v1 - First version string
 * @param v2 - Second version string
 * @returns true if v1 is newer than v2
 */
export function isNewerVersion(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) > 0
}

/**
 * Formats version string for display
 * @param version - Version string
 * @returns Formatted version (e.g., "v1.0")
 */
export function formatVersion(version: string): string {
  return `v${version}`
}

