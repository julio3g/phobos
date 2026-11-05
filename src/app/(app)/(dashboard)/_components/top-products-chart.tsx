'use client'

import {
  type ChartConfig,
  EChartsBarChart,
} from '@/components/evilcharts/charts/echarts-bar-chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'

const config = {
  revenue: {
    label: 'Faturamento',
    colors: { light: ['#6366f1'], dark: ['#818cf8'] },
  },
} satisfies ChartConfig

type ProductPoint = { name: string; revenue: number }

const truncate = (value: string) =>
  value.length > 18 ? `${value.slice(0, 17)}…` : value

export function TopProductsChart({ data }: { data: ProductPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos mais vendidos</CardTitle>
        <CardDescription>Top 5 por faturamento</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground text-sm">
            Nenhuma venda no período.
          </p>
        ) : (
          <EChartsBarChart
            data={data}
            config={config}
            xDataKey="name"
            layout="horizontal"
            className="h-72 w-full"
          >
            <EChartsBarChart.Bar dataKey="revenue" variant="gradient" />
            <EChartsBarChart.YAxis tickFormatter={truncate} />
            <EChartsBarChart.Tooltip valueFormatter={formatCurrency} />
          </EChartsBarChart>
        )}
      </CardContent>
    </Card>
  )
}
