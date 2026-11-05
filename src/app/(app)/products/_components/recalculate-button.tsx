'use client'

import { Loader2, RefreshCw } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { recalculateProduct } from '@/db/actions'

export function RecalculateButton({
  id,
  outdated,
}: {
  id: string
  outdated: boolean
}) {
  const [isPending, startTransition] = React.useTransition()

  function onClick() {
    startTransition(async () => {
      const { error } = await recalculateProduct({ id })
      toast.add(
        error
          ? { type: 'error', description: error }
          : { type: 'success', description: 'Custos recalculados' }
      )
    })
  }

  return (
    <Button
      variant={outdated ? 'default' : 'outline'}
      disabled={isPending}
      onClick={onClick}
      title="Atualiza o custo dos insumos com os preços atuais dos materiais"
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <RefreshCw className="size-4" />
      )}
      Recalcular
    </Button>
  )
}
