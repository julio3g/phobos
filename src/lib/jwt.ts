import { type JWTPayload, jwtVerify, SignJWT } from 'jose'
import type { Member } from '@/db/schema'
import { env } from '@/env'

const secret = new TextEncoder().encode(env.JWT_SECRET)

type TokenPayload = { sub: string; role: Member['role'] } & JWTPayload

export async function signJwt(payload: TokenPayload, exp = '30d') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .setSubject(payload.sub)
    .sign(secret)
}

export async function verifyJwt<T = TokenPayload>(token: string) {
  const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
  return payload as T
}
