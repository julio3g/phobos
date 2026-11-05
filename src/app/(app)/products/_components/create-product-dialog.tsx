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
import type { Dialog } from '@/components/ui/dialog'
import { createProduct } from '@/db/actions'
import {
  type CreateProductInput,
  type CreateProductSchema,
  createProductSchema,
} from '@/db/validators'
import { type MaterialOption, ProductForm } from './product-form'

interface CreateProductDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  materialOptions: MaterialOption[]
  defaultHourlyRate?: number
  showTrigger?: boolean
  onSuccess?: () => void
}

export function CreateProductDialog({
  materialOptions,
  defaultHourlyRate = 0,
  showTrigger = true,
  onSuccess,
  ...props
}: CreateProductDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<CreateProductInput, unknown, CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      laborMinutes: 0,
      hourlyRate: defaultHourlyRate,
      marginType: 'percent',
      marginValue: 0,
      materials: [],
    },
  })

  function onSubmit(input: CreateProductSchema) {
    setServerError(null)
    startTransition(async () => {
      const { error } = await createProduct(input)
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
    <DialogDrawer open={open} onOpenChange={setOpen} {...props}>
      {showTrigger && (
        <Trigger>
          <Button className="cursor-pointer">
            Adicionar <FilePlus size={16} />
          </Button>
        </Trigger>
      )}
      <Content className="flex flex-col gap-6 sm:max-w-xl">
        <Header className="text-left">
          <Title>Criar produto</Title>
          <Description>
            Monte a composição, informe o tempo e veja o preço sugerido
          </Description>
        </Header>
        <Body className="max-h-[70vh] overflow-y-auto">
          <ProductForm
            form={form}
            materialOptions={materialOptions}
            onSubmit={onSubmit}
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
          </ProductForm>
        </Body>
      </Content>
    </DialogDrawer>
  )
}
