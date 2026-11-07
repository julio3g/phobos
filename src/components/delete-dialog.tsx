'use client'

import { Loader2 } from 'lucide-react'
import * as React from 'react'
import {
  Close,
  Content,
  Description,
  DialogDrawer,
  Footer,
  Header,
  Title,
} from '@/components/dialog-drawer'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** ids a excluir; vazio = nada selecionado */
  ids: string[]
  /** ex.: { one: 'cliente', many: 'clientes' } */
  noun: { one: string; many: string; feminine?: boolean }
  onDelete: (ids: string[]) => Promise<{ error: string | null }>
}

/** Confirmação de exclusão única para qualquer tabela. */
export function DeleteDialog({
  open,
  onOpenChange,
  ids,
  noun,
  onDelete,
}: DeleteDialogProps) {
  const [isPending, startTransition] = React.useTransition()
  const single = ids.length === 1
  const label = single ? noun.one : noun.many

  function confirm() {
    startTransition(async () => {
      const { error } = await onDelete(ids)
      onOpenChange(false)
      if (error) {
        toast.add({ type: 'error', description: error })
        return
      }
      const done = noun.feminine ? 'excluída' : 'excluído'
      toast.add({
        type: 'success',
        description: `${ids.length} ${label} ${single ? done : `${done}s`}`,
      })
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Content>
        <Header>
          <Title>Você tem certeza?</Title>
          <Description>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente{' '}
            <span className="font-medium">{ids.length}</span> {label}.
          </Description>
        </Header>
        <Footer className="gap-2 sm:space-x-0">
          <Close asChild>
            <Button variant="outline">Cancelar</Button>
          </Close>
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={isPending || ids.length === 0}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Excluir
          </Button>
        </Footer>
      </Content>
    </DialogDrawer>
  )
}
