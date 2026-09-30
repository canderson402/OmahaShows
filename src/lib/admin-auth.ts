import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _service: SupabaseClient | null = null;

/** Service-role client for admin API routes. Never falls back to the anon key. */
export function adminSupabase(): SupabaseClient {
  if (_service) return _service;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase URL and service key (SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY) are required");
  _service = createClient(url, key, { auth: { persistSession: false } });
  return _service;
}

/**
 * Returns a 401 response unless the request carries a valid Supabase session token
 * (Authorization: Bearer <access_token>). Only admins have accounts on this site.
 */
export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data, error } = await adminSupabase().auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "Session expired, sign in again" }, { status: 401 });
  return null;
}
