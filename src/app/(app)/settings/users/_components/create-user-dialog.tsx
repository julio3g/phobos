'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
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
import { createUser } from '@/db/actions'
import {
  type CreateUserInput,
  type CreateUserSchema,
  createUserSchema,
} from '@/db/validators'
import { UserForm } from './user-form'

export function CreateUserDialog() {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<CreateUserInput, unknown, CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'member',
    },
  })

  function onOpenChange(next: boolean) {
    if (next) setServerError(null)
    setOpen(next)
  }

  function onSubmit(input: CreateUserSchema) {
    setServerError(null)
    startTransition(async () => {
      const { error } = await createUser(input)
      if (error) {
        setServerError(error)
        return
      }
      form.reset()
      setOpen(false)
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Trigger>
        <Button className="cursor-pointer">
          Adicionar <UserPlus size={16} />
        </Button>
      </Trigger>
      <Content>
        <Header className="text-left">
          <Title>Adicionar usuário</Title>
          <Description>
            O usuário entra na sua empresa com a permissão escolhida
          </Description>
        </Header>
        <div className="max-sm:p-4">
          <UserForm form={form} onSubmit={onSubmit} withPassword>
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
          </UserForm>
        </div>
      </Content>
    </DialogDrawer>
  )
}
