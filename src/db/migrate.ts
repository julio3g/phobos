import chalk from 'chalk'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import ora from 'ora'
import postgres from 'postgres'
import { env } from '@/env'

const connection = postgres(env.DATABASE_URL, { max: 1 })
const db = drizzle(connection)

const spinner = ora('🔄 Running migrations...').start()
const start = Date.now()

try {
  await migrate(db, { migrationsFolder: 'drizzle' })

  const end = Date.now()

  spinner.succeed(
    chalk.greenBright(`Migrations completed in ${end - start}ms 🎉`)
  )
} catch (err) {
  spinner.fail(chalk.red('❌ Migration failed'))
  console.error(err)
  process.exit(1)
} finally {
  await connection.end()
  process.exit(0)
}
