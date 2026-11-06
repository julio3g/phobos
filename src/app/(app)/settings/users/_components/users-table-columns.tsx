'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { CircleCheck, CircleX, Ellipsis } from 'lucide-react'
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { MemberListItem } from '@/db/queries/users'
import type { DataTableFeatures } from '@/lib/data-table-features'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { formatShortDate } from '@/lib/format'
import { userRoleIcons } from '@/lib/icons'
import { type Role, roleLabels, roleOptions } from '@/lib/permissions'

type AssignableRole = (typeof roleOptions)[number]['value']

const roleVariants = {
  owner: 'default',
  admin: 'info',
  member: 'secondary',
} as const satisfies Record<Role, 'default' | 'info' | 'secondary'>

interface GetUserTableColumnsProps {
  currentUserId: string
  onRoleChange: (user: MemberListItem, role: AssignableRole) => void
  onToggleActive: (user: MemberListItem) => void
  onRemove: (user: MemberListItem) => void
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<MemberListItem> | null>
  >
}

export function getUserTableColumns({
  currentUserId,
  onRoleChange,
  onToggleActive,
  onRemove,
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
      cell: ({ row }) => {
        const Icon = userRoleIcons[row.original.role]
        return (
          <Badge
            variant={roleVariants[row.original.role]}
            className="py-1 [&>svg]:size-3.5"
          >
            <Icon aria-hidden />
            {roleLabels[row.original.role]}
          </Badge>
        )
      },
      enableColumnFilter: true,
      meta: {
        label: 'Permissão',
        variant: 'multiSelect',
        options: (Object.keys(roleLabels) as Role[]).map(role => ({
          label: roleLabels[role],
          value: role,
          icon: userRoleIcons[role],
        })),
      },
    },
    {
      id: 'active',
      accessorKey: 'active',
      header: 'Situação',
      cell: ({ row }) =>
        row.original.active ? (
          <Badge variant="success" className="py-1 [&>svg]:size-3.5">
            <CircleCheck aria-hidden />
            Ativo
          </Badge>
        ) : (
          <Badge variant="destructive" className="py-1 [&>svg]:size-3.5">
            <CircleX aria-hidden />
            Inativo
          </Badge>
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
        const isSelf = user.id === currentUserId
        const isOwner = user.role === 'owner'

        return (
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
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => setRowAction({ row, variant: 'update' })}
              >
                Editar
              </DropdownMenuItem>
              {isSelf || isOwner ? (
                <DropdownMenuItem disabled>
                  {isOwner ? 'Permissão do proprietário' : 'Sua permissão'} (fixa)
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onRemove(user)}
                  >
                    Remover
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 48,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
