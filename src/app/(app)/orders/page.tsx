import type { Metadata } from 'next'
import * as React from 'react'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { getOrganization } from '@/db/queries'
import { getAllClients } from '@/db/queries/clients'
import { getMaterialOptions } from '@/db/queries/materials'
import { getOrders } from '@/db/queries/orders'
import { getAllProducts } from '@/db/queries/products'
import { searchParamsCacheOrders } from '@/db/validators'
import type { SearchParams } from '@/types'
import { CreateProductDialog } from '../products/_components/create-product-dialog'
import { CreateOrderDialog } from './_components/create-order-dialog'
import { OrdersTable } from './_components/orders-table'

export const metadata: Metadata = { title: 'Ordens' }

interface OrdersPageProps {
  searchParams: Promise<SearchParams>
}

export default async function OrdersPage(props: OrdersPageProps) {
  const search = searchParamsCacheOrders.parse(await props.searchParams)

  const promises = Promise.all([getOrders(search)])

  const [
    { data: clients },
    { data: allProducts },
    materialOptions,
    organization,
  ] = await Promise.all([
    getAllClients(),
    getAllProducts(),
    getMaterialOptions(),
    getOrganization(),
  ])

  const newProductSlot = (
    <CreateProductDialog
      compact
      materialOptions={materialOptions}
      defaultHourlyRate={organization?.defaultHourlyRate ?? 0}
    />
  )

  const products = allProducts.map(p => ({
    id: p.id,
    name: p.name,
    variant: p.variant,
    salePrice: p.salePrice,
  }))

  return (
    <div className="container mx-auto w-full space-y-6 px-4 md:px-8">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-2xl">Ordens</h2>
        <CreateOrderDialog
          clients={clients}
          products={products}
          newProductSlot={newProductSlot}
        />
      </div>
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={7}
            filterCount={1}
            cellWidths={[
              '6rem',
              '20rem',
              '8rem',
              '8rem',
              '8rem',
              '8rem',
              '3rem',
            ]}
            shrinkZero
          />
        }
      >
        <OrdersTable
          promises={promises}
          clients={clients}
          products={products}
          newProductSlot={newProductSlot}
        />
      </React.Suspense>
    </div>
  )
}
