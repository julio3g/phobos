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
import type { Material } from '@/db/schema'
import type { DataTableFeatures } from '@/lib/data-table-features'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { formatCurrency } from '@/lib/format'

interface GetMaterialTableColumnsProps {
  onToggleArchive: (material: Material) => void
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Material> | null>
  >
}

export function getMaterialTableColumns({
  onToggleArchive,
  setRowAction,
}: GetMaterialTableColumnsProps): ColumnDef<DataTableFeatures, Material>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Nome" />
      ),
      cell: ({ row }) => (
        <span className="flex max-w-125 items-center gap-2 truncate font-medium">
          {row.original.name}
          {row.original.archivedAt ? (
            <Badge variant="secondary">Arquivado</Badge>
          ) : null}
        </span>
      ),
      meta: {
        label: 'Nome',
        placeholder: 'Procurar material...',
        variant: 'text',
      },
      enableColumnFilter: true,
    },
    {
      id: 'brand',
      accessorKey: 'brand',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Marca" />
      ),
      cell: ({ row }) => row.original.brand ?? '—',
      meta: { label: 'Marca' },
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
      id: 'package',
      header: 'Embalagem',
      cell: ({ row }) =>
        `${formatCurrency(row.original.packagePrice)} / ${row.original.packageQuantity} ${row.original.unit}`,
      enableSorting: false,
      meta: { label: 'Embalagem' },
    },
    {
      id: 'unitCost',
      accessorKey: 'unitCost',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Custo unitário" />
      ),
      cell: ({ row }) =>
        `${row.original.unitCost.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 4,
        })} / ${row.original.unit}`,
      meta: { label: 'Custo unitário' },
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
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => setRowAction({ row, variant: 'update' })}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleArchive(row.original)}>
              {row.original.archivedAt ? 'Restaurar' : 'Arquivar'}
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
