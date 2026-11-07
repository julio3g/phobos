import type { SQL } from 'drizzle-orm'

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type EmptyProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  keyof React.ComponentProps<T>
>

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export interface QueryBuilderOpts {
  where?: SQL
  orderBy?: SQL
  distinct?: boolean
  nullish?: boolean
}

// opções para selects (clientes e produtos nos formulários de ordem)
export interface ClientOption {
  id: string
  name: string
}

export interface ProductOption {
  id: string
  name: string
  variant: string | null
  salePrice: number
}
