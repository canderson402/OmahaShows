"use client";
import { createClient } from "./supabase-browser";

/** fetch() for /api/admin/* routes: attaches the signed-in admin's session token. */
export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await createClient().auth.getSession();
  const headers = new Headers(init.headers);
  if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  return fetch(input, { ...init, headers });
}
