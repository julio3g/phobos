'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Ellipsis } from 'lucide-react'
import type * as React from 'react'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { OrderListItem } from '@/db/queries/orders'
import type { DataTableFeatures } from '@/lib/data-table-features'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { formatCurrency, formatShortDate } from '@/lib/format'
import {
  formatOrderNumber,
  orderStatusLabels,
  orderStatusVariants,
  paymentStatusLabels,
  paymentStatusVariants,
} from '@/lib/orders'

interface GetOrderTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<OrderListItem> | null>
  >
}

export function getOrderTableColumns({
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
      // id = chave do ?client= na URL (searchParamsCacheOrders)
      id: 'client',
      accessorFn: row => row.clientName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Cliente" />
      ),
      cell: ({ row }) => (
        <span className="block max-w-80 truncate">
          {row.original.clientName}
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
        <Badge variant={orderStatusVariants[row.original.status]}>
          {orderStatusLabels[row.original.status]}
        </Badge>
      ),
      meta: { label: 'Status' },
    },
    {
      id: 'paymentStatus',
      accessorKey: 'paymentStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Pagamento" />
      ),
      cell: ({ row }) => (
        <Badge variant={paymentStatusVariants[row.original.paymentStatus]}>
          {paymentStatusLabels[row.original.paymentStatus]}
        </Badge>
      ),
      meta: { label: 'Pagamento' },
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
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label="Abrir menu"
                variant="ghost"
                className="flex size-8 p-0"
              />
            }
          >
            <Ellipsis className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => setRowAction({ row, variant: 'view' })}
            >
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setRowAction({ row, variant: 'update' })}
            >
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 48,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
