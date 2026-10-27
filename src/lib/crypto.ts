import { createHash, randomBytes } from 'node:crypto'

export function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex')
}

export function generateToken() {
  return randomBytes(32).toString('base64url')
}
