import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Omaha Shows | Live Music in Omaha, NE',
  description: 'Discover upcoming concerts and live music events in Omaha, Nebraska. Find shows at The Slowdown, Waiting Room, Reverb Lounge, and more.',
  openGraph: {
    title: 'Omaha Shows | Live Music in Omaha, NE',
    description: 'Discover upcoming concerts and live music events in Omaha, Nebraska.',
    type: 'website',
    url: 'https://omahashows.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omaha Shows | Live Music in Omaha, NE',
    description: 'Discover upcoming concerts and live music events in Omaha, Nebraska.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="bg-[#0d0d0f]">
        {children}
      </body>
    </html>
  )
}
