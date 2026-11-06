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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { OrderListItem } from '@/db/queries/orders'
import type { DataTableFeatures } from '@/lib/data-table-features'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { orderStatusIcons, paymentStatusIcons } from '@/lib/icons'
import {
  formatOrderNumber,
  type OrderStatus,
  type PaymentStatus,
  orderStatusLabels,
  orderStatusOptions,
  orderStatusVariants,
  paymentStatusLabels,
  paymentStatusOptions,
  paymentStatusVariants,
} from '@/lib/orders'

interface GetOrderTableColumnsProps {
  onStatusChange: (order: OrderListItem, status: OrderStatus) => void
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
      cell: ({ row }) => {
        const Icon = orderStatusIcons[row.original.status]
        return (
          <Badge
            variant={orderStatusVariants[row.original.status]}
            className="py-1 [&>svg]:size-3.5"
          >
            <Icon aria-hidden />
            {orderStatusLabels[row.original.status]}
          </Badge>
        )
      },
      enableColumnFilter: true,
      meta: {
        label: 'Status',
        variant: 'multiSelect',
        options: orderStatusOptions.map(o => ({
          ...o,
          icon: orderStatusIcons[o.value as OrderStatus],
        })),
      },
    },
    {
      id: 'paymentStatus',
      accessorKey: 'paymentStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Pagamento" />
      ),
      cell: ({ row }) => {
        const Icon = paymentStatusIcons[row.original.paymentStatus]
        return (
          <Badge
            variant={paymentStatusVariants[row.original.paymentStatus]}
            className="py-1 [&>svg]:size-3.5"
          >
            <Icon aria-hidden />
            {paymentStatusLabels[row.original.paymentStatus]}
          </Badge>
        )
      },
      enableColumnFilter: true,
      meta: {
        label: 'Pagamento',
        variant: 'multiSelect',
        options: paymentStatusOptions.map(o => ({
          ...o,
          icon: paymentStatusIcons[o.value as PaymentStatus],
        })),
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={row.original.status}
                  onValueChange={value =>
                    onStatusChange(row.original, value as OrderStatus)
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 48,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
