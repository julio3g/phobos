import type { Metadata } from 'next'
import * as React from 'react'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { getClients } from '@/db/queries/clients'
import { searchParamsCacheClients } from '@/db/validators'
import type { SearchParams } from '@/types'
import { ClientsTable } from './_components/clients-table'
import { CreateClientDialog } from './_components/create-client-dialog'

export const metadata: Metadata = { title: 'Clientes' }

interface ClientsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ClientsPage(props: ClientsPageProps) {
  const search = searchParamsCacheClients.parse(await props.searchParams)

  const promises = Promise.all([getClients(search)])

  return (
    <div className="container mx-auto w-full space-y-6 px-4 md:px-8">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-2xl">Clientes</h2>
        <CreateClientDialog />
      </div>
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={6}
            filterCount={1}
            cellWidths={['20rem', '5rem', '10rem', '10rem', '10rem', '3rem']}
            shrinkZero
          />
        }
      >
        <ClientsTable promises={promises} />
      </React.Suspense>
    </div>
  )
}
