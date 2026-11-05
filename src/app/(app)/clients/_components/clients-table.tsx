'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import type { getClients } from '@/db/queries/clients'
import type { Client } from '@/db/schema'
import { useDataTable } from '@/hooks/use-data-table'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { getClientTableColumns } from './clients-table-columns'
import { UpdateClientDialog } from './update-client-dialog'

interface ClientsTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getClients>>]>
}

export function ClientsTable({ promises }: ClientsTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Client> | null>(null)

  const columns = React.useMemo(
    () => getClientTableColumns({ setRowAction }),
    []
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'legalName', desc: false }],
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
      <UpdateClientDialog
        client={rowAction?.row.original ?? null}
        open={rowAction?.variant === 'update'}
        onOpenChange={() => setRowAction(null)}
      />
    </>
  )
}
