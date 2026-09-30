import { expect, test, vi } from "vitest";
import { fetchEventPageText } from "./event-page";

const html = (body: string) =>
  new Response(`<html><head><style>.x{}</style><script>var a=1</script></head><body>${body}</body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } });

test("strips tags/scripts/styles and decodes entities", async () => {
  const f = vi.fn(async () => html("<h1>Surfer Girl</h1><p>w/ South Summit &amp; JOBY!</p>")) as unknown as typeof fetch;
  expect(await fetchEventPageText("https://x", { fetch: f })).toBe("Surfer Girl w/ South Summit & JOBY!");
});

test("caps length", async () => {
  const f = vi.fn(async () => html("a".repeat(10_000))) as unknown as typeof fetch;
  expect((await fetchEventPageText("https://x", { fetch: f, maxChars: 100 }))!.length).toBe(100);
});

test.each([
  ["null url", null, async () => html("x")],
  ["http error", "https://x", async () => new Response("no", { status: 500 })],
  ["non-html", "https://x", async () => new Response("{}", { headers: { "content-type": "application/json" } })],
  ["network error", "https://x", async () => { throw new Error("ECONNRESET"); }],
])("returns null on %s", async (_n, url, impl) => {
  const f = vi.fn(impl) as unknown as typeof fetch;
  expect(await fetchEventPageText(url as string | null, { fetch: f })).toBeNull();
});

test("decodes named entity eacute", async () => {
  const f = vi.fn(async () => html("Beyonc&eacute;")) as unknown as typeof fetch;
  expect(await fetchEventPageText("https://x", { fetch: f })).toBe("Beyoncé");
});

test("decodes numeric entity for right single quotation mark", async () => {
  const f = vi.fn(async () => html("Don&#8217;t")) as unknown as typeof fetch;
  expect(await fetchEventPageText("https://x", { fetch: f })).toBe(`Don${String.fromCodePoint(8217)}t`);
});

test("decodes numeric entity for ampersand", async () => {
  const f = vi.fn(async () => html("A &#038; B")) as unknown as typeof fetch;
  expect(await fetchEventPageText("https://x", { fetch: f })).toBe("A & B");
});

test("decodes hex entities", async () => {
  const f = vi.fn(async () => html("&#x27;x&#x27;")) as unknown as typeof fetch;
  expect(await fetchEventPageText("https://x", { fetch: f })).toBe("'x'");
});

test("handles invalid numeric entities without throwing", async () => {
  const f = vi.fn(async () => html("before&#99999999;after")) as unknown as typeof fetch;
  const result = await fetchEventPageText("https://x", { fetch: f });
  expect(result).toBeDefined();
  expect(result).not.toBeNull();
  // Invalid code point becomes a space
  expect(result).toMatch(/before\s+after/);
});
