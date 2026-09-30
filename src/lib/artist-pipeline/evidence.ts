const LOCATION = /\b(omaha|nebraska|lincoln,?\s*ne\b|council bluffs|benson)\b/i;

export function hasLocationEvidence(texts: string[]): boolean {
  return texts.some((t) => LOCATION.test(t));
}

export function spotifyIdInText(spotifyId: string, text: string): boolean {
  return text.includes(`open.spotify.com/artist/${spotifyId}`);
}
