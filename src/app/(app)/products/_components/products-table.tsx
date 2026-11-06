'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import type { getProducts } from '@/db/queries/products'
import type { Product } from '@/db/schema'
import { useDataTable } from '@/hooks/use-data-table'
import type { DataTableRowAction } from '@/lib/data-table-types'
import type { MaterialOption } from './product-form'
import { getProductTableColumns } from './products-table-columns'
import { UpdateProductDialog } from './update-product-dialog'

interface ProductsTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getProducts>>]>
  materialOptions: MaterialOption[]
}

export function ProductsTable({
  promises,
  materialOptions,
}: ProductsTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Product> | null>(null)

  const columns = React.useMemo(
    () => getProductTableColumns({ setRowAction }),
    []
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
    },
    getRowId: row => row.id,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <UpdateProductDialog
        materialOptions={materialOptions}
        product={rowAction?.row.original ?? null}
        open={rowAction?.variant === 'update'}
        onOpenChange={() => setRowAction(null)}
      />
    </>
  )
}
