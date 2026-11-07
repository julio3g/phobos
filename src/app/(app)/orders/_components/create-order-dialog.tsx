'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FilePlus, Loader2 } from 'lucide-react'
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
  Trigger,
} from '@/components/dialog-drawer'
import { Button } from '@/components/ui/button'
import { createOrder } from '@/db/actions'
import { updateOrderSchema } from '@/db/validators'
import type { ClientOption, ProductOption } from '@/types'
import {
  OrderForm,
  type OrderFormOutput,
  type OrderFormValues,
} from './order-form'

interface CreateOrderDialogProps {
  clients: ClientOption[]
  products: ProductOption[]
  newProductSlot?: React.ReactNode
  onSuccess?: () => void
}

export function CreateOrderDialog({
  clients,
  products,
  newProductSlot,
  onSuccess,
}: CreateOrderDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<OrderFormValues, unknown, OrderFormOutput>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      clientId: '',
      paymentStatus: 'pending',
      discount: 0,
      shipping: 0,
      orderItems: [{ productId: '', quantity: 1 }],
    },
  })

  function onSubmit(input: OrderFormOutput) {
    setServerError(null)
    startTransition(async () => {
      const { error } = await createOrder(input)
      if (error) {
        setServerError(error)
        return
      }
      form.reset()
      setOpen(false)
      onSuccess?.()
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={setOpen}>
      <Trigger>
        <Button className="cursor-pointer">
          Adicionar <FilePlus size={16} />
        </Button>
      </Trigger>
      <Content className="flex flex-col gap-6 sm:max-w-3xl">
        <Header className="text-left">
          <Title>Criar ordem</Title>
          <Description>
            Escolha o cliente e adicione os produtos da ordem
          </Description>
        </Header>
        <Body>
          <OrderForm
            form={form}
            onSubmit={onSubmit}
            clients={clients}
            products={products}
            newProductSlot={newProductSlot}
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
                Criar
              </Button>
            </Footer>
          </OrderForm>
        </Body>
      </Content>
    </DialogDrawer>
  )
}
