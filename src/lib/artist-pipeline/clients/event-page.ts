const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
  "&apos;": "'",
  "&rsquo;": "'",
  "&lsquo;": "'",
  "&ldquo;": '"',
  "&rdquo;": '"',
  "&ndash;": "–",
  "&mdash;": "—",
  "&hellip;": "…",
  "&eacute;": "é",
  "&egrave;": "è",
  "&aacute;": "á",
  "&iacute;": "í",
  "&oacute;": "ó",
  "&uacute;": "ú",
  "&ntilde;": "ñ",
  "&uuml;": "ü",
  "&ouml;": "ö",
  "&auml;": "ä",
};

export async function fetchEventPageText(
  url: string | null,
  opts: { fetch?: typeof fetch; timeoutMs?: number; maxChars?: number } = {},
): Promise<string | null> {
  if (!url) return null;
  const f = opts.fetch ?? fetch;
  try {
    const res = await f(url, {
      signal: AbortSignal.timeout(opts.timeoutMs ?? 8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OmahaShowsBot/1.0; +https://omahashows.com)" },
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) return null;
    const text = (await res.text())
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, (e) => {
        const lower = e.toLowerCase();
        // Check if it's a named entity
        if (ENTITIES[lower]) return ENTITIES[lower];
        // Check if it's a numeric entity
        const decimalMatch = lower.match(/^&#(\d+);$/);
        if (decimalMatch) {
          try {
            const codePoint = parseInt(decimalMatch[1], 10);
            return String.fromCodePoint(codePoint);
          } catch {
            return " ";
          }
        }
        const hexMatch = lower.match(/^&#x([0-9a-f]+);$/);
        if (hexMatch) {
          try {
            const codePoint = parseInt(hexMatch[1], 16);
            return String.fromCodePoint(codePoint);
          } catch {
            return " ";
          }
        }
        // Unknown entity
        return " ";
      })
      .replace(/\s+/g, " ")
      .trim();
    return text ? text.slice(0, opts.maxChars ?? 6000) : null;
  } catch {
    return null;
  }
}
