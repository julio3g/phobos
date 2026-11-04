import { pgEnum } from 'drizzle-orm/pg-core'

const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member'])

const personTypeEnum = pgEnum('person_type', ['individual', 'company'])

const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'confirmed',
  'in_production',
  'completed',
  'cancelled',
])

// percent = markup sobre o custo | margin = margem sobre o preço de venda | fixed = R$ sobre o custo
const marginTypeEnum = pgEnum('margin_type', ['percent', 'margin', 'fixed'])

const unitEnum = pgEnum('unit', ['un', 'm', 'g', 'kg', 'ml', 'pair'])

const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'partial',
  'paid',
  'refunded',
])

export {
  userRoleEnum,
  orderStatusEnum,
  personTypeEnum,
  unitEnum,
  marginTypeEnum,
  paymentStatusEnum,
}
