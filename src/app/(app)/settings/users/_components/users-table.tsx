'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { toast } from '@/components/ui/toast'
import { removeMember, setUserActive, updateMemberRole } from '@/db/actions'
import type { getMembers, MemberListItem } from '@/db/queries/users'
import { useDataTable } from '@/hooks/use-data-table'
import type { DataTableRowAction } from '@/lib/data-table-types'
import { getUserTableColumns } from './users-table-columns'
import { UpdateUserDialog } from './update-user-dialog'

interface UsersTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getMembers>>]>
  currentUserId: string
}

export function UsersTable({ promises, currentUserId }: UsersTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<MemberListItem> | null>(null)

  const onRoleChange = React.useCallback(
    async (user: MemberListItem, role: 'admin' | 'member') => {
      if (user.role === role) return
      const { error } = await updateMemberRole({ id: user.id, role })
      if (error) {
        toast.add({ type: 'error', description: error })
        return
      }
      toast.add({ type: 'success', description: 'Permissão atualizada' })
    },
    []
  )

  const onToggleActive = React.useCallback(async (user: MemberListItem) => {
    const active = !user.active
    const { error } = await setUserActive({ id: user.id, active })
    if (error) {
      toast.add({ type: 'error', description: error })
      return
    }
    toast.add({
      type: 'success',
      description: active ? 'Usuário ativado' : 'Usuário desativado',
    })
  }, [])

  const onRemove = React.useCallback(async (user: MemberListItem) => {
    if (!window.confirm(`Remover ${user.name} da empresa?`)) return
    const { error } = await removeMember({ id: user.id })
    if (error) {
      toast.add({ type: 'error', description: error })
      return
    }
    toast.add({ type: 'success', description: 'Usuário removido' })
  }, [])

  const columns = React.useMemo(
    () =>
      getUserTableColumns({
        currentUserId,
        onRoleChange,
        onToggleActive,
        onRemove,
        setRowAction,
      }),
    [currentUserId, onRoleChange, onToggleActive, onRemove]
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'name', desc: false }],
      columnPinning: { start: [], end: ['actions'] },
    },
    getRowId: row => row.id,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <UpdateUserDialog
        user={rowAction?.row.original ?? null}
        currentUserId={currentUserId}
        open={rowAction?.variant === 'update'}
        onOpenChange={() => setRowAction(null)}
      />
    </>
  )
}
