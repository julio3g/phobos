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
import type { Client } from '@/db/schema'
import type { DataTableFeatures } from '@/lib/data-table-features'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { formatCnpj, formatCpf, formatPhone } from '@/lib/format'

interface GetClientTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Client> | null>
  >
}

export function getClientTableColumns({
  setRowAction,
}: GetClientTableColumnsProps): ColumnDef<DataTableFeatures, Client>[] {
  return [
    {
      // id = chave do ?legalName= na URL (searchParamsCacheClients)
      id: 'legalName',
      accessorKey: 'legalName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Nome" />
      ),
      cell: ({ row }) => (
        <div className="max-w-80">
          <p className="truncate font-medium">{row.original.legalName}</p>
          {row.original.tradeName ? (
            <p className="truncate text-muted-foreground text-xs">
              {row.original.tradeName}
            </p>
          ) : null}
        </div>
      ),
      enableColumnFilter: true,
      meta: {
        label: 'Nome',
        placeholder: 'Procurar cliente...',
        variant: 'text',
      },
    },
    {
      id: 'personType',
      accessorKey: 'personType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Tipo" />
      ),
      cell: ({ row }) =>
        row.original.personType ? (
          <Badge variant="outline">
            {row.original.personType === 'company' ? 'PJ' : 'PF'}
          </Badge>
        ) : (
          '—'
        ),
      meta: { label: 'Tipo' },
    },
    {
      id: 'document',
      accessorFn: row =>
        row.cnpj ? formatCnpj(row.cnpj) : row.cpf ? formatCpf(row.cpf) : '—',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Documento" />
      ),
      enableSorting: false,
      meta: { label: 'Documento' },
    },
    {
      id: 'city',
      accessorFn: row =>
        row.city ? `${row.city}${row.state ? `/${row.state}` : ''}` : '—',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Cidade" />
      ),
      meta: { label: 'Cidade' },
    },
    {
      id: 'phone',
      accessorFn: row => (row.phone ? formatPhone(row.phone) : '—'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Telefone" />
      ),
      enableSorting: false,
      meta: { label: 'Telefone' },
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
