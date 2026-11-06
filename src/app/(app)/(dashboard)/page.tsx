import { Calculator } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getDashboard } from '@/db/queries/dashboard'
import { searchParamsCacheDashboard } from '@/db/validators'
import { type ResolvedRange, resolveRange } from '@/lib/date-range'
import type { SearchParams } from '@/types'
import { DateRangeFilter } from './_components/date-range-filter'
import { KpiCards } from './_components/kpi-cards'
import { OrdersByStatus } from './_components/orders-by-status'
import { RecentOrders } from './_components/recent-orders'
import { RevenueChart } from './_components/revenue-chart'
import { TopProductsChart } from './_components/top-products-chart'

export const metadata: Metadata = { title: 'Home' }

interface HomeProps {
  searchParams: Promise<SearchParams>
}

export default async function Home(props: HomeProps) {
  const range = resolveRange(
    searchParamsCacheDashboard.parse(await props.searchParams)
  )

  return (
    <div className="container mx-auto w-full space-y-6 px-4 md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-medium text-2xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Resumo das suas ordens no período
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/calculadora">
                <Calculator /> Calcular preço
              </Link>
            }
          />
          <DateRangeFilter from={range.from} to={range.to} />
        </div>
      </div>

      <React.Suspense
        key={`${range.from}:${range.to}`}
        fallback={<DashboardSkeleton />}
      >
        <DashboardContent range={range} />
      </React.Suspense>
    </div>
  )
}

async function DashboardContent({ range }: { range: ResolvedRange }) {
  const data = await getDashboard(range)

  return (
    <div className="space-y-4">
      <KpiCards current={data.current} previous={data.previous} />
      <RevenueChart data={data.daily} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopProductsChart
          data={data.topProducts.map(p => ({
            name: p.variant ? `${p.name} — ${p.variant}` : p.name,
            revenue: p.revenue,
          }))}
        />
        <OrdersByStatus statusCounts={data.statusCounts} />
      </div>
      <RecentOrders recentOrders={data.recentOrders} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {['revenue', 'profit', 'margin', 'orders', 'ticket', 'receivable'].map(
          key => (
            <Skeleton key={key} className="h-32 rounded-xl" />
          )
        )}
      </div>
      <Skeleton className="h-96 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  )
}
