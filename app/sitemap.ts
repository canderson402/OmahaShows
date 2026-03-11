import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getLocalDateString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = getLocalDateString()

  // Fetch all upcoming approved events
  const { data: events } = await supabase
    .from('events')
    .select('id, date')
    .gte('date', today)
    .eq('status', 'approved')
    .order('date', { ascending: true })

  const baseUrl = 'https://omahashows.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Dynamic show pages
  const showPages: MetadataRoute.Sitemap = (events || []).map((event) => ({
    url: `${baseUrl}/show/${event.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...showPages]
}
