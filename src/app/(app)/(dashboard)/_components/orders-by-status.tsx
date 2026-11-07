import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Dashboard } from '@/db/queries/dashboard'
import {
  getOrderStatusIcon,
  orderStatusOptions,
} from '@/utils/get-label-and-icons'

export function OrdersByStatus({
  statusCounts,
}: Pick<Dashboard, 'statusCounts'>) {
  const counts = new Map<string, number>(
    statusCounts.map(row => [row.status, row.orders])
  )
  const total = statusCounts.reduce((sum, row) => sum + row.orders, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordens por status</CardTitle>
        <CardDescription>
          {total.toLocaleString('pt-BR')} no período · canceladas não entram no
          faturamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderStatusOptions.map(({ value: status }) => {
          const count = counts.get(status) ?? 0
          const percent = total > 0 ? (count / total) * 100 : 0
          const { icon: Icon, label, bar } = getOrderStatusIcon(status)

          return (
            <div key={status} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                  {label}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {count}
                  {total > 0 ? ` · ${Math.round(percent)}%` : ''}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${bar}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
