import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'
import { getSortingStateParser } from '@/lib/data-table-parsers'
import { z } from '@/lib/z'
import { orders } from '../schema'
import { orderStatusEnum, paymentStatusEnum } from '../schema/enums'

// colunas permitidas em ?sort= (ids de coluna da tabela)
export const sortableOrderColumns = [
  'number',
  'status',
  'paymentStatus',
  'total',
  'createdAt',
] as const

export type SortableOrderColumn = (typeof sortableOrderColumns)[number]

export const searchParamsCacheOrders = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  client: parseAsString.withDefault(''),
  status: parseAsArrayOf(
    parseAsStringLiteral(orders.status.enumValues)
  ).withDefault([]),
  paymentStatus: parseAsArrayOf(
    parseAsStringLiteral(orders.paymentStatus.enumValues)
  ).withDefault([]),
  sort: getSortingStateParser<SortableOrderColumn>(
    sortableOrderColumns
  ).withDefault([{ id: 'createdAt', desc: true }]),
})

export type GetOrdersSchema = Awaited<
  ReturnType<typeof searchParamsCacheOrders.parse>
>

// preço, custo e totais NÃO vêm do client: a action calcula tudo no servidor
const orderItemSchema = z.object({
  productId: z.nanoid({ length: 12, error: 'Produto é obrigatório' }),
  quantity: z.coerce
    .number<number>()
    .positive({ error: 'Quantidade deve ser maior que zero' }),
})

const orderFields = {
  clientId: z.nanoid({ length: 12, error: 'Cliente é obrigatório' }),
  paymentStatus: z.enum(paymentStatusEnum.enumValues).default('pending'),
  discount: z.coerce.number<number>().nonnegative().default(0),
  shipping: z.coerce.number<number>().nonnegative().default(0),
  notes: z.string().trim().max(150).optional(),
  orderItems: z
    .array(orderItemSchema)
    .min(1, { error: 'Adicione ao menos um item' }),
}

export const createOrderSchema = z.object(orderFields)

export const updateOrderSchema = z.object({
  ...orderFields,
  status: z.enum(orderStatusEnum.enumValues).default('draft'),
})

export type CreateOrderInput = z.input<typeof createOrderSchema>

export type CreateOrderSchema = z.infer<typeof createOrderSchema>

export type UpdateOrderInput = z.input<typeof updateOrderSchema>

export type UpdateOrderSchema = z.infer<typeof updateOrderSchema>
