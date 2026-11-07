'use client'

import { cn } from 'cn'
import { Loader2 } from 'lucide-react'
import type * as React from 'react'
import { useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MaskInput } from '@/components/ui/mask-input'
import {
  type ClientFormOutput,
  type ClientForm as ClientFormType,
  useClientAutofill,
} from './use-client-autofill'

interface ClientFormProps
  extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
  children: React.ReactNode
  form: ClientFormType
  onSubmit: (data: ClientFormOutput) => void
}

const personTypes = [
  { value: 'individual', label: 'Pessoa física' },
  { value: 'company', label: 'Pessoa jurídica' },
] as const

/** Spinner sobre o input enquanto a consulta externa roda. */
function LookupSpinner({ pending }: { pending: boolean }) {
  return (
    <Loader2
      aria-hidden
      className={cn(
        'absolute top-1/2 right-3 z-10 size-4 -translate-y-1/2 animate-spin text-muted-foreground',
        !pending && 'hidden'
      )}
    />
  )
}

export function ClientForm({ form, onSubmit, children }: ClientFormProps) {
  const personType = useWatch({ control: form.control, name: 'personType' })
  const phone = String(useWatch({ control: form.control, name: 'phone' }) ?? '')

  const autofill = useClientAutofill(form)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="personType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de pessoa:</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {personTypes.map(type => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={field.value === type.value ? 'default' : 'outline'}
                    onClick={() => field.onChange(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {personType === 'company' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id={field.name}>CNPJ:</FormLabel>
                  <div className="relative">
                    <LookupSpinner pending={autofill.isCnpjPending} />
                    <MaskInput
                      id={field.name}
                      mask="cnpj"
                      value={field.value ?? ''}
                      onValueChange={(_, unmasked) => {
                        field.onChange(unmasked)
                        autofill.lookupCnpj(unmasked)
                      }}
                      className={cn(autofill.isCnpjPending && 'pr-9')}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stateRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id={field.name}>Inscrição estadual:</FormLabel>
                  <Input id={field.name} {...field} value={field.value ?? ''} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>CPF:</FormLabel>
                <div className="relative">
                  <LookupSpinner pending={autofill.isCpfPending} />
                  <MaskInput
                    id={field.name}
                    mask="cpf"
                    value={field.value ?? ''}
                    onValueChange={(_, unmasked) => {
                      field.onChange(unmasked)
                      autofill.lookupCpf(unmasked)
                    }}
                    className={cn(autofill.isCpfPending && 'pr-9')}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="legalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>
                  {personType === 'company' ? 'Razão social:' : 'Nome:'}
                </FormLabel>
                <Input id={field.name} {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          {personType === 'company' ? (
            <FormField
              control={form.control}
              name="tradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id={field.name}>Nome fantasia:</FormLabel>
                  <Input id={field.name} {...field} value={field.value ?? ''} />
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Contato:</FormLabel>
                <Input id={field.name} {...field} value={field.value ?? ''} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>E-mail:</FormLabel>
                <Input
                  id={field.name}
                  type="email"
                  {...field}
                  value={field.value ?? ''}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Telefone:</FormLabel>
                <MaskInput
                  id={field.name}
                  mask="brPhone"
                  value={phone}
                  onValueChange={(_, unmasked) => field.onChange(unmasked)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-6 gap-3">
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem className="col-span-6 sm:col-span-2">
                <FormLabel id={field.name}>CEP:</FormLabel>
                <div className="relative">
                  <LookupSpinner pending={autofill.isZipPending} />
                  <MaskInput
                    id={field.name}
                    mask="brZipCode"
                    value={field.value ?? ''}
                    onValueChange={(_, unmasked) => {
                      field.onChange(unmasked)
                      autofill.lookupZipCode(unmasked)
                    }}
                    className={cn(autofill.isZipPending && 'pr-9')}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem className="col-span-6 sm:col-span-3">
                <FormLabel id={field.name}>Rua:</FormLabel>
                <Input id={field.name} {...field} value={field.value ?? ''} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="addressNumber"
            render={({ field }) => (
              <FormItem className="col-span-3 sm:col-span-1">
                <FormLabel id={field.name}>Nº:</FormLabel>
                <Input
                  id={field.name}
                  inputMode="numeric"
                  {...field}
                  value={field.value ?? ''}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="complement"
            render={({ field }) => (
              <FormItem className="col-span-3 sm:col-span-2">
                <FormLabel id={field.name}>Complemento:</FormLabel>
                <Input id={field.name} {...field} value={field.value ?? ''} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem className="col-span-6 sm:col-span-2">
                <FormLabel id={field.name}>Bairro:</FormLabel>
                <Input id={field.name} {...field} value={field.value ?? ''} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="col-span-4 sm:col-span-1">
                <FormLabel id={field.name}>Cidade:</FormLabel>
                <Input id={field.name} {...field} value={field.value ?? ''} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel id={field.name}>UF:</FormLabel>
                <Input
                  id={field.name}
                  maxLength={2}
                  className="uppercase"
                  {...field}
                  value={field.value ?? ''}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {children}
      </form>
    </Form>
  )
}
