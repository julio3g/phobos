import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env, isEnv } from '@/env'
import * as schema from './schema'

const client = postgres(env.DATABASE_URL, {
  max: 10, // máximo de conexões simultâneas
  idle_timeout: 120, // fecha conexões ociosas após 120s (era 20s — reduz reconexões/handshake repetido em tráfego intermitente)
  connect_timeout: 10,
  fetch_types: false, // schema não usa colunas array/enum-array — pula query pg_catalog.pg_type por conexão
})

export const db = drizzle(client, { schema, logger: isEnv('development') })

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
