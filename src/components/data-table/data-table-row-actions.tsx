'use client'

import { Ellipsis } from 'lucide-react'
import type * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableRowActionsProps {
  /** itens extras (submenus, links) entre as ações padrão e o "Excluir" */
  children?: React.ReactNode
  onView?: () => void
  onUpdate?: () => void
  onDelete?: () => void
}

/** Menu "..." de cada linha: Ver / Editar / (extras) / Excluir. */
export function DataTableRowActions({
  children,
  onView,
  onUpdate,
  onDelete,
}: DataTableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Abrir menu"
            variant="ghost"
            className="flex size-8 p-0"
          />
        }
      >
        <Ellipsis className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {onView && <DropdownMenuItem onClick={onView}>Ver</DropdownMenuItem>}
        {onUpdate && (
          <DropdownMenuItem onClick={onUpdate}>Editar</DropdownMenuItem>
        )}
        {children}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
