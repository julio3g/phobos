import type { Metadata } from 'next'
import * as React from 'react'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { getOrganization } from '@/db/queries'
import { getMaterialOptions } from '@/db/queries/materials'
import { getProducts } from '@/db/queries/products'
import { searchParamsCacheProducts } from '@/db/validators'
import type { SearchParams } from '@/types'
import { CreateProductDialog } from './_components/create-product-dialog'
import { ProductsTable } from './_components/products-table'

export const metadata: Metadata = { title: 'Produtos' }

interface ProductsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductsPage(props: ProductsPageProps) {
  const search = searchParamsCacheProducts.parse(await props.searchParams)

  const promises = Promise.all([getProducts(search)])
  const [materialOptions, organization] = await Promise.all([
    getMaterialOptions(),
    getOrganization(),
  ])

  return (
    <div className="container mx-auto w-full space-y-6 px-4 md:px-8">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-2xl">Produtos</h2>
        <CreateProductDialog
          materialOptions={materialOptions}
          defaultHourlyRate={organization?.defaultHourlyRate ?? 0}
        />
      </div>
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={5}
            filterCount={1}
            cellWidths={['20rem', '10rem', '8rem', '8rem', '8rem']}
            shrinkZero
          />
        }
      >
        <ProductsTable
          promises={promises}
          materialOptions={materialOptions}
        />
      </React.Suspense>
    </div>
  )
}
