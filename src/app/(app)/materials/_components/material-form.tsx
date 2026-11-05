'use client'

import type * as React from 'react'
import { CurrencyInput } from 'react-currency-mask'
import {
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
  useWatch,
} from 'react-hook-form'
import { ImageUpload } from '@/components/image-upload'
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

interface MaterialFormProps<T extends FieldValues, O extends FieldValues = T>
  extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
  children: React.ReactNode
  form: UseFormReturn<T, unknown, O>
  onSubmit: (data: O) => void
}

const unitOptions = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'm', label: 'Metro (m)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'kg', label: 'Quilo (kg)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'pair', label: 'Par' },
]

const brl = (n: number) =>
  n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 4,
  })

export function MaterialForm<T extends FieldValues, O extends FieldValues = T>({
  form,
  onSubmit,
  children,
}: MaterialFormProps<T, O>) {
  const [unit, packagePrice, packageQuantity] = useWatch({
    control: form.control,
    name: ['unit', 'packagePrice', 'packageQuantity'] as FieldPath<T>[],
  })

  // espelha o unit_cost gerado no banco (packagePrice / packageQuantity)
  const price = Number(packagePrice) || 0
  const quantity = Number(packageQuantity) || 0
  const unitCost = quantity > 0 ? price / quantity : 0
  const unitLabel = unitOptions.find(o => o.value === unit)?.value

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

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={'brand' as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Marca:</FormLabel>
                <Input
                  id={field.name}
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value || undefined)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'variant' as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Variação:</FormLabel>
                <Input
                  id={field.name}
                  placeholder="Cor, tamanho..."
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value || undefined)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={'unit' as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Unidade de medida:</FormLabel>
              <Select
                items={unitOptions}
                value={field.value ?? null}
                onValueChange={field.onChange}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {unitOptions.map(option => (
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

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name={'packagePrice' as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Preço:</FormLabel>
                <CurrencyInput
                  value={field.value ?? 0}
                  onChangeValue={(_, value) => field.onChange(value)}
                  InputElement={<Input id={field.name} />}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'packageQuantity' as FieldPath<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Quantidade:</FormLabel>
                <Input
                  id={field.name}
                  type="number"
                  min={0}
                  step="any"
                  {...field}
                  value={
                    typeof field.value === 'number' && Number.isNaN(field.value)
                      ? ''
                      : (field.value ?? '')
                  }
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <p className="text-muted-foreground text-sm">
          Preço e quantidade da embalagem{unitLabel ? ` (em ${unitLabel})` : ''}
          . Custo por {unitLabel ?? 'unidade'}:{' '}
          <strong className="text-foreground">{brl(unitCost)}</strong>
        </p>

        <FormField
          control={form.control}
          name={'purchaseUrl' as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Link de compra:</FormLabel>
              <Input
                id={field.name}
                type="url"
                placeholder="https://"
                {...field}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value || undefined)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'imageUrl' as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Imagem:</FormLabel>
              <ImageUpload
                id={field.name}
                path="materials"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {children}
      </form>
    </Form>
  )
}
