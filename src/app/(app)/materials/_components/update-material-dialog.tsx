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
import { updateMaterial } from '@/db/actions'
import type { Material } from '@/db/schema'
import {
  type CreateMaterialInput,
  type UpdateMaterialSchema,
  updateMaterialSchema,
} from '@/db/validators'
import { MaterialForm } from './material-form'

interface UpdateMaterialDialogProps {
  material: Material | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toFormValues(material: Material): CreateMaterialInput {
  return {
    name: material.name,
    brand: material.brand ?? undefined,
    variant: material.variant ?? undefined,
    imageUrl: material.imageUrl ?? undefined,
    purchaseUrl: material.purchaseUrl ?? undefined,
    unit: material.unit,
    packagePrice: material.packagePrice,
    packageQuantity: material.packageQuantity,
  }
}

export function UpdateMaterialDialog({
  material,
  open,
  onOpenChange,
}: UpdateMaterialDialogProps) {
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<CreateMaterialInput, unknown, UpdateMaterialSchema>({
    resolver: zodResolver(updateMaterialSchema),
    defaultValues: {
      name: '',
      unit: 'un',
      packagePrice: 0,
      packageQuantity: 1,
    },
  })

  React.useEffect(() => {
    if (!(open && material)) return
    setServerError(null)
    form.reset(toFormValues(material))
  }, [open, material, form])

  function onSubmit(input: UpdateMaterialSchema) {
    if (!material) return
    setServerError(null)
    startTransition(async () => {
      const { error } = await updateMaterial({ id: material.id, ...input })
      if (error) {
        setServerError(error)
        return
      }
      onOpenChange(false)
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Content className="flex flex-col gap-6 sm:max-w-lg">
        <Header className="text-left">
          <Title>Editar material</Title>
          <Description>
            Alterar o preço não muda produtos já salvos; use
            &quot;Recalcular&quot; no produto para aplicar o novo custo.
          </Description>
        </Header>
        <Body className="max-h-[70vh] overflow-y-auto">
          <MaterialForm form={form} onSubmit={onSubmit}>
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
          </MaterialForm>
        </Body>
      </Content>
    </DialogDrawer>
  )
}
