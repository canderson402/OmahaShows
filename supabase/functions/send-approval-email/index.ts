import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface EmailRequest {
  title: string
  date: string
  venue: string
  submitterEmail: string
  accessToken: string  // User's access token for verification
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured")
    }

    const { title, date, venue, submitterEmail, accessToken }: EmailRequest = await req.json()

    // Verify the user is authenticated using the token from body
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing access token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.error("Auth error:", authError)
      return new Response(
        JSON.stringify({ error: "Invalid or expired token", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!submitterEmail) {
      return new Response(
        JSON.stringify({ error: "No email provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Omaha Shows <notifications@omahashows.com>",
        reply_to: "canderson1192@gmail.com",
        to: submitterEmail,
        subject: "Your show has been approved!",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; padding: 16px;">
            <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #111;">OMAHA SHOWS</h1>
            <p style="margin: 0 0 16px 0; font-size: 15px; color: #333;">Your show has been approved and is now live.</p>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <strong style="font-size: 16px; color: #111;">${title}</strong><br>
              <span style="font-size: 14px; color: #666;">${venue} · ${formattedDate}</span>
            </div>
            <a href="https://omahashows.com" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600;">View on Omaha Shows</a>
            <p style="margin: 20px 0 0 0; font-size: 13px; color: #666;">Thanks for contributing to the Omaha music scene!</p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const data = await response.json()
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
