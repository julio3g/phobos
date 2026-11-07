'use client'

import type * as React from 'react'
import {
  Body,
  Close,
  Content,
  Description,
  DialogDrawer,
  Footer,
  Header,
  Title,
} from '@/components/dialog-drawer'
import { Button } from '@/components/ui/button'

export interface ViewField {
  label: string
  value: React.ReactNode
  /** ocupa a linha toda */
  wide?: boolean
}

interface ViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: ViewField[]
  children?: React.ReactNode
}

/** Dialog somente leitura: grade de campos (vazios viram "—") + extras. */
export function ViewDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  children,
}: ViewDialogProps) {
  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Content className="flex flex-col gap-6 sm:max-w-2xl">
        <Header className="text-left">
          <Title>{title}</Title>
          {description ? <Description>{description}</Description> : null}
        </Header>
        <Body className="max-h-[70vh] space-y-6 overflow-y-auto">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {fields.map(field => (
              <div
                key={field.label}
                className={field.wide ? 'sm:col-span-2' : undefined}
              >
                <dt className="text-muted-foreground">{field.label}</dt>
                <dd className="font-medium">{field.value || '—'}</dd>
              </div>
            ))}
          </dl>
          {children}
        </Body>
        <Footer className="pt-0 max-sm:px-4 max-sm:pb-4">
          <Close asChild>
            <Button type="button">Fechar</Button>
          </Close>
        </Footer>
      </Content>
    </DialogDrawer>
  )
}
