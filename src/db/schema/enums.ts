import { pgEnum } from 'drizzle-orm/pg-core'

const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member'])

export { userRoleEnum }
