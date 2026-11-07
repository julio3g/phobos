'use client'

import { Pencil } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import type { ProductListItem } from '@/db/queries/products'
import type { MaterialOption } from './product-form'
import { UpdateProductDialog } from './update-product-dialog'

interface EditProductButtonProps {
  product: ProductListItem
  materialOptions: MaterialOption[]
}

export function EditProductButton({
  product,
  materialOptions,
}: EditProductButtonProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Editar <Pencil size={16} />
      </Button>
      <UpdateProductDialog
        product={product}
        open={open}
        onOpenChange={setOpen}
        materialOptions={materialOptions}
      />
    </>
  )
}
