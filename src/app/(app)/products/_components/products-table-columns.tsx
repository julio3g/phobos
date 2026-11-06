'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Ellipsis } from 'lucide-react'
import Link from 'next/link'
import type * as React from 'react'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Product } from '@/db/schema'
import type { DataTableFeatures } from '@/lib/data-table-features'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { formatCurrency, formatShortDate } from '@/lib/format'

interface GetProductTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Product> | null>
  >
}

export function getProductTableColumns({
  setRowAction,
}: GetProductTableColumnsProps): ColumnDef<DataTableFeatures, Product>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Nome" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/products/${row.original.id}`}
          className="block max-w-125 truncate font-medium underline-offset-4 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
      meta: {
        label: 'Nome',
        placeholder: 'Procurar produto...',
        variant: 'text',
      },
      enableColumnFilter: true,
    },
    {
      id: 'variant',
      accessorKey: 'variant',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Variação" />
      ),
      cell: ({ row }) => row.original.variant ?? '—',
      meta: { label: 'Variação' },
    },
    {
      id: 'totalCost',
      accessorKey: 'totalCost',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Custo" />
      ),
      cell: ({ row }) => formatCurrency(row.original.totalCost),
      meta: { label: 'Custo' },
    },
    {
      id: 'salePrice',
      accessorKey: 'salePrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Preço de venda" />
      ),
      cell: ({ row }) => formatCurrency(row.original.salePrice),
      meta: { label: 'Preço de venda' },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Criado em" />
      ),
      cell: ({ row }) => formatShortDate(row.original.createdAt),
      meta: { label: 'Criado em' },
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
