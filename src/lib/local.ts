// Whether an artist's hometown proves they're a local (Omaha-area / Nebraska) band.

const LOCAL_PATTERNS = [
  /\bnebraska\b/,
  /\bomaha\b/,
  /\bcouncil bluffs\b/,
  /(,|\s)\s*ne\.?$/,     // "Lincoln, NE", "Papillion NE"
];

/** True when the hometown names a Nebraska or Omaha-metro place; null when it proves nothing. */
export function localFromHometown(hometown: string | null | undefined): true | null {
  const h = hometown?.trim().toLowerCase();
  if (!h) return null;
  return LOCAL_PATTERNS.some((p) => p.test(h)) ? true : null;
}
