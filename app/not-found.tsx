import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-texture">
      <div className="max-w-4xl mx-auto">
        <div className="content-container md:rounded-2xl p-6 min-h-screen md:min-h-0 md:mt-8 flex flex-col items-center justify-center">
          <div className="text-center py-12">
            <h1 className="text-6xl font-bold text-gray-600 mb-4">404</h1>
            <p className="text-xl text-gray-400 mb-2">Page not found</p>
            <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium rounded-lg hover:from-amber-400 hover:to-rose-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Shows
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
