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
import type { OrderListItem } from '@/db/queries/orders'
import { updateOrderSchema } from '@/db/validators'
import type { ClientOption, ProductOption } from '@/types'
import { formatOrderNumber } from '@/utils/get-label-and-icons'
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
  newProductSlot?: React.ReactNode
}

export function UpdateOrderDialog({
  order,
  open,
  onOpenChange,
  clients,
  products,
  newProductSlot,
}: UpdateOrderDialogProps) {
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<OrderFormValues, unknown, OrderFormOutput>({
    resolver: zodResolver(updateOrderSchema),
  })

  // itens já existentes mantêm o preço da época da criação
  const snapshotPrices = React.useMemo(
    () =>
      Object.fromEntries(
        (order?.orderItems ?? []).map(item => [item.productId, item.unitPrice])
      ),
    [order]
  )

  // a linha da tabela já traz os itens: não precisa buscar de novo
  React.useEffect(() => {
    if (!(open && order)) return
    setServerError(null)
    form.reset({
      clientId: order.clientId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      discount: order.discount,
      shipping: order.shipping,
      notes: order.notes ?? undefined,
      orderItems: order.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    })
  }, [open, order, form])

  function onSubmit(input: OrderFormOutput) {
    if (!order) return
    setServerError(null)
    startTransition(async () => {
      const { error } = await updateOrder({ id: order.id, ...input })
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
          <OrderForm
            form={form}
            onSubmit={onSubmit}
            clients={clients}
            products={products}
            newProductSlot={newProductSlot}
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
        </Body>
      </Content>
    </DialogDrawer>
  )
}
