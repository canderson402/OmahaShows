'use client'

import dynamic from 'next/dynamic'

const SubmissionPage = dynamic(
  () => import('../../src/page-components/SubmissionPage').then(mod => mod.SubmissionPage),
  { ssr: false }
)

export default function Submission() {
  return <SubmissionPage />
}
