'use client'

import dynamic from 'next/dynamic'

const LoginPage = dynamic(
  () => import('../../src/page-components/LoginPage').then(mod => mod.LoginPage),
  { ssr: false }
)

export default function Login() {
  return <LoginPage />
}
