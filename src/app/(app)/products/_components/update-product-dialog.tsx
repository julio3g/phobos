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
import { updateProduct } from '@/db/actions'
import type { ProductListItem } from '@/db/queries/products'
import {
  type CreateProductInput,
  type UpdateProductSchema,
  updateProductSchema,
} from '@/db/validators'
import { type MaterialOption, ProductForm } from './product-form'

interface UpdateProductDialogProps {
  product: ProductListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  materialOptions: MaterialOption[]
}

function toFormValues(product: ProductListItem): CreateProductInput {
  return {
    name: product.name,
    variant: product.variant ?? undefined,
    description: product.description ?? undefined,
    imageUrl: product.imageUrl ?? undefined,
    value: product.value ?? undefined,
    laborMinutes: product.laborMinutes,
    hourlyRate: product.hourlyRate,
    marginType: product.marginType,
    marginValue: product.marginValue,
    materials: product.materials,
  }
}

export function UpdateProductDialog({
  product,
  open,
  onOpenChange,
  materialOptions,
}: UpdateProductDialogProps) {
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<CreateProductInput, unknown, UpdateProductSchema>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: '',
      laborMinutes: 0,
      hourlyRate: 0,
      marginType: 'percent',
      marginValue: 0,
      materials: [],
    },
  })

  // a linha da tabela já traz a composição: não precisa buscar de novo
  React.useEffect(() => {
    if (!(open && product)) return
    setServerError(null)
    form.reset(toFormValues(product))
  }, [open, product, form])

  function onSubmit(input: UpdateProductSchema) {
    if (!product) return
    setServerError(null)
    startTransition(async () => {
      const { error } = await updateProduct({ id: product.id, ...input })
      if (error) {
        setServerError(error)
        return
      }
      onOpenChange(false)
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
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
