'use server'

import { redirect } from 'next/navigation'
import { Header } from '@/components/header'
import { isAuthenticated } from '@/lib/auth-cookies'

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const verifyIsAuthenticated = await isAuthenticated()
  if (!verifyIsAuthenticated) redirect('/auth/sign-in')
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 flex-col gap-4 pt-6">{children}</div>
    </main>
  )
}
