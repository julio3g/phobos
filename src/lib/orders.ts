import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui/badge'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export const orderStatusLabels = {
  draft: 'Rascunho',
  confirmed: 'Confirmado',
  in_production: 'Em produção',
  completed: 'Concluído',
  cancelled: 'Cancelado',
} as const

export const paymentStatusLabels = {
  pending: 'Pendente',
  partial: 'Parcial',
  paid: 'Pago',
  refunded: 'Reembolsado',
} as const

export type OrderStatus = keyof typeof orderStatusLabels
export type PaymentStatus = keyof typeof paymentStatusLabels

export const orderStatusOptions = Object.entries(orderStatusLabels).map(
  ([value, label]) => ({ value, label })
)

export const paymentStatusOptions = Object.entries(paymentStatusLabels).map(
  ([value, label]) => ({ value, label })
)

export const orderStatusVariants: Record<OrderStatus, BadgeVariant> = {
  draft: 'outline',
  confirmed: 'info',
  in_production: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

export const paymentStatusVariants: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning',
  partial: 'info',
  paid: 'success',
  refunded: 'destructive',
}

export interface ClientOption {
  id: string
  name: string
}

export interface ProductOption {
  id: string
  name: string
  variant: string | null
  salePrice: number
}

export const formatOrderNumber = (n: number) => `#${String(n).padStart(4, '0')}`
