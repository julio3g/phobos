import { eq, sql } from 'drizzle-orm'
import type { Tx } from '@/db/connection'
import { organizations } from '@/db/schema'
import { takeFirstOrThrow } from '@/db/utils'

export async function nextOrderNumber(tx: Tx, organizationId: string) {
  const row = await tx
    .update(organizations)
    .set({ lastOrderNumber: sql`${organizations.lastOrderNumber} + 1` })
    .where(eq(organizations.id, organizationId))
    .returning({ number: organizations.lastOrderNumber })
    .then(takeFirstOrThrow)
  return row.number
}
