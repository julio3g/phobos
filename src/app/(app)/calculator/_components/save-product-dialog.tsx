'use client'

import { Loader2, PackagePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { createProduct } from '@/db/actions'
import type { CreateProductSchema } from '@/db/validators'

interface SaveProductDialogProps {
  disabled?: boolean
  values: Pick<
    CreateProductSchema,
    'laborMinutes' | 'hourlyRate' | 'marginType' | 'marginValue' | 'materials'
  >
}

export function SaveProductDialog({
  disabled,
  values,
}: SaveProductDialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [name, setName] = React.useState('')
  const [variant, setVariant] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  function onOpenChange(next: boolean) {
    if (next) setError(null)
    setOpen(next)
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Nome é obrigatório')
      return
    }
    setError(null)
    startTransition(async () => {
      const { data, error } = await createProduct({
        ...values,
        name: name.trim(),
        variant: variant.trim() || undefined,
      })
      if (error || !data) {
        setError(error ?? 'Não foi possível salvar')
        return
      }
      toast.add({ type: 'success', description: 'Produto salvo' })
      setOpen(false)
      router.push(`/products/${data.id}`)
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Trigger>
        <Button type="button" disabled={disabled} className="w-full">
          <PackagePlus className="size-4" /> Salvar como produto
        </Button>
      </Trigger>
      <Content>
        <Header className="text-left">
          <Title>Salvar como produto</Title>
          <Description>
            O produto entra no catálogo com esta composição, mão de obra e
            margem
          </Description>
        </Header>
        <form onSubmit={onSubmit} className="space-y-3 max-sm:p-4">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Nome:</Label>
            <Input
              id="product-name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-variant">Variação:</Label>
            <Input
              id="product-variant"
              value={variant}
              onChange={e => setVariant(e.target.value)}
            />
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
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
        </form>
      </Content>
    </DialogDrawer>
  )
}
