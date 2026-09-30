// app/api/admin/artist-review-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminSupabase, requireAdmin } from "../../../../src/lib/admin-auth";

const WINDOW = 50;

/** How often recent high-confidence matches were approved without any change (the auto-approve bar). */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { data, error } = await adminSupabase()
    .from("pending_artist_analyses")
    .select("review_changed")
    .eq("status", "approved")
    .eq("confidence_tier", "high")
    .not("reviewed_at", "is", null)
    .order("reviewed_at", { ascending: false })
    .limit(WINDOW);
  if (error) {
    // Migration 009 not applied yet: no tracking columns to read.
    if (/confidence_tier|review_changed|reviewed_at/.test(error.message)) return NextResponse.json({ available: false });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const reviewed = data?.length ?? 0;
  const unchanged = (data ?? []).filter((r) => r.review_changed === false).length;
  return NextResponse.json({ available: true, window: WINDOW, reviewed, unchanged });
}
