'use client'

import { Plus, Trash2 } from 'lucide-react'
import type * as React from 'react'
import { CurrencyInput } from 'react-currency-mask'
import { type UseFormReturn, useFieldArray, useWatch } from 'react-hook-form'
import { Combobox } from '@/components/combobox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { UpdateOrderInput, UpdateOrderSchema } from '@/db/validators'
import { formatCurrency } from '@/lib/format'
import { round2 } from '@/lib/number'
import type { ClientOption, ProductOption } from '@/types'
import {
  orderStatusOptions,
  paymentStatusOptions,
} from '@/utils/get-label-and-icons'

// create e update usam o mesmo form; `status` só aparece no update
export type OrderFormValues = UpdateOrderInput
export type OrderFormOutput = UpdateOrderSchema

interface OrderFormProps
  extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
  children: React.ReactNode
  form: UseFormReturn<OrderFormValues, unknown, OrderFormOutput>
  onSubmit: (data: OrderFormOutput) => void
  clients: ClientOption[]
  products: ProductOption[]
  /** Preço gravado na ordem (produto -> unitPrice). Na edição, vale sobre o cadastro. */
  snapshotPrices?: Record<string, number>
  showStatus?: boolean
  /** ex.: <CreateProductDialog compact /> renderizado pela page */
  newProductSlot?: React.ReactNode
}

export function OrderForm({
  form,
  onSubmit,
  children,
  clients,
  products,
  snapshotPrices,
  showStatus = false,
  newProductSlot,
}: OrderFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'orderItems',
  })

  const [items, discount, shipping] = useWatch({
    control: form.control,
    name: ['orderItems', 'discount', 'shipping'],
  })

  const productItems = products.map(p => ({
    value: p.id,
    label: p.variant ? `${p.name} — ${p.variant}` : p.name,
  }))

  const priceOf = (productId: string) =>
    snapshotPrices?.[productId] ??
    products.find(p => p.id === productId)?.salePrice ??
    0

  const subtotal = round2(
    (items ?? []).reduce(
      (sum, item) =>
        sum + (Number(item?.quantity) || 0) * priceOf(item?.productId ?? ''),
      0
    )
  )
  const discountValue = Number(discount) || 0
  const shippingValue = Number(shipping) || 0
  const total = round2(subtotal - discountValue + shippingValue)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Cliente:</FormLabel>
                <Combobox
                  id={field.name}
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione o cliente"
                  searchPlaceholder="Buscar cliente..."
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {showStatus ? (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id={field.name}>Status:</FormLabel>
                  <Select
                    items={orderStatusOptions}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {orderStatusOptions.map(option => (
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
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Itens</span>
            <div className="flex gap-2">
              {newProductSlot}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: '', quantity: 1 })}
              >
                <Plus className="size-4" /> Adicionar item
              </Button>
            </div>
          </div>

          <div className="max-h-[40vh] space-y-3 overflow-y-auto pr-1">
            {fields.map((item, index) => {
              const line = items?.[index]
              const unitPrice = priceOf(line?.productId ?? '')
              const lineTotal = round2(
                (Number(line?.quantity) || 0) * unitPrice
              )

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_5rem_auto] items-start gap-2 rounded-md border p-2 sm:grid-cols-[1fr_6rem_8rem_8rem_auto]"
                >
                  <FormField
                    control={form.control}
                    name={`orderItems.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="col-span-3 sm:col-span-1">
                        <FormLabel id={field.name}>Produto:</FormLabel>
                        <Combobox
                          id={field.name}
                          options={productItems}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Selecione o produto"
                          searchPlaceholder="Buscar produto..."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`orderItems.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel id={field.name}>Qtd.:</FormLabel>
                        <Input
                          id={field.name}
                          type="number"
                          min={0}
                          step="any"
                          {...field}
                          value={
                            typeof field.value === 'number' &&
                            Number.isNaN(field.value)
                              ? ''
                              : (field.value ?? '')
                          }
                          onChange={e => field.onChange(e.target.valueAsNumber)}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-2 text-sm">
                    <Label htmlFor={`orderItems.${index}.unitPrice`}>
                      Preço:
                    </Label>
                    <Input
                      id={`orderItems.${index}.unitPrice`}
                      readOnly
                      tabIndex={-1}
                      className="text-muted-foreground"
                      value={formatCurrency(unitPrice)}
                    />
                  </div>
                  <div className="grid gap-2 text-sm">
                    <Label htmlFor={`orderItems.${index}.total`}>Total:</Label>
                    <Input
                      id={`orderItems.${index}.total`}
                      readOnly
                      tabIndex={-1}
                      className="font-medium"
                      value={formatCurrency(lineTotal)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <span className="h-3.5" aria-hidden />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remover item"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          {form.formState.errors.orderItems?.message ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.orderItems.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Desconto:</FormLabel>
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
            name="shipping"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Frete:</FormLabel>
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
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel id={field.name}>Pagamento:</FormLabel>
                <Select
                  items={paymentStatusOptions}
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {paymentStatusOptions.map(option => (
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
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel id={field.name}>Observações:</FormLabel>
              <Textarea
                id={field.name}
                maxLength={150}
                {...field}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value || undefined)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-right">{formatCurrency(subtotal)}</dd>
          <dt className="text-muted-foreground">Desconto</dt>
          <dd className="text-right">- {formatCurrency(discountValue)}</dd>
          <dt className="text-muted-foreground">Frete</dt>
          <dd className="text-right">+ {formatCurrency(shippingValue)}</dd>
          <dt className="font-medium">Total</dt>
          <dd className="text-right font-medium">{formatCurrency(total)}</dd>
        </dl>
        {discountValue > subtotal ? (
          <p className="text-destructive text-sm">
            Desconto maior que o subtotal.
          </p>
        ) : null}

        {children}
      </form>
    </Form>
  )
}
