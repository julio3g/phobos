'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { CurrencyInput } from 'react-currency-mask'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
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
import { toast } from '@/components/ui/toast'
import { updateOrganization } from '@/db/actions'
import {
  currencies,
  type UpdateOrganizationInput,
  type UpdateOrganizationSchema,
  updateOrganizationSchema,
} from '@/db/validators'

const currencyOptions = currencies.map(c => ({ value: c, label: c }))

export function SettingsForm({
  defaultValues,
}: {
  defaultValues: UpdateOrganizationSchema
}) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<
    UpdateOrganizationInput,
    unknown,
    UpdateOrganizationSchema
  >({ resolver: zodResolver(updateOrganizationSchema), defaultValues })

  function onSubmit(input: UpdateOrganizationSchema) {
    startTransition(async () => {
      const { error } = await updateOrganization(input)
      if (error) {
        toast.add({ type: 'error', description: error })
        return
      }
      form.reset(input)
      toast.add({ type: 'success', description: 'Configurações salvas' })
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Nome do negócio:</FormLabel>
              <Input id={field.name} {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Moeda:</FormLabel>
                <Select
                  items={currencyOptions}
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Moeda" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {currencyOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultHourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Valor/hora padrão:</FormLabel>
                <CurrencyInput
                  value={field.value ?? 0}
                  onChangeValue={(_, value) => field.onChange(value)}
                  InputElement={<Input id={field.name} />}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="text-muted-foreground text-sm">
          O valor/hora padrão é sugerido ao criar novos produtos.
        </p>
        <Button type="submit" disabled={isPending || !form.formState.isDirty}>
          {isPending && <Loader2 className="animate-spin" />}
          Salvar
        </Button>
      </form>
    </Form>
  )
}
