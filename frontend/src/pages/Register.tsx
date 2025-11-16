import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import ThemeToggle from '../components/ThemeToggle'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import { useNavigate } from 'react-router-dom'

const roles = [
  { value: 'tenant', label: 'Tenant (租客)' },
  { value: 'landlord', label: 'Landlord (房东)' },
  { value: 'agent', label: 'Agent (中介)' }
] as const

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [role, setRole] = useState<typeof roles[number]['value']>('tenant')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{email?: string, phone?: string, password?: string, nickname?: string}>({})

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    const errs: typeof errors = {}
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Invalid email'
    if (phone && !isValidPhone(phone)) errs.phone = 'Invalid phone number'
    if (password.length < 6) errs.password = 'At least 6 characters'
    if (nickname && nickname.length < 2) errs.nickname = 'At least 2 characters'
    setErrors(errs)
    if (Object.keys(errs).length) {
      setLoading(false)
      return
    }
    try {
      const phoneDigits = phone ? normalizePhone(phone) : undefined
      await register(email, password, role, phoneDigits || undefined, nickname || undefined)
      setMsg('Register success! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err: any) {
      setMsg(err.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="header"><ThemeToggle /></div>
      <Card>
        <h1 className="title">Create account</h1>
        <p className="subtitle">Choose your role and sign up</p>
        <form onSubmit={submit}>
          <Input label="Email" placeholder="you@example.com" value={email} onChange={setEmail} error={errors.email} />
          <Input label="Phone (optional)" placeholder="13800138000" value={phone} onChange={setPhone} error={errors.phone} />
          <Input label="Nickname (optional)" placeholder="Your nickname" value={nickname} onChange={setNickname} error={errors.nickname} />
          <Input label="Password" type="password" placeholder="••••••" value={password} onChange={setPassword} error={errors.password} />
          <div className="field">
            <label className="label">Role</label>
            <select className="select" value={role} onChange={e => setRole(e.target.value as any)}>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="actions">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
            <a className="btn btn-outline" href="/login">Already have an account?</a>
          </div>
        </form>
        {msg && <div className="subtitle" role="status" style={{marginTop:8, color: msg.includes('success') ? 'green' : 'tomato'}}>{msg}</div>}
      </Card>
    </div>
  )
}
import { isValidPhone, normalizePhone } from '../utils/phone'