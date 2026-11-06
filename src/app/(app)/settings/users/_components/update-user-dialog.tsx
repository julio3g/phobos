'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
} from '@/components/dialog-drawer'
import { Button } from '@/components/ui/button'
import { updateMemberRole, updateUser } from '@/db/actions'
import type { MemberListItem } from '@/db/queries/users'
import {
  type UpdateUserFormInput,
  type UpdateUserFormSchema,
  updateUserFormSchema,
} from '@/db/validators'
import { UserForm } from './user-form'

interface UpdateUserDialogProps {
  user: MemberListItem | null
  currentUserId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toFormValues(user: MemberListItem): UpdateUserFormInput {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    imageUrl: user.imageUrl ?? undefined,
    role: user.role === 'owner' ? undefined : user.role,
  }
}

export function UpdateUserDialog({
  user,
  currentUserId,
  open,
  onOpenChange,
}: UpdateUserDialogProps) {
  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<UpdateUserFormInput, unknown, UpdateUserFormSchema>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: { name: '', username: '', email: '' },
  })

  React.useEffect(() => {
    if (!(open && user)) return
    setServerError(null)
    form.reset(toFormValues(user))
  }, [open, user, form])

  // owner e o próprio usuário não têm a permissão alterada (regra da action)
  const canEditRole = !!user && user.role !== 'owner' && user.id !== currentUserId

  function onSubmit({ role, ...profile }: UpdateUserFormSchema) {
    if (!user) return
    setServerError(null)
    startTransition(async () => {
      const profileResult = await updateUser({ id: user.id, ...profile })
      if (profileResult.error) {
        setServerError(profileResult.error)
        return
      }

      if (canEditRole && role && role !== user.role) {
        const roleResult = await updateMemberRole({ id: user.id, role })
        if (roleResult.error) {
          setServerError(roleResult.error)
          return
        }
      }
      onOpenChange(false)
    })
  }

  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Content>
        <Header className="text-left">
          <Title>Editar usuário</Title>
          <Description>
            {canEditRole
              ? 'Altere os dados e a permissão do usuário'
              : 'A permissão deste usuário não pode ser alterada'}
          </Description>
        </Header>
        <div className="max-sm:p-4">
          <UserForm form={form} onSubmit={onSubmit} withRole={canEditRole}>
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
          </UserForm>
        </div>
      </Content>
    </DialogDrawer>
  )
}
