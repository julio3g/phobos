'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type * as React from 'react'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions'
import { StatusBadge } from '@/components/status-badge'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/toast'
import { archiveMaterial } from '@/db/actions'
import type { Material } from '@/db/schema'
import type { DataTableFeatures } from '@/lib/data-table-features'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { formatCurrency } from '@/lib/format'
import { archivedOptions, getArchivedIcon } from '@/utils/get-label-and-icons'

async function toggleArchive(material: Material) {
  const archived = !material.archivedAt
  const { error } = await archiveMaterial({ id: material.id, archived })
  toast.add(
    error
      ? { type: 'error', description: error }
      : {
          type: 'success',
          description: archived ? 'Material arquivado' : 'Material restaurado',
        }
  )
}

interface GetMaterialTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Material> | null>
  >
}

export function getMaterialTableColumns({
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
      // id = chave do ?archived= na URL (searchParamsCacheMaterials)
      id: 'archived',
      accessorFn: row => (row.archivedAt ? 'true' : 'false'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Situação" />
      ),
      cell: ({ row }) => (
        <StatusBadge meta={getArchivedIcon(!!row.original.archivedAt)} />
      ),
      enableSorting: false,
      meta: {
        label: 'Situação',
        variant: 'multiSelect',
        options: archivedOptions,
      },
      enableColumnFilter: true,
    },
    {
      id: 'unitCost',
      accessorKey: 'unitCost',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Custo unitário" />
      ),
      cell: ({ row }) =>
        `${formatCurrency(row.original.unitCost, { maximumFractionDigits: 4 })} / ${row.original.unit}`,
      meta: { label: 'Custo unitário' },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          onView={() => setRowAction({ row, variant: 'view' })}
          onUpdate={() => setRowAction({ row, variant: 'update' })}
          onDelete={() => setRowAction({ row, variant: 'delete' })}
        >
          <DropdownMenuItem onClick={() => toggleArchive(row.original)}>
            {row.original.archivedAt ? 'Restaurar' : 'Arquivar'}
          </DropdownMenuItem>
        </DataTableRowActions>
      ),
      size: 48,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
