'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { toast } from '@/components/ui/toast'
import { updateOrderStatus } from '@/db/actions'
import type { getOrders, OrderListItem } from '@/db/queries/orders'
import { useDataTable } from '@/hooks/use-data-table'
import type { DataTableRowAction } from '@/lib/data-table-types'
import {
  type ClientOption,
  type OrderStatus,
  orderStatusLabels,
  type ProductOption,
} from '@/lib/orders'
import { getOrderTableColumns } from './orders-table-columns'
import { UpdateOrderDialog } from './update-order-dialog'
import { ViewOrderDialog } from './view-order-dialog'

interface OrdersTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getOrders>>]>
  clients: ClientOption[]
  products: ProductOption[]
}

export function OrdersTable({ promises, clients, products }: OrdersTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<OrderListItem> | null>(null)

  const onStatusChange = React.useCallback(
    async (order: OrderListItem, status: OrderStatus) => {
      if (order.status === status) return
      const { error } = await updateOrderStatus({ ids: [order.id], status })
      if (error) {
        toast.add({ type: 'error', description: error })
        return
      }
      toast.add({
        type: 'success',
        description: `Status: ${orderStatusLabels[status]}`,
      })
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

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <ViewOrderDialog
        order={order}
        open={rowAction?.variant === 'view'}
        onOpenChange={() => setRowAction(null)}
      />
      <UpdateOrderDialog
        order={order}
        open={rowAction?.variant === 'update'}
        onOpenChange={() => setRowAction(null)}
        clients={clients}
        products={products}
      />
    </>
  )
}
