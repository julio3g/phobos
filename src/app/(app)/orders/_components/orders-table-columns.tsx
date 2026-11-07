'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type * as React from 'react'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions'
import { StatusBadge } from '@/components/status-badge'
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import type { OrderListItem } from '@/db/queries/orders'
import type { Order } from '@/db/schema'
import type { DataTableFeatures } from '@/lib/data-table-features'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { formatCurrency, formatShortDate } from '@/lib/format'
import {
  formatOrderNumber,
  getOrderStatusIcon,
  getPaymentStatusIcon,
  orderStatusOptions,
  paymentStatusOptions,
} from '@/utils/get-label-and-icons'

interface GetOrderTableColumnsProps {
  onStatusChange: (
    order: OrderListItem,
    change: { status?: Order['status']; paymentStatus?: Order['paymentStatus'] }
  ) => void
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<OrderListItem> | null>
  >
}

export function getOrderTableColumns({
  onStatusChange,
  setRowAction,
}: GetOrderTableColumnsProps): ColumnDef<DataTableFeatures, OrderListItem>[] {
  return [
    {
      id: 'number',
      accessorKey: 'number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Nº" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatOrderNumber(row.original.number)}
        </span>
      ),
      size: 90,
      meta: { label: 'Nº' },
    },
    {
      id: 'client',
      accessorFn: row => row.client.clientName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Cliente" />
      ),
      cell: ({ row }) => (
        <span className="block max-w-80 truncate">
          {row.original.client.clientName}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Cliente',
        placeholder: 'Procurar cliente...',
        variant: 'text',
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ row }) => (
        <StatusBadge meta={getOrderStatusIcon(row.original.status)} />
      ),
      enableColumnFilter: true,
      meta: {
        label: 'Status',
        variant: 'multiSelect',
        options: orderStatusOptions,
      },
    },
    {
      id: 'paymentStatus',
      accessorKey: 'paymentStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Pagamento" />
      ),
      cell: ({ row }) => (
        <StatusBadge meta={getPaymentStatusIcon(row.original.paymentStatus)} />
      ),
      enableColumnFilter: true,
      meta: {
        label: 'Pagamento',
        variant: 'multiSelect',
        options: paymentStatusOptions,
      },
    },
    {
      id: 'total',
      accessorKey: 'total',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Total" />
      ),
      cell: ({ row }) => formatCurrency(row.original.total),
      meta: { label: 'Total' },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Criada em" />
      ),
      cell: ({ row }) => formatShortDate(row.original.createdAt),
      meta: { label: 'Criada em' },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          onView={() => setRowAction({ row, variant: 'view' })}
          onUpdate={() => setRowAction({ row, variant: 'update' })}
          onDelete={() => setRowAction({ row, variant: 'delete' })}
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={row.original.status}
                onValueChange={value =>
                  onStatusChange(row.original, {
                    status: value as Order['status'],
                  })
                }
              >
                {orderStatusOptions.map(option => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Pagamento</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={row.original.paymentStatus}
                onValueChange={value =>
                  onStatusChange(row.original, {
                    paymentStatus: value as Order['paymentStatus'],
                  })
                }
              >
                {paymentStatusOptions.map(option => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DataTableRowActions>
      ),
      size: 48,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
