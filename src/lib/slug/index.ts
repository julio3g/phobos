/**
 * slugify — adaptado de https://github.com/simov/slugify (v1.6.9, MIT)
 * Convertido para TypeScript/ESM.
 */
import { charMap as baseCharMap } from './charmap'
import { locales } from './locales'

export interface SlugifyOptions {
  /** Caractere que substitui espaços (padrão: "-") */
  replacement?: string
  /** Regex de caracteres a remover */
  remove?: RegExp
  /** Converte para minúsculas */
  lower?: boolean
  /** Remove tudo que não for letra, número ou espaço */
  strict?: boolean
  /** Regras específicas de idioma (ex.: "pt", "de", "fr") */
  locale?: string
  /** Remove espaços nas pontas (padrão: true) */
  trim?: boolean
}

// cópia local para que extend() não altere o módulo importado
const charMap: Record<string, string> = { ...baseCharMap }

export function slugify(
  input: string,
  options?: SlugifyOptions | string
): string {
  if (typeof input !== 'string') {
    throw new Error('slugify: string argument expected')
  }

  const opts: SlugifyOptions =
    typeof options === 'string' ? { replacement: options } : (options ?? {})

  const locale = (opts.locale && locales[opts.locale]) || {}
  const replacement = opts.replacement ?? '-'
  const trim = opts.trim ?? true

  let slug = input
    .normalize()
    .split('')
    .reduce((result, ch) => {
      let append = locale[ch]
      if (append === undefined) append = charMap[ch]
      if (append === undefined) append = ch
      if (append === replacement) append = ' '
      return (
        result + append.replace(opts.remove ?? /[^\w\s$*_+~.()'"!\-:@]+/g, '')
      )
    }, '')

  if (opts.strict) slug = slug.replace(/[^A-Za-z0-9\s]/g, '')
  if (trim) slug = slug.trim()

  // múltiplos espaços viram um único separador
  slug = slug.replace(/\s+/g, replacement)

  if (opts.lower) slug = slug.toLowerCase()

  return slug
}

/** Adiciona/sobrescreve mapeamentos de caracteres */
export function extend(customMap: Record<string, string>): void {
  Object.assign(charMap, customMap)
}

export default slugify
