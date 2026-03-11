import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0d0f',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://omahashows.com'),
  title: {
    default: 'Omaha Shows | Live Music in Omaha, NE',
    template: '%s | Omaha Shows',
  },
  description: 'Discover upcoming concerts and live music events in Omaha, Nebraska. Find shows at The Slowdown, Waiting Room, Reverb Lounge, Bourbon Theatre, and more local venues.',
  keywords: ['Omaha concerts', 'Omaha live music', 'Nebraska shows', 'The Slowdown', 'Waiting Room', 'Reverb Lounge', 'Bourbon Theatre', 'live music Omaha'],
  authors: [{ name: 'Omaha Shows' }],
  creator: 'Omaha Shows',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Omaha Shows | Live Music in Omaha, NE',
    description: 'Discover upcoming concerts and live music events in Omaha, Nebraska.',
    type: 'website',
    url: 'https://omahashows.com',
    siteName: 'Omaha Shows',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omaha Shows | Live Music in Omaha, NE',
    description: 'Discover upcoming concerts and live music events in Omaha, Nebraska.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://i.ticketweb.com" />
        <link rel="preconnect" href="https://prod-images.seetickets.us" />
        <link rel="dns-prefetch" href="https://i.ticketweb.com" />
        <link rel="dns-prefetch" href="https://prod-images.seetickets.us" />
      </head>
      <body className="bg-[#0d0d0f]">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2FFB2TG70S"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2FFB2TG70S');
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}
