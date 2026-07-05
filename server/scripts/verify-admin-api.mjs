/**
 * End-to-end check of the admin API: login -> data feed -> summary.
 * Usage: node scripts/verify-admin-api.mjs <email> <password>
 */
const base = process.env.API_URL ?? 'http://localhost:3000/api'

const [email, password] = process.argv.slice(2)
if (!email || !password) {
  console.error('Usage: node scripts/verify-admin-api.mjs <email> <password>')
  process.exit(1)
}

const loginRes = await fetch(`${base}/admin/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

const login = await loginRes.json()
if (!loginRes.ok) {
  console.error('LOGIN FAILED:', loginRes.status, login)
  process.exit(1)
}
console.log('LOGIN OK —', login.profile.email, `(${login.profile.role})`)

const dataRes = await fetch(`${base}/admin/data`, {
  headers: { Authorization: `Bearer ${login.accessToken}` },
})
const data = await dataRes.json()
if (!dataRes.ok) {
  console.error('DATA FEED FAILED:', dataRes.status, data)
  process.exit(1)
}

console.log('DATA FEED OK —')
console.log('  leads:', data.leads.length)
console.log('  conversations:', data.conversations.length)
console.log('  training:', data.training.length)
console.log('  users:', data.users.length)
console.log('  logs:', data.logs.length)
console.log('  settings keys:', Object.keys(data.settings ?? {}).length)
console.log('ADMIN API END-TO-END: OK')
