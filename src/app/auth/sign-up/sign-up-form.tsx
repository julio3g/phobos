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
import { signUp } from '@/db/actions'
import { type SignUpSchema, signUpSchema } from '@/db/validators'

const fields = [
  { name: 'name', label: 'Seu nome:', type: 'text', autoComplete: 'name' },
  {
    name: 'organizationName',
    label: 'Nome do negócio:',
    type: 'text',
    autoComplete: 'organization',
  },
  {
    name: 'username',
    label: 'Usuário:',
    type: 'text',
    autoComplete: 'username',
  },
  { name: 'email', label: 'E-mail:', type: 'email', autoComplete: 'email' },
  {
    name: 'password',
    label: 'Senha:',
    type: 'password',
    autoComplete: 'new-password',
  },
] as const

export function SignUpForm() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      organizationName: '',
      username: '',
      email: '',
      password: '',
    },
  })

  function onSubmit(input: SignUpSchema) {
    startTransition(async () => {
      const { error } = await signUp(input)
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
        {fields.map(item => (
          <FormField
            key={item.name}
            name={item.name}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={item.type}
                    autoComplete={item.autoComplete}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button
          className="w-full cursor-pointer"
          disabled={isPending}
          type="submit"
        >
          Criar conta
        </Button>
      </form>
    </Form>
  )
}
