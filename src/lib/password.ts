import { hash, verify } from '@node-rs/argon2'

// OWASP min p/ argon2id: m=19 MiB, t=2, p=1 (= defaults da lib)
const OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 }

export const hashPassword = (password: string) => hash(password, OPTIONS)

export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await verify(passwordHash, password)
  } catch {
    return false // hash malformado
  }
}

// hash dummy p/ timing igual quando user não existe
let dummy: Promise<string> | undefined
export const getDummyHash = () => (dummy ??= hashPassword('dummy-password'))
