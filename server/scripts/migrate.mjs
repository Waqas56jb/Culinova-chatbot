/**
 * Applies supabase/migrations/*.sql to the Supabase Postgres database.
 * Usage: set SUPABASE_DB_URL in server/.env, then `npm run db:migrate`.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import 'dotenv/config'
import pg from 'pg'

const dbUrl = process.env.SUPABASE_DB_URL

if (!dbUrl) {
  console.error('SUPABASE_DB_URL is not set in server/.env')
  console.error('Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres')
  process.exit(1)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.resolve(here, '../../supabase/migrations')

const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()

if (files.length === 0) {
  console.log('No migration files found.')
  process.exit(0)
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log('Connected to Supabase Postgres.')

  for (const file of files) {
    const sql = readFileSync(path.join(migrationsDir, file), 'utf8')
    console.log(`Applying ${file}...`)
    await client.query(sql)
    console.log(`  done.`)
  }

  const { rows } = await client.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' and table_name like 'agent_%' order by table_name`,
  )
  console.log('\nagent_ tables now in database:')
  for (const row of rows) console.log(`  - ${row.table_name}`)
  console.log('\nMigration complete.')
} catch (error) {
  console.error('Migration failed:', error.message)
  process.exitCode = 1
} finally {
  await client.end()
}
