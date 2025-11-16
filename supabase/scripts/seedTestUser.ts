import { supabaseAdmin } from '../config'

async function run() {
  const email = 'test@example.com'
  const password = 'Test@1234'

  // Try find existing user in public.users
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('email', email)
    .single()

  let userId = existing?.id

  if (!userId) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (error) {
      console.error('Seed error:', error.message)
      process.exit(1)
    }
    userId = created.user?.id || undefined
    if (!userId) {
      console.error('No user returned')
      process.exit(1)
    }
  }

  await supabaseAdmin
    .from('users')
    .update({ nickname: 'test', role: 'tenant' })
    .eq('id', userId as string)

  console.log('Seeded test user:', email)
}

run()