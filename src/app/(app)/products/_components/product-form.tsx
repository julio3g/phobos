'use client'

import { Plus, Trash2 } from 'lucide-react'
import type * as React from 'react'
import { CurrencyInput } from 'react-currency-mask'
import { type UseFormReturn, useFieldArray, useWatch } from 'react-hook-form'
import { CreateMaterialDialog } from '@/app/(app)/materials/_components/create-material-dialog'
import { Combobox } from '@/components/combobox'
import { ImageUpload } from '@/components/image-upload'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MaskInput } from '@/components/ui/mask-input'
import type { CreateProductInput, CreateProductSchema } from '@/db/validators'
import { formatCurrency } from '@/lib/format'
import {
  calcLaborCost,
  calcMaterialLineCost,
  calcSalePrice,
  calcTotalCost,
  type MarginType,
} from '@/lib/pricing'

export interface MaterialOption {
  id: string
  name: string
  brand: string | null
  variant: string | null
  unit: string
  unitCost: number
}

export type ProductFormApi = UseFormReturn<
  CreateProductInput,
  unknown,
  CreateProductSchema
>

interface ProductFormProps
  extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
  children: React.ReactNode
  form: ProductFormApi
  materialOptions: MaterialOption[]
  onSubmit: (data: CreateProductSchema) => void
}

const marginTypes: { value: MarginType; label: string; hint: string }[] = [
  { value: 'percent', label: 'Markup %', hint: 'Acréscimo sobre o custo' },
  { value: 'margin', label: 'Margem %', hint: 'Percentual do preço de venda' },
  { value: 'fixed', label: 'R$', hint: 'Valor fixo sobre o custo' },
]

const materialLabel = (m: MaterialOption) =>
  [m.name, m.brand, m.variant].filter(Boolean).join(' · ')

export function ProductForm({
  form,
  materialOptions,
  onSubmit,
  children,
}: ProductFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'materials',
  })

  const [items, laborMinutes, hourlyRate, marginType, marginValue] = useWatch({
    control: form.control,
    name: [
      'materials',
      'laborMinutes',
      'hourlyRate',
      'marginType',
      'marginValue',
    ],
  })

  const optionById = new Map(materialOptions.map(m => [m.id, m]))
  const selectItems = materialOptions.map(m => ({
    value: m.id,
    label: materialLabel(m),
  }))

  // prévia (o servidor recalcula tudo ao salvar)
  const materialCost = (items ?? []).reduce(
    (acc, item) =>
      acc +
      calcMaterialLineCost(
        optionById.get(item.materialId)?.unitCost ?? 0,
        Number(item.quantity) || 0
      ),
    0
  )
  const laborCost = calcLaborCost(
    Number(laborMinutes) || 0,
    Number(hourlyRate) || 0
  )
  const totalCost = calcTotalCost({ materialCost, laborCost })
  const salePrice = calcSalePrice({
    materialCost,
    laborCost,
    marginType: marginType ?? 'percent',
    marginValue: Number(marginValue) || 0,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={e => {
          // dialog aninhado: não deixa o submit subir para o form pai
          e.stopPropagation()
          form.handleSubmit(onSubmit)(e)
        }}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Nome:</FormLabel>
              <Input id={field.name} {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="variant"
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Variação:</FormLabel>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Descrição:</FormLabel>
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Imagem:</FormLabel>
              <ImageUpload
                id={field.name}
                path="products"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Composição (insumos):</Label>
            <div className="flex gap-2">
              <CreateMaterialDialog compact />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={materialOptions.length === 0}
                onClick={() => append({ materialId: '', quantity: 1 })}
              >
                <Plus className="size-4" /> Insumo
              </Button>
            </div>
          </div>
          {materialOptions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Cadastre materiais para montar a composição.
            </p>
          ) : null}
          {fields.map((row, index) => {
            const option = optionById.get(items?.[index]?.materialId ?? '')
            const lineCost = calcMaterialLineCost(
              option?.unitCost ?? 0,
              Number(items?.[index]?.quantity) || 0
            )
            return (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_6rem_auto] items-start gap-2"
              >
                <FormField
                  control={form.control}
                  name={`materials.${index}.materialId`}
                  render={({ field }) => (
                    <FormItem>
                      <Combobox
                        options={selectItems}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Material"
                        searchPlaceholder="Buscar material..."
                      />
                      <p className="text-muted-foreground text-xs">
                        {option
                          ? `${formatCurrency(lineCost)} (${formatCurrency(option.unitCost)}/${option.unit})`
                          : ' '}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`materials.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        aria-label="Quantidade"
                        {...field}
                        value={
                          Number.isNaN(field.value) ? '' : (field.value ?? '')
                        }
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                      <p className="text-muted-foreground text-xs">
                        {option?.unit ?? ' '}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover insumo"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          })}
          {form.formState.errors.materials?.message ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.materials.message}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="laborMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Minutos de trabalho:</FormLabel>
                <Input
                  id={field.name}
                  type="number"
                  min={0}
                  step={1}
                  {...field}
                  value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Valor/hora:</FormLabel>
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

        <div className="grid gap-2">
          <Label>Método de precificação:</Label>
          <FormField
            control={form.control}
            name="marginType"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-3 gap-2">
                  {marginTypes.map(type => (
                    <Button
                      key={type.value}
                      type="button"
                      title={type.hint}
                      variant={
                        field.value === type.value ? 'default' : 'outline'
                      }
                      onClick={() => field.onChange(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  {marginTypes.find(t => t.value === field.value)?.hint}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="marginValue"
            render={({ field }) => (
              <FormItem>
                {marginType === 'fixed' ? (
                  <CurrencyInput
                    value={field.value ?? 0}
                    onChangeValue={(_, value) => field.onChange(value)}
                    InputElement={<Input id={field.name} />}
                  />
                ) : (
                  <MaskInput
                    id={field.name}
                    mask="percentage"
                    min={0}
                    value={field.value == null ? '' : String(field.value)}
                    onValueChange={(_, unmasked) => field.onChange(unmasked)}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-md border p-3 text-sm">
          <dt className="text-muted-foreground">Insumos</dt>
          <dd className="text-right">{formatCurrency(materialCost)}</dd>
          <dt className="text-muted-foreground">Mão de obra</dt>
          <dd className="text-right">{formatCurrency(laborCost)}</dd>
          <dt className="text-muted-foreground">Custo total</dt>
          <dd className="text-right">{formatCurrency(totalCost)}</dd>
          <dt className="font-medium">Preço sugerido</dt>
          <dd className="text-right font-medium">
            {Number.isNaN(salePrice) ? '—' : formatCurrency(salePrice)}
          </dd>
        </dl>

        {children}
      </form>
    </Form>
  )
}
