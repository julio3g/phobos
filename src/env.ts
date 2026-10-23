import { createEnv } from '@t3-oss/env-nextjs'
import { z } from '@/lib/z'

const appEnvSchema = z.enum(['development', 'test', 'preview', 'production'])
type AppEnv = z.infer<typeof appEnvSchema>

/**
 * Ambiente atual da aplicação.
 * Na Vercel: VERCEL_ENV (development | preview | production).
 * Local/CI: NODE_ENV (development | test | production).
 * NEXT_PUBLIC_VERCEL_ENV é a única variável disponível no client.
 */
export const appEnv: AppEnv = appEnvSchema
  .catch('development')
  .parse(
    process.env.NEXT_PUBLIC_VERCEL_ENV ??
      process.env.VERCEL_ENV ??
      process.env.NODE_ENV
  )

/**
 * Retorna uma função validadora que exige um valor quando o ambiente atual é igual ao especificado.
 *
 * @param env - Ambiente (VERCEL_ENV ?? NODE_ENV) em que o valor deve ser definido.
 * @returns Uma função que retorna false se o valor for falsy e o ambiente for o especificado; caso contrário, retorna true.
 */
const requiredOnEnv =
  (env: AppEnv) =>
  (value?: string): boolean =>
    env !== appEnv || Boolean(value)

/**
 * Configura o schema de validação para os valores das variáveis de ambiente.
 *
 * @returns O schema de validação para os valores das variáveis de ambiente.
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    COOKIE_ACCESS: z.string().min(1),
    ENCRYPTION_KEY: z.string().min(1),
    REDIS_URL: z
      .string()
      .optional()
      .refine(requiredOnEnv('development'), 'Required in development'),
    UPSTASH_REDIS_REST_URL: z
      .string()
      .optional()
      .refine(requiredOnEnv('production'), 'Required in production'),
    UPSTASH_REDIS_REST_TOKEN: z
      .string()
      .optional()
      .refine(requiredOnEnv('production'), 'Required in production'),
    CLOUDFLARE_ENDPOINT: z.url(),
    CLOUDFLARE_ACCESS_KEY_ID: z.string().nonempty(),
    CLOUDFLARE_SECRET_ACCESS_KEY: z.string().nonempty(),
    CLOUDFLARE_R2_BUCKET_NAME: z.string().nonempty(),
    CLOUDFLARE_FILE_BASE_PATH: z.url(),
  },
  client: {
    // Vercel injeta sem protocolo (ex: app.vercel.app) e só existe na Vercel
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_ENV: z
      .enum(['development', 'preview', 'production'])
      .optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  },
  emptyStringAsUndefined: true,
})

/**
 * Verifica se o ambiente atual (VERCEL_ENV ?? NODE_ENV) corresponde a algum dos ambientes informados.
 *
 * @param allowed Lista de ambientes permitidos para validação (ex: 'development', 'preview', 'production').
 * @returns Um valor boolean indicando se o ambiente atual está entre os ambientes informados.
 *
 * @example
 * isEnv('development') // true se estiver em development
 * isEnv('preview', 'production') // true se estiver em preview ou production
 */
export function isEnv(...allowed: AppEnv[]) {
  return allowed.includes(appEnv)
}
