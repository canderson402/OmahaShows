// app/api/admin/pending-analyses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: List all pending artist analyses with event details
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("pending_artist_analyses")
      .select(`
        id,
        event_id,
        artists,
        created_at,
        status,
        events (
          id,
          title,
          date,
          time,
          venue_id,
          venue_name,
          image_url,
          venues (name)
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("List pending analyses error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list pending analyses" },
      { status: 500 }
    );
  }
}

// DELETE: Reject a pending artist analysis
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // First get the event_id so we can mark it as analyzed
    const { data: analysis } = await supabase
      .from("pending_artist_analyses")
      .select("event_id")
      .eq("id", id)
      .single();

    // Delete the pending analysis
    const { error } = await supabase
      .from("pending_artist_analyses")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Mark the event as analyzed so it won't be re-analyzed
    // Also clean up any event_changes entries for this event
    if (analysis?.event_id) {
      await supabase
        .from("events")
        .update({ analyzed_at: new Date().toISOString() })
        .eq("id", analysis.event_id);

      // Delete any event_changes entries so it won't be picked up again
      await supabase
        .from("event_changes")
        .delete()
        .eq("event_id", analysis.event_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject pending analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reject analysis" },
      { status: 500 }
    );
  }
}
