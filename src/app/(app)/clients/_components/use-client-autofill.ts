'use client'

import * as React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { CreateClientInput, CreateClientSchema } from '@/db/validators'
import {
  lookupCompany,
  lookupTaxpayer,
  lookupZip,
} from '@/lib/document-lookups'

export type ClientFormValues = CreateClientInput
export type ClientFormOutput = CreateClientSchema
export type ClientForm = UseFormReturn<
  ClientFormValues,
  unknown,
  ClientFormOutput
>

// Uma consulta por campo: ignora respostas antigas (reqId), não repete a mesma
// busca (last) e expõe o estado de carregamento.
function useLookup(length: number) {
  const [isPending, startTransition] = React.useTransition()
  const reqId = React.useRef(0)
  const last = React.useRef('')

  React.useEffect(
    () => () => {
      reqId.current += 1
    },
    []
  )

  const run = React.useCallback(
    (
      digits: string,
      task: (isCurrent: () => boolean) => Promise<void>,
      onIncomplete: () => void
    ) => {
      const id = ++reqId.current

      if (digits.length !== length) {
        last.current = ''
        onIncomplete()
        return
      }
      if (last.current === digits) return

      last.current = digits
      startTransition(() => task(() => id === reqId.current))
    },
    [length]
  )

  return { isPending, run }
}

/** Preenche o form a partir de CEP, CPF e CNPJ (APIs externas, via server action). */
export function useClientAutofill(form: ClientForm) {
  const zip = useLookup(8)
  const cpf = useLookup(11)
  const cnpj = useLookup(14)

  const fill = React.useCallback(
    (values: Partial<ClientFormValues>) => {
      for (const [name, value] of Object.entries(values)) {
        form.setValue(name as keyof ClientFormValues, value as string, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
    },
    [form]
  )

  const lookupZipCode = React.useCallback(
    (digits: string) =>
      zip.run(
        digits,
        async isCurrent => {
          const { data, error } = await lookupZip(digits)
          if (!isCurrent()) return

          if (error || !data) {
            form.setError('zipCode', {
              type: 'manual',
              message: error ?? 'CEP não encontrado',
            })
            return
          }

          form.clearErrors('zipCode')
          fill({
            street: data.street,
            neighborhood: data.district,
            city: data.city,
            state: data.state,
          })
        },
        () => form.clearErrors('zipCode')
      ),
    [zip, form, fill]
  )

  const lookupCpf = React.useCallback(
    (digits: string) =>
      cpf.run(
        digits,
        async isCurrent => {
          const { data, error } = await lookupTaxpayer(digits)
          if (!isCurrent()) return

          if (error || !data) {
            form.setError('cpf', {
              type: 'manual',
              message: error ?? 'CPF não encontrado',
            })
            return
          }

          form.clearErrors('cpf')
          fill({ legalName: data.name })
        },
        () => form.clearErrors('cpf')
      ),
    [cpf, form, fill]
  )

  const lookupCnpj = React.useCallback(
    (digits: string) =>
      cnpj.run(
        digits,
        async isCurrent => {
          const { data, error } = await lookupCompany(digits)
          if (!isCurrent()) return

          if (error || !data) {
            form.setError('cnpj', {
              type: 'manual',
              message: error ?? 'CNPJ não encontrado',
            })
            return
          }

          form.clearErrors('cnpj')
          fill(data)
        },
        () => form.clearErrors('cnpj')
      ),
    [cnpj, form, fill]
  )

  return {
    isZipPending: zip.isPending,
    isCpfPending: cpf.isPending,
    isCnpjPending: cnpj.isPending,
    lookupZipCode,
    lookupCpf,
    lookupCnpj,
  }
}
