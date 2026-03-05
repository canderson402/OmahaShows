import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const ADMIN_EMAIL = "canderson1192@gmail.com"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface NotifyRequest {
  type: "scraper_complete" | "user_submission"
  // For scraper_complete:
  scraperSummary?: {
    totalNew: number
    totalChanged: number
    scrapers: Array<{ name: string; newCount: number; changedCount: number }>
  }
  // For user_submission:
  submission?: {
    title: string
    date: string
    venue: string
    submitterEmail?: string
  }
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

    const { type, scraperSummary, submission }: NotifyRequest = await req.json()

    let subject: string
    let html: string

    if (type === "scraper_complete" && scraperSummary) {
      const { totalNew, totalChanged, scrapers } = scraperSummary

      // Don't send email if nothing pending
      if (totalNew === 0 && totalChanged === 0) {
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "No pending items" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      subject = `[Omaha Shows] ${totalNew} new, ${totalChanged} changed events pending`

      const scraperRows = scrapers
        .filter(s => s.newCount > 0 || s.changedCount > 0)
        .map(s => `<tr><td style="padding: 4px 8px;">${s.name}</td><td style="padding: 4px 8px;">${s.newCount}</td><td style="padding: 4px 8px;">${s.changedCount}</td></tr>`)
        .join("")

      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; padding: 16px;">
          <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #111;">OMAHA SHOWS</h1>
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #333;">Scrapers completed with pending items for review.</p>

          <div style="background: #f5f5f5; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <strong style="font-size: 18px; color: #111;">${totalNew} new events</strong><br>
            <strong style="font-size: 18px; color: #111;">${totalChanged} changed events</strong>
          </div>

          ${scraperRows ? `
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
            <thead>
              <tr style="background: #eee;">
                <th style="padding: 4px 8px; text-align: left;">Scraper</th>
                <th style="padding: 4px 8px; text-align: left;">New</th>
                <th style="padding: 4px 8px; text-align: left;">Changed</th>
              </tr>
            </thead>
            <tbody>${scraperRows}</tbody>
          </table>
          ` : ""}

          <a href="https://omahashows.com/admin" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600;">Review Pending Events</a>
        </div>
      `
    } else if (type === "user_submission" && submission) {
      subject = `[Omaha Shows] New submission: ${submission.title}`

      const formattedDate = new Date(submission.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; padding: 16px;">
          <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #111;">OMAHA SHOWS</h1>
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #333;">A new event was submitted for review.</p>

          <div style="background: #f5f5f5; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <strong style="font-size: 16px; color: #111;">${submission.title}</strong><br>
            <span style="font-size: 14px; color: #666;">${submission.venue} · ${formattedDate}</span>
            ${submission.submitterEmail ? `<br><span style="font-size: 13px; color: #888;">From: ${submission.submitterEmail}</span>` : ""}
          </div>

          <a href="https://omahashows.com/admin" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600;">Review Submission</a>
        </div>
      `
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid request type or missing data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Omaha Shows <notifications@omahashows.com>",
        to: ADMIN_EMAIL,
        subject,
        html,
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
    console.error("Error sending notification:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
