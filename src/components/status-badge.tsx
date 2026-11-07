import { Badge } from '@/components/ui/badge'
import type { StatusMeta } from '@/utils/get-label-and-icons'

/** Badge com ícone + label, a partir do meta de get-label-and-icons. */
export function StatusBadge({
  meta: { label, icon: Icon, variant },
}: {
  meta: StatusMeta
}) {
  return (
    <Badge variant={variant} className="py-1 [&>svg]:size-3.5">
      <Icon aria-hidden />
      {label}
    </Badge>
  )
}
