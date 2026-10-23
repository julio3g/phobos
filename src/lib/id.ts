import { customAlphabet } from 'nanoid'

const prefixes = { svc: 'svc', ord: 'ord' } as const

interface GenerateIdOptions {
  /**
   * O comprimento do ID gerado.
   * @default 12
   * @example 12 => "abc123def456"
   * */
  length?: number
  /**
   * O separador a ser usado entre o prefixo e o ID gerado.
   * @default "_"
   * @example "_" => "str_abc123"
   * */
  separator?: string
}

/**
 * Gera um ID exclusivo com prefixo e configuração opcionais.
 * @param prefixOrOptions A string de prefixo ou objeto de opções
 * @param inputOptions As opções para gerar o ID
 */
export function generateId(
  prefixOrOptions?: keyof typeof prefixes | GenerateIdOptions,
  inputOptions: GenerateIdOptions = {}
) {
  const finalOptions =
    typeof prefixOrOptions === 'object' ? prefixOrOptions : inputOptions

  const prefix =
    typeof prefixOrOptions === 'object' ? undefined : prefixOrOptions

  const { length = 12, separator = '_' } = finalOptions
  const id = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    length
  )()

  return prefix ? `${prefixes[prefix]}${separator}${id}` : id
}
