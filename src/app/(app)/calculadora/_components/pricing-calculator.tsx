'use client'

import { Clock, Percent, Plus, RotateCcw, Trash2 } from 'lucide-react'
import * as React from 'react'
import { CurrencyInput } from 'react-currency-mask'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MaskInput } from '@/components/ui/mask-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'
import {
  calcLaborCost,
  calcMaterialLineCost,
  calcSalePrice,
  calcTotalCost,
  type MarginType,
} from '@/lib/pricing'
import type { MaterialOption } from '../../products/_components/product-form'
import { SaveProductDialog } from './save-product-dialog'

interface PricingCalculatorProps {
  materialOptions: MaterialOption[]
  defaultHourlyRate: number
}

interface Line {
  key: string
  materialId: string
  quantity: string
}

const marginTypes: { value: MarginType; label: string; hint: string }[] = [
  { value: 'percent', label: 'Markup %', hint: 'Acréscimo sobre o custo' },
  { value: 'margin', label: 'Margem %', hint: 'Percentual do preço de venda' },
  { value: 'fixed', label: 'R$', hint: 'Valor fixo sobre o custo' },
]

const materialLabel = (m: MaterialOption) =>
  [m.name, m.brand, m.variant].filter(Boolean).join(' · ')

const pct = (value: number) => `${value.toFixed(1).replace('.', ',')}%`

let lineSeq = 0
const newLine = (): Line => ({
  key: `line-${++lineSeq}`,
  materialId: '',
  quantity: '1',
})

export function PricingCalculator({
  materialOptions,
  defaultHourlyRate,
}: PricingCalculatorProps) {
  const [lines, setLines] = React.useState<Line[]>(() => [newLine()])
  const [laborMinutes, setLaborMinutes] = React.useState('0')
  const [hourlyRate, setHourlyRate] = React.useState(defaultHourlyRate)
  const [marginType, setMarginType] = React.useState<MarginType>('percent')
  const [marginValue, setMarginValue] = React.useState(30)

  const optionById = React.useMemo(
    () => new Map(materialOptions.map(m => [m.id, m])),
    [materialOptions]
  )
  const selectItems = React.useMemo(
    () => materialOptions.map(m => ({ value: m.id, label: materialLabel(m) })),
    [materialOptions]
  )

  function updateLine(key: string, patch: Partial<Line>) {
    setLines(current =>
      current.map(line => (line.key === key ? { ...line, ...patch } : line))
    )
  }

  function onReset() {
    setLines([newLine()])
    setLaborMinutes('0')
    setHourlyRate(defaultHourlyRate)
    setMarginType('percent')
    setMarginValue(30)
  }

  const lineCosts = lines.map(line =>
    calcMaterialLineCost(
      optionById.get(line.materialId)?.unitCost ?? 0,
      Number(line.quantity) || 0
    )
  )
  const materialCost = lineCosts.reduce((sum, cost) => sum + cost, 0)
  const laborCost = calcLaborCost(Number(laborMinutes) || 0, hourlyRate)
  const totalCost = calcTotalCost({ materialCost, laborCost })
  const salePrice = calcSalePrice({
    materialCost,
    laborCost,
    marginType,
    marginValue,
  })
  const validPrice = !Number.isNaN(salePrice)
  const profit = validPrice ? salePrice - totalCost : 0
  const realMargin = validPrice && salePrice > 0 ? (profit / salePrice) * 100 : 0
  const markup = totalCost > 0 ? (profit / totalCost) * 100 : 0

  const composition = validPrice && salePrice > 0
    ? [
        {
          label: 'Insumos',
          value: materialCost,
          className: 'bg-chart-1',
        },
        { label: 'Mão de obra', value: laborCost, className: 'bg-chart-3' },
        { label: 'Lucro', value: Math.max(profit, 0), className: 'bg-chart-2' },
      ]
    : []

  const usedMaterials = lines
    .filter(line => line.materialId && Number(line.quantity) > 0)
    .map(line => ({
      materialId: line.materialId,
      quantity: Number(line.quantity),
    }))

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>1. Insumos</CardTitle>
            <CardDescription>
              O custo vem do cadastro de materiais (preço ÷ quantidade da
              embalagem)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {materialOptions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Cadastre materiais para montar a composição.
              </p>
            ) : null}
            {lines.map((line, index) => {
              const option = optionById.get(line.materialId)
              return (
                <div
                  key={line.key}
                  className="grid grid-cols-[1fr_6rem_auto] items-start gap-2 sm:grid-cols-[1fr_6rem_6rem_auto]"
                >
                  <div className="space-y-1">
                    <Select
                      items={selectItems}
                      value={line.materialId || null}
                      onValueChange={value =>
                        updateLine(line.key, { materialId: value ?? '' })
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-label={`Material ${index + 1}`}
                      >
                        <SelectValue placeholder="Selecione o material" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        {selectItems.map(item => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      {option
                        ? `${formatCurrency(option.unitCost)} / ${option.unit}`
                        : ' '}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      aria-label="Quantidade"
                      value={line.quantity}
                      onChange={e =>
                        updateLine(line.key, { quantity: e.target.value })
                      }
                    />
                    <p className="text-muted-foreground text-xs">
                      {option?.unit ?? ' '}
                    </p>
                  </div>
                  <div className="col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto">
                    <Input
                      readOnly
                      tabIndex={-1}
                      aria-label="Custo da linha"
                      className="font-medium"
                      value={formatCurrency(lineCosts[index])}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remover insumo"
                    disabled={lines.length === 1}
                    onClick={() =>
                      setLines(current =>
                        current.filter(item => item.key !== line.key)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={materialOptions.length === 0}
              onClick={() => setLines(current => [...current, newLine()])}
            >
              <Plus className="size-4" /> Adicionar insumo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Mão de obra</CardTitle>
            <CardDescription>
              Tempo gasto × valor da sua hora de trabalho
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="labor-minutes">Minutos de trabalho:</Label>
              <Input
                id="labor-minutes"
                type="number"
                min={0}
                step={1}
                value={laborMinutes}
                onChange={e => setLaborMinutes(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hourly-rate">Valor/hora:</Label>
              <CurrencyInput
                value={hourlyRate}
                onChangeValue={(_, value) => setHourlyRate(Number(value) || 0)}
                InputElement={<Input id="hourly-rate" />}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Margem de lucro</CardTitle>
            <CardDescription>
              {marginTypes.find(t => t.value === marginType)?.hint}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {marginTypes.map(type => (
                <Button
                  key={type.value}
                  type="button"
                  title={type.hint}
                  variant={marginType === type.value ? 'default' : 'outline'}
                  onClick={() => setMarginType(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
            {marginType === 'fixed' ? (
              <CurrencyInput
                value={marginValue}
                onChangeValue={(_, value) => setMarginValue(Number(value) || 0)}
                InputElement={<Input aria-label="Valor fixo de lucro" />}
              />
            ) : (
              <MaskInput
                mask="percentage"
                min={0}
                aria-label="Percentual"
                value={String(marginValue)}
                onValueChange={(_, unmasked) =>
                  setMarginValue(Number(unmasked) || 0)
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card className="border-primary/40">
          <CardHeader>
            <CardDescription>Preço de venda sugerido</CardDescription>
            <CardTitle className="font-semibold text-4xl tabular-nums">
              {validPrice ? formatCurrency(salePrice) : '—'}
            </CardTitle>
            {validPrice ? null : (
              <p className="text-destructive text-sm">
                Margem sobre a venda deve ser menor que 100%.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {composition.length > 0 ? (
              <div className="space-y-2">
                <div
                  className="flex h-3 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label="Composição do preço de venda"
                >
                  {composition.map(part => (
                    <div
                      key={part.label}
                      className={part.className}
                      style={{ width: `${(part.value / salePrice) * 100}%` }}
                    />
                  ))}
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
                  {composition.map(part => (
                    <li key={part.label} className="flex items-center gap-1.5">
                      <span
                        className={`size-2 rounded-full ${part.className}`}
                      />
                      {part.label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Insumos</dt>
              <dd className="text-right tabular-nums">
                {formatCurrency(materialCost)}
              </dd>
              <dt className="text-muted-foreground">Mão de obra</dt>
              <dd className="text-right tabular-nums">
                {formatCurrency(laborCost)}
              </dd>
              <dt className="font-medium">Custo total</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatCurrency(totalCost)}
              </dd>
              <dt className="text-muted-foreground">Lucro por unidade</dt>
              <dd className="text-right tabular-nums">
                {validPrice ? formatCurrency(profit) : '—'}
              </dd>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Percent className="size-3.5" aria-hidden /> Margem real
              </dt>
              <dd className="text-right tabular-nums">
                {validPrice ? pct(realMargin) : '—'}
              </dd>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Clock className="size-3.5" aria-hidden /> Markup
              </dt>
              <dd className="text-right tabular-nums">
                {validPrice ? pct(markup) : '—'}
              </dd>
            </dl>

            <div className="grid gap-2">
              <SaveProductDialog
                disabled={!validPrice || usedMaterials.length === 0}
                values={{
                  laborMinutes: Number(laborMinutes) || 0,
                  hourlyRate,
                  marginType,
                  marginValue,
                  materials: usedMaterials,
                }}
              />
              <Button type="button" variant="ghost" onClick={onReset}>
                <RotateCcw className="size-4" /> Limpar
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
