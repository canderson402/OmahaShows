const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

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
      .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? " ")
      .replace(/\s+/g, " ")
      .trim();
    return text ? text.slice(0, opts.maxChars ?? 6000) : null;
  } catch {
    return null;
  }
}
