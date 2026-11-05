import type { Metadata } from 'next'
import * as React from 'react'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { getMaterials } from '@/db/queries/materials'
import { searchParamsCacheMaterials } from '@/db/validators'
import type { SearchParams } from '@/types'
import { CreateMaterialDialog } from './_components/create-material-dialog'
import { MaterialsTable } from './_components/materials-table'

export const metadata: Metadata = { title: 'Materiais' }

interface MaterialsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function MaterialsPage(props: MaterialsPageProps) {
  const search = searchParamsCacheMaterials.parse(await props.searchParams)

  const promises = Promise.all([getMaterials(search)])

  return (
    <div className="container mx-auto w-full space-y-6 px-4 md:px-8">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-2xl">Materiais</h2>
        <CreateMaterialDialog />
      </div>
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={6}
            filterCount={1}
            cellWidths={['20rem', '8rem', '8rem', '10rem', '10rem', '3rem']}
            shrinkZero
          />
        }
      >
        <MaterialsTable promises={promises} />
      </React.Suspense>
    </div>
  )
}
