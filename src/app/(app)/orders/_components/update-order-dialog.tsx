'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import {
  Body,
  Close,
  Content,
  Description,
  DialogDrawer,
  Footer,
  Header,
  Title,
} from '@/components/dialog-drawer'
import { Button } from '@/components/ui/button'
import { updateOrder } from '@/db/actions'
import { getOrder } from '@/db/queries/orders'
import type { OrderListItem } from '@/db/queries/orders'
import { updateOrderSchema } from '@/db/validators'
import {
  type ClientOption,
  formatOrderNumber,
  type ProductOption,
} from '@/lib/orders'
import {
  OrderForm,
  type OrderFormOutput,
  type OrderFormValues,
} from './order-form'

interface UpdateOrderDialogProps {
  order: OrderListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: ClientOption[]
  products: ProductOption[]
}

export function UpdateOrderDialog({
  order,
  open,
  onOpenChange,
  clients,
  products,
}: UpdateOrderDialogProps) {
  const [isPending, startTransition] = React.useTransition()
  const [isLoading, startLoading] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [snapshotPrices, setSnapshotPrices] = React.useState<
    Record<string, number>
  >({})

  const form = useForm<OrderFormValues, unknown, OrderFormOutput>({
    resolver: zodResolver(updateOrderSchema),
  })

  const orderId = order?.id

  // carrega os itens da ordem sempre que o dialog abre
  React.useEffect(() => {
    if (!(open && orderId)) return

    setServerError(null)
    startLoading(async () => {
      const full = await getOrder(orderId)
      if (!full) {
        setServerError('Ordem não encontrada.')
        return
      }

      setSnapshotPrices(
        Object.fromEntries(
          full.orderItems.map(item => [item.productId, item.unitPrice])
        )
      )
      form.reset({
        clientId: full.clientId,
        status: full.status,
        paymentStatus: full.paymentStatus,
        discount: full.discount,
        shipping: full.shipping,
        notes: full.notes ?? undefined,
        orderItems: full.orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })
    })
  }, [open, orderId, form])

  function onSubmit(input: OrderFormOutput) {
    if (!orderId) return
    setServerError(null)
    startTransition(async () => {
      const { error } = await updateOrder({ id: orderId, ...input })
      if (error) {
        setServerError(error)
        return
      }
      onOpenChange(false)
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Content className="flex flex-col gap-6 sm:max-w-3xl">
        <Header className="text-left">
          <Title>
            Editar ordem {order ? formatOrderNumber(order.number) : ''}
          </Title>
          <Description>
            Itens já existentes mantêm o preço da época da criação
          </Description>
        </Header>
        <Body>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <OrderForm
              form={form}
              onSubmit={onSubmit}
              clients={clients}
              products={products}
              snapshotPrices={snapshotPrices}
              showStatus
            >
              {serverError ? (
                <p className="text-destructive text-sm">{serverError}</p>
              ) : null}
              <Footer className="grid flex-1 grid-cols-2 gap-3 pt-2">
                <Close asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Close>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="animate-spin" />}
                  Salvar
                </Button>
              </Footer>
            </OrderForm>
          )}
        </Body>
      </Content>
    </DialogDrawer>
  )
}
