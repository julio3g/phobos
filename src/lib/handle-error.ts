import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { z } from '@/lib/z'

export function getErrorMessage(err: unknown) {
  const unknownError = 'Algo deu errado, tente novamente mais tarde.'

  if (err instanceof z.ZodError)
    return err.issues.map(issue => issue.message).join('\n')

  if (err instanceof Error) return err.message

  if (isRedirectError(err)) throw err

  return unknownError
}
