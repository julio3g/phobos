import {
  Archive,
  Building2,
  CircleCheck,
  CircleDashed,
  CircleDollarSign,
  CircleX,
  Eye,
  FileEdit,
  Hammer,
  type LucideIcon,
  RotateCcw,
  ShieldCheck,
  User,
  UserCog,
  Wallet,
} from 'lucide-react'
import type { OrderStatus, PaymentStatus } from '@/lib/orders'

export const orderStatusIcons: Record<OrderStatus, LucideIcon> = {
  draft: FileEdit,
  confirmed: CircleCheck,
  in_production: Hammer,
  completed: CircleCheck,
  cancelled: CircleX,
}

// cores das barras do dashboard (uma por status)
export const orderStatusBarColors: Record<OrderStatus, string> = {
  draft: 'bg-muted-foreground/50',
  confirmed: 'bg-sky-500',
  in_production: 'bg-amber-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-500',
}

export const paymentStatusIcons: Record<PaymentStatus, LucideIcon> = {
  pending: CircleDashed,
  partial: Wallet,
  paid: CircleDollarSign,
  refunded: RotateCcw,
}

export const personTypeIcons = {
  individual: User,
  company: Building2,
} as const satisfies Record<string, LucideIcon>

export const archivedIcons = {
  false: CircleCheck,
  true: Archive,
} as const satisfies Record<string, LucideIcon>

export const userRoleIcons = {
  owner: ShieldCheck,
  admin: UserCog,
  member: Eye,
} as const satisfies Record<string, LucideIcon>
