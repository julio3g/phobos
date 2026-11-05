'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FilePlus, Loader2 } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import {
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
import { createMaterial } from '@/db/actions'
import {
  type CreateMaterialInput,
  type CreateMaterialSchema,
  createMaterialSchema,
} from '@/db/validators'
import { MaterialForm } from './material-form'

interface CreateMaterialDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  showTrigger?: boolean
  onSuccess?: () => void
}

export function CreateMaterialDialog({
  showTrigger = true,
  onSuccess,
  ...props
}: CreateMaterialDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<CreateMaterialInput, unknown, CreateMaterialSchema>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: {
      name: '',
      unit: 'un',
      packagePrice: 0,
      packageQuantity: 1,
    },
  })

  function onSubmit(input: CreateMaterialSchema) {
    setServerError(null)
    startTransition(async () => {
      const { error } = await createMaterial(input)
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
      <Content>
        <Header className="text-left">
          <Title>Criar material</Title>
          <Description>
            Informe o preço e a quantidade da embalagem para calcular o custo
            por unidade
          </Description>
        </Header>
        <div className="max-sm:p-4">
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
                Criar
              </Button>
            </Footer>
          </MaterialForm>
        </div>
      </Content>
    </DialogDrawer>
  )
}
