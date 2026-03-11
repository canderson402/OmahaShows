'use client'

import dynamic from 'next/dynamic'

const AdminPage = dynamic(
  () => import('../../src/page-components/AdminPage').then(mod => mod.AdminPage),
  { ssr: false }
)

export default function Admin() {
  return <AdminPage />
}
