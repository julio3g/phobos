'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DeleteDialog } from '@/components/delete-dialog'
import { toast } from '@/components/ui/toast'
import { deleteOrders, updateOrderStatus } from '@/db/actions'
import type { getOrders, OrderListItem } from '@/db/queries/orders'
import type { Order } from '@/db/schema'
import { useDataTable } from '@/hooks/use-data-table'
import type { DataTableRowAction } from '@/lib/data-table-types'
import type { ClientOption, ProductOption } from '@/types'
import { getOrderTableColumns } from './orders-table-columns'
import { UpdateOrderDialog } from './update-order-dialog'
import { ViewOrderDialog } from './view-order-dialog'

interface OrdersTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getOrders>>]>
  clients: ClientOption[]
  products: ProductOption[]
  newProductSlot?: React.ReactNode
}

export function OrdersTable({
  promises,
  clients,
  products,
  newProductSlot,
}: OrdersTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<OrderListItem> | null>(null)

  const onStatusChange = React.useCallback(
    async (
      order: OrderListItem,
      change: {
        status?: Order['status']
        paymentStatus?: Order['paymentStatus']
      }
    ) => {
      const { error } = await updateOrderStatus({ ids: [order.id], ...change })
      toast.add(
        error
          ? { type: 'error', description: error }
          : { type: 'success', description: 'Ordem atualizada' }
      )
    },
    []
  )

  const columns = React.useMemo(
    () => getOrderTableColumns({ onStatusChange, setRowAction }),
    [onStatusChange]
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { start: [], end: ['actions'] },
    },
    getRowId: row => row.id,
    shallow: false,
    clearOnDefault: true,
  })

  const order = rowAction?.row.original ?? null
  const close = () => setRowAction(null)

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <ViewOrderDialog
        order={order}
        open={rowAction?.variant === 'view'}
        onOpenChange={close}
      />
      <UpdateOrderDialog
        order={order}
        open={rowAction?.variant === 'update'}
        onOpenChange={close}
        clients={clients}
        products={products}
        newProductSlot={newProductSlot}
      />
      <DeleteDialog
        open={rowAction?.variant === 'delete'}
        onOpenChange={close}
        ids={order ? [order.id] : []}
        noun={{ one: 'ordem', many: 'ordens', feminine: true }}
        onDelete={ids => deleteOrders({ ids })}
      />
    </>
  )
}
