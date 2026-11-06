'use server'

import {
  type AnyColumn,
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
} from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { db } from '../connection'
import { parseListFilter } from '@/lib/filter-params'
import { materials } from '../schema'
import type { GetMaterialsSchema, SortableMaterialColumn } from '../validators'
import { requireSession } from './auth'

const sortColumns = {
  name: materials.name,
  brand: materials.brand,
  variant: materials.variant,
  unitCost: materials.unitCost,
  createdAt: materials.createdAt,
} satisfies Record<SortableMaterialColumn, AnyColumn>

export async function getMaterials(input: GetMaterialsSchema) {
  const { organizationId } = await requireSession()
  try {
    return await unstable_cache(
      async () => {
        const offset = (input.page - 1) * input.perPage

        // sem filtro = só ativos; "Arquivados" = só arquivados; os dois = todos
        const states = parseListFilter(input.archived, ['false', 'true'])
        const showActive = states.length === 0 || states.includes('false')
        const showArchived = states.includes('true')

        const where = and(
          eq(materials.organizationId, organizationId),
          showActive && !showArchived ? isNull(materials.archivedAt) : undefined,
          showArchived && !showActive
            ? isNotNull(materials.archivedAt)
            : undefined,
          input.name ? ilike(materials.name, `%${input.name}%`) : undefined
        )

        const orderBy = [
          ...input.sort.map(item =>
            item.desc ? desc(sortColumns[item.id]) : asc(sortColumns[item.id])
          ),
          asc(materials.id),
        ]

        const { data, total } = await db.transaction(async tx => {
          const data = await tx
            .select()
            .from(materials)
            .where(where)
            .orderBy(...orderBy)
            .limit(input.perPage)
            .offset(offset)

          const total = await tx
            .select({ count: count() })
            .from(materials)
            .where(where)
            .then(res => res[0]?.count ?? 0)

          return { data, total }
        })

        return { data, pageCount: Math.ceil(total / input.perPage) }
      },
      ['materials:list', organizationId, JSON.stringify(input)],
      { revalidate: 1, tags: ['materials'] }
    )()
  } catch (_err) {
    return { data: [], pageCount: 0 }
  }
}

/** Materiais ativos para o seletor da composição de produtos. */
export async function getMaterialOptions() {
  const { organizationId } = await requireSession()
  try {
    return await unstable_cache(
      () =>
        db
          .select({
            id: materials.id,
            name: materials.name,
            brand: materials.brand,
            variant: materials.variant,
            unit: materials.unit,
            unitCost: materials.unitCost,
          })
          .from(materials)
          .where(
            and(
              eq(materials.organizationId, organizationId),
              isNull(materials.archivedAt)
            )
          )
          .orderBy(asc(materials.name)),
      ['materials:options', organizationId],
      { revalidate: 1, tags: ['materials'] }
    )()
  } catch (_err) {
    return []
  }
}
