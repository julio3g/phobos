'use client'

import type { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import type { Product } from '@/db/schema'
import type { DataTableFeatures } from '@/lib/data-table-features'
import { formatCurrency, formatShortDate } from '@/lib/format'

export function getProductTableColumns(): ColumnDef<
  DataTableFeatures,
  Product
>[] {
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
  ]
}
