'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { signIn } from '@/db/actions'
import { z } from '@/lib/z'

const signInFormSchema = z.object({
  identifier: z.string().min(1, 'Informe usuário ou e-mail'),
  password: z.string().min(6),
})

type SignInFormSchema = z.infer<typeof signInFormSchema>

export function SignInForm() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: { identifier: '', password: '' },
  })

  async function onSubmit(input: SignInFormSchema) {
    startTransition(async () => {
      const { error } = await signIn(input)
      if (error) {
        toast.add({ type: 'error', description: error })
        return
      }
      router.push('/')
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-xs space-y-3"
      >
        <FormField
          name="identifier"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário ou e-mail:</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Usuário ou e-mail"
                  autoComplete="username"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha:</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending} type="submit">
          Entrar
        </Button>
      </form>
    </Form>
  )
}
