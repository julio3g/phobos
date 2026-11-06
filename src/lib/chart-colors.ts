import type { ChartConfig } from '@/components/evilcharts/charts/echarts-area-chart'

// ECharts desenha em canvas e não resolve `var(--chart-*)`, então as cores
// ficam aqui, em hex, alinhadas com --chart-1 (indigo) e --chart-2 (verde) do tema.
export const chartColors = {
  revenue: { light: ['#6366f1'], dark: ['#818cf8'] },
  profit: { light: ['#10b981'], dark: ['#34d399'] },
} satisfies Record<string, ChartConfig[string]['colors']>
