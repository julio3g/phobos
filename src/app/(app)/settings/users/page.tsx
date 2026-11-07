import type { Metadata } from 'next'
import * as React from 'react'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { requireSession } from '@/db/queries/auth'
import { getMembers } from '@/db/queries/users'
import { searchParamsCacheUsers } from '@/db/validators/users'
import type { SearchParams } from '@/types'
import { CreateUserDialog } from './_components/create-user-dialog'
import { UsersTable } from './_components/users-table'

export const metadata: Metadata = { title: 'Usuários' }

interface UsersPageProps {
  searchParams: Promise<SearchParams>
}

export default async function UsersPage(props: UsersPageProps) {
  const search = searchParamsCacheUsers.parse(await props.searchParams)
  const { userId } = await requireSession()

  const promises = Promise.all([getMembers(search)])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-2xl">Usuários</h2>
        <CreateUserDialog />
      </div>
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={6}
            filterCount={2}
            cellWidths={['14rem', '10rem', '14rem', '10rem', '8rem', '3rem']}
            shrinkZero
          />
        }
      >
        <UsersTable promises={promises} currentUserId={userId} />
      </React.Suspense>
    </div>
  )
}
