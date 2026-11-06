'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import type { getMaterials } from '@/db/queries/materials'
import type { Material } from '@/db/schema'
import { useDataTable } from '@/hooks/use-data-table'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { getMaterialTableColumns } from './materials-table-columns'
import { UpdateMaterialDialog } from './update-material-dialog'

interface MaterialsTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getMaterials>>]>
}

export function MaterialsTable({ promises }: MaterialsTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Material> | null>(null)

  const columns = React.useMemo(
    () => getMaterialTableColumns({ setRowAction }),
    []
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'name', desc: false }],
      columnPinning: { start: [], end: ['actions'] },
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
      <UpdateMaterialDialog
        material={rowAction?.row.original ?? null}
        open={rowAction?.variant === 'update'}
        onOpenChange={() => setRowAction(null)}
      />
    </>
  )
}
