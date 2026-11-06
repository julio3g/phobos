import { redirect } from 'next/navigation'
import { requireSession } from '@/db/queries/auth'
import { SidebarMenu } from './sidebar-menu'

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isAdminUser } = await requireSession()
  if (!isAdminUser) redirect('/')

  return (
    <div className="container mx-auto w-full px-4 md:px-8">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[12rem_1fr]">
        <SidebarMenu />
        <div className="min-w-0 rounded-lg border p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
