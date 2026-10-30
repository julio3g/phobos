import { relations } from 'drizzle-orm'
import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { organizations } from '.'
import { timestamps } from './columns'
import { personTypeEnum } from './enums'
import { orders } from './orders'

export const clients = pgTable(
  'clients',
  {
    id: text('id')
      .$defaultFn(() => generateId())
      .primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    legalName: text('name').notNull(),
    tradeName: text('trade_name'), // PJ geralmente tem nome fantasia
    contactName: text('contact_name'),

    email: text('email'),
    phone: text('phone'),
    personType: personTypeEnum('person_type'),
    cpf: text('cpf'),
    cnpj: text('cnpj'),
    stateRegistration: text('state_registration'),

    street: text('street'),
    neighborhood: text('neighborhood'),
    addressNumber: integer('address_number'),
    complement: text('complement'),
    city: text('city'),
    state: text('state'),
    zipCode: text('zip_code'),
    ...timestamps,
  },
  t => [
    uniqueIndex('clients_cpf_uniq').on(t.cpf),
    uniqueIndex('clients_cnpj_uniq').on(t.cnpj),
    // check(
    //   'clients_person_doc_check',
    //   sql`
    //     (${t.personType} = 'individual' AND ${t.cpf} IS NOT NULL AND ${t.cnpj} IS NULL)
    //     OR
    //     (${t.personType} = 'company' AND ${t.cnpj} IS NOT NULL AND ${t.cpf} IS NULL)
    //   `
    // ),
  ]
)

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  orders: many(orders),
}))

export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
