import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server'
import { marginTypeEnum } from '@/db/schema/enums'
import { getSortingStateParser } from '@/lib/data-table-parsers'
import { z } from '@/lib/z'
import type { Product } from '../schema'

// colunas permitidas em ?sort= (ids de coluna da tabela, não o tipo da linha)
export const sortableProductColumns = [
  'name',
  'variant',
  'totalCost',
  'salePrice',
  'createdAt',
] as const satisfies readonly (keyof Product)[]

export type SortableProductColumn = (typeof sortableProductColumns)[number]

export const searchParamsCacheProducts = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString.withDefault(''),
  sort: getSortingStateParser<SortableProductColumn>(
    sortableProductColumns
  ).withDefault([{ id: 'createdAt', desc: true }]),
})

const productFields = {
  name: z.string().trim().min(1, { error: 'Nome é obrigatório' }),
  variant: z.string().trim().optional(),
  imageUrl: z.url({ error: 'URL inválida' }).optional(),
  description: z.string().trim().optional(),
  value: z.coerce.number<number>().nonnegative().optional(),
  laborMinutes: z.coerce
    .number<number>()
    .int()
    .nonnegative({ error: 'Tempo não pode ser negativo' }),
  hourlyRate: z.coerce
    .number<number>()
    .nonnegative({ error: 'Valor/hora não pode ser negativo' }),
  // percent = markup | margin = margem sobre a venda | fixed = R$
  marginType: z.enum(marginTypeEnum.enumValues).default('percent'),
  marginValue: z.coerce
    .number<number>()
    .nonnegative({ error: 'Margem é obrigatória' }),
  // custo de material, mão de obra e preço são calculados no servidor
  materials: z
    .array(
      z.object({
        materialId: z.string().min(1, { error: 'Selecione o material' }),
        quantity: z.coerce
          .number<number>()
          .positive({ error: 'Quantidade deve ser maior que zero' }),
      })
    )
    .default([])
    .refine(
      items => new Set(items.map(i => i.materialId)).size === items.length,
      { error: 'Material repetido na composição' }
    ),
}

export const createProductSchema = z
  .object(productFields)
  .refine(p => p.marginType !== 'margin' || p.marginValue < 100, {
    error: 'Margem sobre a venda deve ser menor que 100%',
    path: ['marginValue'],
  })

export const updateProductSchema = createProductSchema

export type GetProductsSchema = Awaited<
  ReturnType<typeof searchParamsCacheProducts.parse>
>

export type CreateProductInput = z.input<typeof createProductSchema>

export type CreateProductSchema = z.infer<typeof createProductSchema>

export type UpdateProductSchema = z.infer<typeof updateProductSchema>
