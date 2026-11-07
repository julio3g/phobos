'use server'

import { and, eq, inArray } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { connection } from 'next/server'
import { nextOrderNumber } from '@/lib/generate-number'
import { getErrorMessage } from '@/lib/handle-error'
import { round2 } from '@/lib/number'
import { db } from '../connection'
import { requireSession } from '../queries'
import { type Order, orderItems, orders } from '../schema'
import { takeFirstOrThrow } from '../utils'
import type { CreateOrderSchema, UpdateOrderSchema } from '../validators'

function revalidateOrdersCache() {
  revalidateTag('orders', { expire: 0 })
  revalidateTag('orders-total', { expire: 0 })
}

export async function createOrder(input: CreateOrderSchema) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem criar serviços')

    const client = await db.query.clients.findFirst({
      where: (fields, { and, eq }) =>
        and(
          eq(fields.id, input.clientId),
          eq(fields.organizationId, organizationId)
        ),
    })
    if (!client) throw new Error('Cliente não encontrado!')

    const productIds = [...new Set(input.orderItems.map(i => i.productId))]

    const products = await db.query.products.findMany({
      where: (fields, { and, eq, inArray }) =>
        and(
          inArray(fields.id, productIds),
          eq(fields.organizationId, organizationId)
        ),
    })
    const productById = new Map(products.map(p => [p.id, p]))

    // preço/custo vêm do produto no servidor; nunca confiar nos valores do client
    const items = input.orderItems.map(item => {
      const product = productById.get(item.productId)
      if (!product)
        throw new Error(`Produto ${item.productId} não foi encontrado!`)

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        unitCost: product.totalCost,
        total: round2(item.quantity * product.salePrice),
      }
    })

    const subtotal = round2(items.reduce((sum, i) => sum + i.total, 0))
    const costTotal = round2(
      items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)
    )
    if (input.discount > subtotal)
      throw new Error('Desconto maior que subtotal')

    const order = await db.transaction(async tx => {
      const number = await nextOrderNumber(tx, organizationId)

      const order = await tx
        .insert(orders)
        .values({
          organizationId,
          number,
          clientId: input.clientId,
          paymentStatus: input.paymentStatus,
          subtotal,
          discount: input.discount,
          shipping: input.shipping,
          costTotal,
          notes: input.notes,
        })
        .returning()
        .then(takeFirstOrThrow)

      await tx
        .insert(orderItems)
        .values(items.map(item => ({ ...item, orderId: order.id })))

      return order
    })

    revalidateOrdersCache()

    return { data: order, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function updateOrder(input: UpdateOrderSchema & { id: string }) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem editar ordens')

    const order = await db.query.orders.findFirst({
      where: (fields, { and, eq }) =>
        and(eq(fields.id, input.id), eq(fields.organizationId, organizationId)),
      with: { orderItems: true },
    })
    if (!order) throw new Error('Ordem não encontrada!')

    const client = await db.query.clients.findFirst({
      where: (fields, { and, eq }) =>
        and(
          eq(fields.id, input.clientId),
          eq(fields.organizationId, organizationId)
        ),
    })
    if (!client) throw new Error('Cliente não encontrado!')

    const productIds = [...new Set(input.orderItems.map(i => i.productId))]
    const products = await db.query.products.findMany({
      where: (fields, { and, eq, inArray }) =>
        and(
          inArray(fields.id, productIds),
          eq(fields.organizationId, organizationId)
        ),
    })
    const productById = new Map(products.map(p => [p.id, p]))
    const previousByProduct = new Map(
      order.orderItems.map(i => [i.productId, i])
    )

    // item já existente mantém o preço/custo gravado na criação;
    // só produto novo na ordem usa o preço atual do cadastro
    const items = input.orderItems.map(item => {
      const product = productById.get(item.productId)
      if (!product)
        throw new Error(`Produto ${item.productId} não foi encontrado!`)

      const previous = previousByProduct.get(item.productId)
      const unitPrice = previous?.unitPrice ?? product.salePrice
      const unitCost = previous?.unitCost ?? product.totalCost

      return {
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        unitCost,
        total: round2(item.quantity * unitPrice),
      }
    })

    const subtotal = round2(items.reduce((sum, i) => sum + i.total, 0))
    const costTotal = round2(
      items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)
    )
    if (input.discount > subtotal)
      throw new Error('Desconto maior que subtotal')

    await db.transaction(async tx => {
      await tx.delete(orderItems).where(eq(orderItems.orderId, order.id))
      await tx.insert(orderItems).values(items)

      await tx
        .update(orders)
        .set({
          clientId: input.clientId,
          status: input.status,
          paymentStatus: input.paymentStatus,
          subtotal,
          discount: input.discount,
          shipping: input.shipping,
          costTotal,
          notes: input.notes,
        })
        .where(
          and(
            eq(orders.id, order.id),
            eq(orders.organizationId, organizationId)
          )
        )
    })

    revalidateOrdersCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

/** Muda status e/ou pagamento de várias ordens de uma vez. */
export async function updateOrderStatus(input: {
  ids: string[]
  status?: Order['status']
  paymentStatus?: Order['paymentStatus']
}) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem alterar o status')

    await db
      .update(orders)
      .set({
        ...(input.status && { status: input.status }),
        ...(input.paymentStatus && { paymentStatus: input.paymentStatus }),
      })
      .where(
        and(
          inArray(orders.id, input.ids),
          eq(orders.organizationId, organizationId)
        )
      )

    revalidateOrdersCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function deleteOrders(input: { ids: string[] }) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem excluir ordens')

    await db
      .delete(orders)
      .where(
        and(
          inArray(orders.id, input.ids),
          eq(orders.organizationId, organizationId)
        )
      )

    revalidateOrdersCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}
