import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getOrganization } from '@/db/queries'
import { SettingsForm } from './_components/settings-form'

export const metadata: Metadata = { title: 'Configurações' }

export default async function SettingsPage() {
  const organization = await getOrganization()
  if (!organization) redirect('/auth/sign-in')

  return (
    <div className="container mx-auto w-full max-w-xl space-y-6 px-4 md:px-8">
      <h2 className="font-medium text-2xl">Configurações</h2>
      <SettingsForm
        defaultValues={{
          name: organization.name,
          currency: organization.currency as 'BRL' | 'USD' | 'EUR',
          defaultHourlyRate: organization.defaultHourlyRate,
        }}
      />
    </div>
  )
}
