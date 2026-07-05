/**
 * Creates the first admin account (auth user + agent_admin_users profile).
 * Usage: node scripts/create-admin.mjs admin@culinova.sa StrongPassword "Full Name"
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const [email, password, fullName = 'Administrator'] = process.argv.slice(2)

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password> [full name]')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

const { data: created, error: authError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})

if (authError) {
  console.error('Auth user creation failed:', authError.message)
  process.exit(1)
}

const { error: profileError } = await supabase.from('agent_admin_users').insert({
  id: created.user.id,
  email,
  full_name: fullName,
  role: 'admin',
})

if (profileError) {
  console.error('Profile insert failed:', profileError.message)
  process.exit(1)
}

console.log(`Admin created: ${email} (${created.user.id})`)
console.log('You can now sign in to the admin panel.')
