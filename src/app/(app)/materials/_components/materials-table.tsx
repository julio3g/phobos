'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { toast } from '@/components/ui/toast'
import { archiveMaterial } from '@/db/actions'
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

  const onToggleArchive = React.useCallback(async (material: Material) => {
    const archived = !material.archivedAt
    const { error } = await archiveMaterial({ id: material.id, archived })
    if (error) {
      toast.add({ type: 'error', description: error })
      return
    }
    toast.add({
      type: 'success',
      description: archived ? 'Material arquivado' : 'Material restaurado',
    })
  }, [])

  const columns = React.useMemo(
    () => getMaterialTableColumns({ setRowAction, onToggleArchive }),
    [onToggleArchive]
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
