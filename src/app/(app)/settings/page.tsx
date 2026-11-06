import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getOrganization } from '@/db/queries'
import { SettingsForm } from './_components/settings-form'

export const metadata: Metadata = { title: 'Configurações' }

export default async function SettingsPage() {
  const organization = await getOrganization()
  if (!organization) redirect('/auth/sign-in')

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="font-medium text-2xl">Configurações</h2>
      <SettingsForm
        defaultValues={{
          name: organization.name,
          defaultHourlyRate: organization.defaultHourlyRate,
        }}
      />
    </div>
  )
}
