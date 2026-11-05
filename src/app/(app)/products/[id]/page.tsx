import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getMaterialOptions } from '@/db/queries/materials'
import { getProductDetail } from '@/db/queries/products'
import { formatCurrency } from '@/lib/format'
import { calcTotalCost } from '@/lib/pricing'
import { RecalculateButton } from '../_components/recalculate-button'
import { UpdateProductDialog } from '../_components/update-product-dialog'

export const metadata: Metadata = { title: 'Produto' }

const marginLabel = {
  percent: 'Markup sobre o custo',
  margin: 'Margem sobre a venda',
  fixed: 'Valor fixo',
} as const

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const detail = await getProductDetail(id)
  if (!detail) notFound()

  const { product, lines } = detail
  const materialOptions = await getMaterialOptions()

  // há insumo cujo custo atual difere do snapshot salvo
  const outdated = lines.some(l => l.currentUnitCost !== l.unitCost)

  return (
    <div className="container mx-auto w-full space-y-6 px-4 md:px-8">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={
          <Link href="/products">
            <ArrowLeft className="size-4" /> Produtos
          </Link>
        }
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={96}
              height={96}
              className="size-24 rounded-md border object-cover"
              unoptimized
            />
          ) : null}
          <div>
            <h2 className="font-medium text-2xl">{product.name}</h2>
            {product.variant ? (
              <p className="text-muted-foreground">{product.variant}</p>
            ) : null}
            {product.description ? (
              <p className="mt-2 max-w-prose text-sm">{product.description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <RecalculateButton id={product.id} outdated={outdated} />
          <UpdateProductDialog
            materialOptions={materialOptions}
            product={{
              id: product.id,
              name: product.name,
              variant: product.variant ?? undefined,
              description: product.description ?? undefined,
              imageUrl: product.imageUrl ?? undefined,
              value: product.value ?? undefined,
              laborMinutes: product.laborMinutes,
              hourlyRate: product.hourlyRate,
              marginType: product.marginType,
              marginValue: product.marginValue,
              materials: lines.map(l => ({
                materialId: l.materialId,
                quantity: l.quantity,
              })),
            }}
          />
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="font-medium">Composição</h3>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-2">Insumo</th>
                <th className="p-2 text-right">Quantidade</th>
                <th className="p-2 text-right">Custo unit. (salvo)</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-right">Custo atual</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-muted-foreground">
                    Sem insumos.
                  </td>
                </tr>
              ) : null}
              {lines.map(l => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">
                    {[l.name, l.brand, l.variant].filter(Boolean).join(' · ')}
                  </td>
                  <td className="p-2 text-right">
                    {l.quantity} {l.unit}
                  </td>
                  <td className="p-2 text-right">
                    {l.unitCost.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 4,
                    })}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(l.totalCost)}
                  </td>
                  <td className="p-2 text-right">
                    {l.currentUnitCost.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 4,
                    })}
                    {l.currentUnitCost !== l.unitCost ? (
                      <Badge variant="secondary" className="ml-2">
                        mudou
                      </Badge>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid max-w-md grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">Insumos</span>
        <span className="text-right">
          {formatCurrency(product.materialCost)}
        </span>
        <span className="text-muted-foreground">
          Mão de obra ({product.laborMinutes} min a{' '}
          {formatCurrency(product.hourlyRate)}/h)
        </span>
        <span className="text-right">{formatCurrency(product.laborCost)}</span>
        <span className="text-muted-foreground">Custo total</span>
        <span className="text-right">
          {formatCurrency(
            calcTotalCost({
              materialCost: product.materialCost,
              laborCost: product.laborCost,
            })
          )}
        </span>
        <span className="text-muted-foreground">
          {marginLabel[product.marginType]} (
          {product.marginType === 'fixed'
            ? formatCurrency(product.marginValue)
            : `${product.marginValue}%`}
          )
        </span>
        <span />
        <span className="font-medium">Preço de venda</span>
        <span className="text-right font-medium">
          {formatCurrency(product.salePrice)}
        </span>
      </section>
    </div>
  )
}
