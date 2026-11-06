import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Dashboard } from '@/db/queries/dashboard'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { orderStatusIcons } from '@/lib/icons'
import {
  formatOrderNumber,
  type OrderStatus,
  orderStatusLabels,
  orderStatusVariants,
} from '@/lib/orders'

function StatusBadge({ status }: { status: OrderStatus }) {
  const Icon = orderStatusIcons[status]
  return (
    <Badge
      variant={orderStatusVariants[status]}
      className="py-1 [&>svg]:size-3.5"
    >
      <Icon aria-hidden />
      {orderStatusLabels[status]}
    </Badge>
  )
}

export function RecentOrders({
  recentOrders,
}: Pick<Dashboard, 'recentOrders'>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas ordens</CardTitle>
        <CardDescription>As 5 mais recentes</CardDescription>
        <CardAction>
          <Link
            href="/orders"
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            Ver todas
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {recentOrders.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">
            Nenhuma ordem criada ainda.
          </p>
        ) : (
          <ul className="divide-y">
            {recentOrders.map(order => (
              <li
                key={order.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">
                    {formatOrderNumber(order.number)} · {order.clientName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatShortDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="w-24 text-right font-medium text-sm tabular-nums">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
