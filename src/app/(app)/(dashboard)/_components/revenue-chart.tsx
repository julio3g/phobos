'use client'

import {
  type ChartConfig,
  EChartsAreaChart,
} from '@/components/evilcharts/charts/echarts-area-chart'
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
  profit: {
    label: 'Lucro',
    colors: { light: ['#10b981'], dark: ['#34d399'] },
  },
} satisfies ChartConfig

type RevenuePoint = {
  date: string // yyyy-MM-dd
  revenue: number
  profit: number
}

const compact = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

// yyyy-MM-dd -> dd/MM
const formatDay = (value: string) => `${value.slice(8, 10)}/${value.slice(5, 7)}`

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento e lucro</CardTitle>
        <CardDescription>Por dia, no período selecionado</CardDescription>
      </CardHeader>
      <CardContent>
        <EChartsAreaChart
          data={data}
          config={config}
          xDataKey="date"
          curveType="monotone"
          className="h-72 w-full"
        >
          <EChartsAreaChart.Area dataKey="revenue" variant="gradient" />
          <EChartsAreaChart.Area dataKey="profit" variant="gradient" />
          <EChartsAreaChart.Grid />
          <EChartsAreaChart.XAxis tickFormatter={formatDay} />
          <EChartsAreaChart.YAxis tickFormatter={value => compact.format(value)} />
          <EChartsAreaChart.Tooltip valueFormatter={formatCurrency} />
          <EChartsAreaChart.Legend />
        </EChartsAreaChart>
      </CardContent>
    </Card>
  )
}
