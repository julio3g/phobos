'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DeleteDialog } from '@/components/delete-dialog'
import { deleteProducts } from '@/db/actions'
import type { getProducts, ProductListItem } from '@/db/queries/products'
import { useDataTable } from '@/hooks/use-data-table'
import type { DataTableRowAction } from '@/lib/data-table-types'
import type { MaterialOption } from './product-form'
import { getProductTableColumns } from './products-table-columns'
import { UpdateProductDialog } from './update-product-dialog'
import { ViewProductDialog } from './view-product-dialog'

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
    React.useState<DataTableRowAction<ProductListItem> | null>(null)

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

  const product = rowAction?.row.original ?? null
  const close = () => setRowAction(null)

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <ViewProductDialog
        product={product}
        materialOptions={materialOptions}
        open={rowAction?.variant === 'view'}
        onOpenChange={close}
      />
      <UpdateProductDialog
        materialOptions={materialOptions}
        product={product}
        open={rowAction?.variant === 'update'}
        onOpenChange={close}
      />
      <DeleteDialog
        open={rowAction?.variant === 'delete'}
        onOpenChange={close}
        ids={product ? [product.id] : []}
        noun={{ one: 'produto', many: 'produtos' }}
        onDelete={ids => deleteProducts({ ids })}
      />
    </>
  )
}
