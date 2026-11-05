'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil } from 'lucide-react'
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
import { updateProduct } from '@/db/actions'
import {
  type CreateProductInput,
  type UpdateProductSchema,
  updateProductSchema,
} from '@/db/validators'
import { type MaterialOption, ProductForm } from './product-form'

export interface EditableProduct extends CreateProductInput {
  id: string
}

interface UpdateProductDialogProps {
  product: EditableProduct
  materialOptions: MaterialOption[]
}

export function UpdateProductDialog({
  product,
  materialOptions,
}: UpdateProductDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const { id, ...defaultValues } = product
  const form = useForm<CreateProductInput, unknown, UpdateProductSchema>({
    resolver: zodResolver(updateProductSchema),
    defaultValues,
  })

  function onOpenChange(next: boolean) {
    if (next) {
      setServerError(null)
      form.reset(defaultValues)
    }
    setOpen(next)
  }

  function onSubmit(input: UpdateProductSchema) {
    setServerError(null)
    startTransition(async () => {
      const { error } = await updateProduct({ id, ...input })
      if (error) {
        setServerError(error)
        return
      }
      setOpen(false)
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Trigger>
        <Button variant="outline">
          Editar <Pencil size={16} />
        </Button>
      </Trigger>
      <Content className="flex flex-col gap-6 sm:max-w-xl">
        <Header className="text-left">
          <Title>Editar produto</Title>
          <Description>
            Salvar usa o custo ATUAL dos materiais da composição
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
                Salvar
              </Button>
            </Footer>
          </ProductForm>
        </Body>
      </Content>
    </DialogDrawer>
  )
}
