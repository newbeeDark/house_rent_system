import fetch from 'node-fetch'

async function run() {
  const res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test@1234',
      role: 'tenant'
    })
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('Register failed:', data)
    process.exit(1)
  }
  console.log('Registered test user:', data.user.email)
}

run()