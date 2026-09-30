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
