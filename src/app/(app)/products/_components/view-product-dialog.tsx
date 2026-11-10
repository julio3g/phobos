'use client'

import { ViewDialog } from '@/components/view-dialog'
import type { ProductListItem } from '@/db/queries/products'
import { formatCurrency } from '@/lib/format'
import { marginTypeLabels } from '@/lib/pricing'
import type { MaterialOption } from './product-form'

interface ViewProductDialogProps {
  product: ProductListItem | null
  materialOptions: MaterialOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewProductDialog({
  product,
  materialOptions,
  open,
  onOpenChange,
}: ViewProductDialogProps) {
  const byId = new Map(materialOptions.map(m => [m.id, m]))

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={product?.name ?? 'Produto'}
      description={product?.variant ?? 'Dados do produto'}
      imageUrl={product?.imageUrl}
      fields={
        product
          ? [
              {
                label: 'Materiais',
                value: formatCurrency(product.materialCost),
              },
              {
                label: `Mão de obra (${product.laborMinutes} min)`,
                value: formatCurrency(product.laborCost),
              },
              {
                label: 'Custo total',
                value: formatCurrency(product.totalCost),
              },
              {
                label: 'Preço de venda',
                value: formatCurrency(product.salePrice),
              },
              {
                label: marginTypeLabels[product.marginType],
                value: product.marginValue,
              },
              { label: 'Descrição', value: product.description, wide: true },
            ]
          : []
      }
    >
      {product && product.materials.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Composição</h3>
          <ul className="divide-y rounded-md border text-sm">
            {product.materials.map(line => {
              const material = byId.get(line.materialId)
              return (
                <li
                  key={line.materialId}
                  className="flex items-center justify-between gap-2 px-3 py-2"
                >
                  <span className="truncate">
                    {material
                      ? [material.name, material.brand, material.variant]
                          .filter(Boolean)
                          .join(' · ')
                      : 'Material arquivado'}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {line.quantity} {material?.unit}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </ViewDialog>
  )
}
