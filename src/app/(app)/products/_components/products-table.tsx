'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import type { getProducts } from '@/db/queries/products'
import { useDataTable } from '@/hooks/use-data-table'
import { getProductTableColumns } from './products-table-columns'

interface ProductsTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getProducts>>]>
}

export function ProductsTable({ promises }: ProductsTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const columns = React.useMemo(() => getProductTableColumns(), [])

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
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  )
}
