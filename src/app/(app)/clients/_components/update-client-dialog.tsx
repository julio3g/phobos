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
import { updateClient } from '@/db/actions'
import type { Client } from '@/db/schema'
import { updateClientSchema } from '@/db/validators'
import { ClientForm } from './client-form'
import { clientToFormValues, emptyClientValues } from './client-form-values'
import type { ClientFormOutput, ClientFormValues } from './use-client-autofill'

interface UpdateClientDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateClientDialog({
  client,
  open,
  onOpenChange,
}: UpdateClientDialogProps) {
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<ClientFormValues, unknown, ClientFormOutput>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: emptyClientValues,
  })

  // a linha da tabela já traz todos os campos: não precisa buscar de novo
  React.useEffect(() => {
    if (!(open && client)) return
    setServerError(null)
    form.reset(clientToFormValues(client))
  }, [open, client, form])

  function onSubmit(input: ClientFormOutput) {
    if (!client) return
    setServerError(null)
    startTransition(async () => {
      const { error } = await updateClient({ id: client.id, ...input })
      if (error) {
        setServerError(error)
        return
      }
      onOpenChange(false)
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Content className="flex flex-col gap-6 sm:max-w-2xl">
        <Header className="text-left">
          <Title>Editar cliente</Title>
          <Description>{client?.legalName}</Description>
        </Header>
        <Body className="max-h-[70vh] overflow-y-auto">
          <ClientForm form={form} onSubmit={onSubmit}>
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
          </ClientForm>
        </Body>
      </Content>
    </DialogDrawer>
  )
}
