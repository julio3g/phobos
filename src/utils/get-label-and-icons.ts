import type { VariantProps } from 'class-variance-authority'
import {
  Archive,
  Building2,
  Circle,
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
import type { badgeVariants } from '@/components/ui/badge'
import type { Member, Order } from '@/db/schema'
import type { paymentStatusEnum, personTypeEnum } from '@/db/schema/enums'

export type StatusMeta = {
  label: string
  icon: LucideIcon
  variant?: VariantProps<typeof badgeVariants>['variant']
  color?: string // classes tailwind do texto
  bar?: string // classes tailwind de barra (gráficos)
}

type OrderStatus = Order['status']
type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number]
type PersonType = (typeof personTypeEnum.enumValues)[number]
type MemberRole = Member['role']

const fallback = (status: string): StatusMeta => ({
  label: status,
  icon: Circle,
  variant: 'outline',
  color: 'text-muted-foreground',
})

const orderStatusMeta = {
  draft: {
    label: 'Rascunho',
    icon: FileEdit,
    color: 'text-muted-foreground',
    bar: 'bg-muted-foreground/50',
    variant: 'outline',
  },
  confirmed: {
    label: 'Confirmado',
    icon: CircleCheck,
    color: 'text-blue-600',
    bar: 'bg-sky-500',
    variant: 'info',
  },
  in_production: {
    label: 'Em produção',
    icon: Hammer,
    color: 'text-amber-600',
    bar: 'bg-amber-500',
    variant: 'warning',
  },
  completed: {
    label: 'Concluído',
    icon: CircleCheck,
    color: 'text-green-600',
    bar: 'bg-emerald-500',
    variant: 'success',
  },
  cancelled: {
    label: 'Cancelado',
    icon: CircleX,
    color: 'text-red-600',
    bar: 'bg-red-500',
    variant: 'destructive',
  },
} satisfies Record<OrderStatus, StatusMeta>

const paymentStatusMeta = {
  pending: {
    label: 'Pendente',
    icon: CircleDashed,
    variant: 'warning',
    color: 'text-amber-600',
  },
  partial: {
    label: 'Parcial',
    icon: Wallet,
    variant: 'info',
    color: 'text-blue-600',
  },
  paid: {
    label: 'Pago',
    icon: CircleDollarSign,
    variant: 'success',
    color: 'text-green-600',
  },
  refunded: {
    label: 'Reembolsado',
    icon: RotateCcw,
    variant: 'destructive',
    color: 'text-red-600',
  },
} satisfies Record<PaymentStatus, StatusMeta>

const personTypeMeta = {
  individual: { label: 'PF', icon: User, variant: 'secondary' },
  company: { label: 'PJ', icon: Building2, variant: 'info' },
} satisfies Record<PersonType, StatusMeta>

const memberRoleMeta = {
  owner: { label: 'Proprietário', icon: ShieldCheck, variant: 'default' },
  admin: { label: 'Administrador', icon: UserCog, variant: 'info' },
  member: { label: 'Membro', icon: Eye, variant: 'secondary' },
} satisfies Record<MemberRole, StatusMeta>

// usuário ativo/inativo
const activeMeta = {
  true: { label: 'Ativo', icon: CircleCheck, variant: 'success' },
  false: { label: 'Inativo', icon: CircleX, variant: 'destructive' },
} satisfies Record<'true' | 'false', StatusMeta>

// situação de itens arquiváveis (materiais, produtos)
const archivedMeta = {
  false: { label: 'Ativo', icon: CircleCheck, variant: 'success' },
  true: { label: 'Arquivado', icon: Archive, variant: 'warning' },
} satisfies Record<'true' | 'false', StatusMeta>

const getOrderStatusIcon = (status: OrderStatus): StatusMeta =>
  orderStatusMeta[status] ?? fallback(status)

const getPaymentStatusIcon = (status: PaymentStatus): StatusMeta =>
  paymentStatusMeta[status] ?? fallback(status)

const getPersonTypeIcon = (type: PersonType): StatusMeta =>
  personTypeMeta[type] ?? fallback(type)

const getMemberIcon = (role: MemberRole): StatusMeta =>
  memberRoleMeta[role] ?? fallback(role)

const getActiveIcon = (active: boolean): StatusMeta => activeMeta[`${active}`]

const getArchivedIcon = (archived: boolean): StatusMeta =>
  archivedMeta[`${archived}`]

/** Opções { value, label, icon } para filtros e selects. */
function toOptions<T extends string>(
  meta: Record<T, StatusMeta>,
  labels?: Partial<Record<T, string>>
) {
  return (Object.keys(meta) as T[]).map(value => ({
    value,
    label: labels?.[value] ?? meta[value].label,
    icon: meta[value].icon,
  }))
}

const orderStatusOptions = toOptions(orderStatusMeta)
const paymentStatusOptions = toOptions(paymentStatusMeta)
const personTypeOptions = toOptions(personTypeMeta)
const memberRoleOptions = toOptions(memberRoleMeta)
const archivedOptions = toOptions(archivedMeta, {
  false: 'Ativos',
  true: 'Arquivados',
})

const formatOrderNumber = (n: number) => `#${String(n).padStart(4, '0')}`

export {
  archivedOptions,
  getActiveIcon,
  formatOrderNumber,
  getArchivedIcon,
  getMemberIcon,
  getOrderStatusIcon,
  getPaymentStatusIcon,
  getPersonTypeIcon,
  memberRoleOptions,
  orderStatusOptions,
  paymentStatusOptions,
  personTypeOptions,
}
