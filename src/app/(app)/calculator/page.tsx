import type { Metadata } from 'next'
import { getOrganization } from '@/db/queries'
import { getMaterialOptions } from '@/db/queries/materials'
import { PricingCalculator } from './_components/pricing-calculator'

export const metadata: Metadata = { title: 'Calculadora de preço' }

export default async function CalculatorPage() {
  const [materialOptions, organization] = await Promise.all([
    getMaterialOptions(),
    getOrganization(),
  ])

  return (
    <div className="container mx-auto w-full space-y-6 px-4 md:px-8">
      <div className="space-y-1">
        <h1 className="font-medium text-2xl">Calculadora de preço</h1>
        <p className="text-muted-foreground text-sm">
          Monte o custo do produto, defina a margem e veja o preço de venda na
          hora. Salve como produto quando estiver satisfeito.
        </p>
      </div>
      <PricingCalculator
        materialOptions={materialOptions}
        defaultHourlyRate={organization?.defaultHourlyRate ?? 0}
      />
    </div>
  )
}
