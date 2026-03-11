// Venue colors type - hex string per venue
export type VenueColors = Record<string, string>

// Default venue colors (fallback if database not loaded yet)
export const DEFAULT_VENUE_COLORS: VenueColors = {
  theslowdown: "#f59e0b",
  waitingroom: "#f97316",
  reverblounge: "#f43f5e",
  bourbontheatre: "#ec4899",
  admiral: "#d946ef",
  astrotheater: "#a855f7",
  steelhouse: "#06b6d4",
  baxterarena: "#ef4444",
  stircove: "#eab308",
  other: "#10b981",
  holland: "#14b8a6",
  orpheum: "#6366f1",
  barnato: "#84cc16",
}

// For backwards compatibility
export const VENUE_COLORS = DEFAULT_VENUE_COLORS

// Helper to convert hex to rgba for backgrounds
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
