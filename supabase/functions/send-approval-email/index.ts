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

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
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
          <p>Your show submission has been approved and is now live on Omaha Shows.</p>
          <p><strong>${title}</strong><br>${venue}<br>${formattedDate}</p>
          <p><a href="https://omahashows.com">View on Omaha Shows</a></p>
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
