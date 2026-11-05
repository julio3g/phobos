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
import { createClient } from '@/db/actions'
import { createClientSchema } from '@/db/validators'
import { ClientForm } from './client-form'
import { emptyClientValues } from './client-form-values'
import type {
  ClientFormOutput,
  ClientFormValues,
} from './use-client-autofill'

export function CreateClientDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<ClientFormValues, unknown, ClientFormOutput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: emptyClientValues,
  })

  function onSubmit(input: ClientFormOutput) {
    setServerError(null)
    startTransition(async () => {
      const { error } = await createClient(input)
      if (error) {
        setServerError(error)
        return
      }
      form.reset(emptyClientValues)
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
      <Content className="flex flex-col gap-6 sm:max-w-2xl">
        <Header className="text-left">
          <Title>Criar cliente</Title>
          <Description>
            Informe o CPF, CNPJ ou CEP para preencher os dados automaticamente
          </Description>
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
                Criar
              </Button>
            </Footer>
          </ClientForm>
        </Body>
      </Content>
    </DialogDrawer>
  )
}
