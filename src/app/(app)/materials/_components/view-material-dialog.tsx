'use client'

import { StatusBadge } from '@/components/status-badge'
import { ViewDialog } from '@/components/view-dialog'
import type { Material } from '@/db/schema'
import { formatCurrency } from '@/lib/format'
import { getArchivedIcon } from '@/utils/get-label-and-icons'

interface ViewMaterialDialogProps {
  material: Material | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewMaterialDialog({
  material,
  open,
  onOpenChange,
}: ViewMaterialDialogProps) {
  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={material?.name ?? 'Material'}
      description="Dados do material"
      imageUrl={material?.imageUrl}
      fields={
        material
          ? [
              { label: 'Marca', value: material.brand },
              { label: 'Variação', value: material.variant },
              {
                label: 'Embalagem',
                value: `${formatCurrency(material.packagePrice)} / ${material.packageQuantity} ${material.unit}`,
              },
              {
                label: 'Custo unitário',
                value: `${formatCurrency(material.unitCost, { maximumFractionDigits: 4 })} / ${material.unit}`,
              },
              {
                label: 'Situação',
                value: (
                  <StatusBadge meta={getArchivedIcon(!!material.archivedAt)} />
                ),
              },
              {
                label: 'Link de compra',
                value: material.purchaseUrl ? (
                  <a
                    href={material.purchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all underline underline-offset-4"
                  >
                    {material.purchaseUrl}
                  </a>
                ) : null,
              },
            ]
          : []
      }
    />
  )
}
