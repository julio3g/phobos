'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DeleteDialog } from '@/components/delete-dialog'
import { deleteClients } from '@/db/actions'
import type { getClients } from '@/db/queries/clients'
import type { Client } from '@/db/schema'
import { useDataTable } from '@/hooks/use-data-table'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { getClientTableColumns } from './clients-table-columns'
import { UpdateClientDialog } from './update-client-dialog'
import { ViewClientDialog } from './view-client-dialog'

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

  const client = rowAction?.row.original ?? null
  const close = () => setRowAction(null)

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <ViewClientDialog
        client={client}
        open={rowAction?.variant === 'view'}
        onOpenChange={close}
      />
      <UpdateClientDialog
        client={client}
        open={rowAction?.variant === 'update'}
        onOpenChange={close}
      />
      <DeleteDialog
        open={rowAction?.variant === 'delete'}
        onOpenChange={close}
        ids={client ? [client.id] : []}
        noun={{ one: 'cliente', many: 'clientes' }}
        onDelete={ids => deleteClients({ ids })}
      />
    </>
  )
}
