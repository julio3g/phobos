'use client'

import type * as React from 'react'
import {
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { roleOptions } from '@/lib/permissions'

interface UserFormProps<T extends FieldValues, O extends FieldValues = T>
  extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
  children: React.ReactNode
  form: UseFormReturn<T, unknown, O>
  onSubmit: (data: O) => void
  /** senha só existe na criação */
  withPassword?: boolean
  /** o proprietário não tem permissão editável */
  withRole?: boolean
}

export function UserForm<T extends FieldValues, O extends FieldValues = T>({
  form,
  onSubmit,
  children,
  withPassword = false,
  withRole = true,
}: UserFormProps<T, O>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name={'name' as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Nome:</FormLabel>
              <Input id={field.name} {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name={'username' as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Usuário:</FormLabel>
                <Input id={field.name} autoComplete="off" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'email' as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>E-mail:</FormLabel>
                <Input
                  id={field.name}
                  type="email"
                  autoComplete="off"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {withPassword ? (
          <FormField
            control={form.control}
            name={'password' as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Senha:</FormLabel>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        {withRole ? (
          <FormField
            control={form.control}
            name={'role' as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Permissão:</FormLabel>
                <Select
                  items={roleOptions}
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Selecione a permissão" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        {children}
      </form>
    </Form>
  )
}
