'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type * as React from 'react'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions'
import { StatusBadge } from '@/components/status-badge'
import {
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import type { MemberListItem } from '@/db/queries/users'
import type { DataTableFeatures } from '@/lib/data-table-features'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { formatShortDate } from '@/lib/format'
import { roleOptions } from '@/lib/permissions'
import {
  getActiveIcon,
  getMemberIcon,
  memberRoleOptions,
} from '@/utils/get-label-and-icons'

type AssignableRole = (typeof roleOptions)[number]['value']

interface GetUserTableColumnsProps {
  currentUserId: string
  onRoleChange: (user: MemberListItem, role: AssignableRole) => void
  onToggleActive: (user: MemberListItem) => void
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<MemberListItem> | null>
  >
}

export function getUserTableColumns({
  currentUserId,
  onRoleChange,
  onToggleActive,
  setRowAction,
}: GetUserTableColumnsProps): ColumnDef<DataTableFeatures, MemberListItem>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Nome" />
      ),
      cell: ({ row }) => (
        <span className="block max-w-80 truncate font-medium">
          {row.original.name}
          {row.original.id === currentUserId ? (
            <span className="ml-2 text-muted-foreground text-xs">(você)</span>
          ) : null}
        </span>
      ),
      meta: {
        label: 'Nome',
        placeholder: 'Procurar usuário...',
        variant: 'text',
      },
      enableColumnFilter: true,
    },
    {
      id: 'username',
      accessorKey: 'username',
      header: 'Usuário',
      enableSorting: false,
      meta: { label: 'Usuário' },
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="E-mail" />
      ),
      meta: { label: 'E-mail' },
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Permissão" />
      ),
      cell: ({ row }) => (
        <StatusBadge meta={getMemberIcon(row.original.role)} />
      ),
      enableColumnFilter: true,
      meta: {
        label: 'Permissão',
        variant: 'multiSelect',
        options: memberRoleOptions,
      },
    },
    {
      id: 'active',
      accessorKey: 'active',
      header: 'Situação',
      cell: ({ row }) => (
        <StatusBadge meta={getActiveIcon(row.original.active)} />
      ),
      enableSorting: false,
      meta: { label: 'Situação' },
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
      cell: ({ row }) => {
        const user = row.original
        const isFixed = user.id === currentUserId || user.role === 'owner'

        return (
          <DataTableRowActions
            onUpdate={() => setRowAction({ row, variant: 'update' })}
            onDelete={
              isFixed
                ? undefined
                : () => setRowAction({ row, variant: 'delete' })
            }
          >
            {isFixed ? (
              <DropdownMenuItem disabled>
                {user.role === 'owner'
                  ? 'Permissão do proprietário'
                  : 'Sua permissão'}{' '}
                (fixa)
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Permissão</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={user.role}
                      onValueChange={value =>
                        onRoleChange(user, value as AssignableRole)
                      }
                    >
                      {roleOptions.map(option => (
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
                <DropdownMenuItem onClick={() => onToggleActive(user)}>
                  {user.active ? 'Desativar' : 'Ativar'}
                </DropdownMenuItem>
              </>
            )}
          </DataTableRowActions>
        )
      },
      size: 48,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
