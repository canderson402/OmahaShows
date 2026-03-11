/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Only use App Router (ignore src/pages which is just component storage)
  pageExtensions: ['tsx', 'ts'],
}

export default nextConfig
