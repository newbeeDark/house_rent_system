import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import ThemeToggle from '../components/ThemeToggle'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const { login, loginByPhone } = useAuthStore()
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('123@example.com')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('!123456')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{email?: string, phone?: string, password?: string}>({})

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    const errs: typeof errors = {}
    
    if (loginType === 'email') {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Invalid email'
    } else {
      if (!/^1[3-9]\d{9}$/.test(phone)) errs.phone = 'Invalid phone number'
    }
    if (password.length < 6) errs.password = 'At least 6 characters'
    setErrors(errs)
    if (Object.keys(errs).length) {
      setLoading(false)
      return
    }
    
    try {
      if (loginType === 'email') {
        await login(email, password)
      } else {
        await loginByPhone(phone, password)
      }
      setMsg('Login success! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err: any) {
      setMsg(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container auth-bg">
      <div className="header"><ThemeToggle /></div>
      <Card style={{}}>
        <h1 className="title">Welcome back</h1>
        <p className="subtitle">Sign in to your account</p>
        
        <div className="field" style={{marginBottom: 16}}>
          <div className="btn-group">
            <button 
              className={`btn ${loginType === 'email' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setLoginType('email')}
            >
              Email Login
            </button>
            <button 
              className={`btn ${loginType === 'phone' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setLoginType('phone')}
            >
              Phone Login
            </button>
          </div>
        </div>
        
        <form onSubmit={submit}>
          {loginType === 'email' ? (
            <Input label="Email" placeholder="you@example.com" value={email} onChange={setEmail} error={errors.email} />
          ) : (
            <Input label="Phone" placeholder="13800138000" value={phone} onChange={setPhone} error={errors.phone} />
          )}
          <Input label="Password" type="password" placeholder="••••••" value={password} onChange={setPassword} error={errors.password} />
          <div className="row" style={{marginBottom:12}}>
            <span className="label">Use your {loginType === 'email' ? 'email' : 'phone'} and password</span>
            <a className="link" href="/register" aria-label="Forgot password">Forgot password?</a>
          </div>
          <div className="actions">
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
        {msg && <div className="subtitle" role="status" style={{marginTop:8, color: msg.includes('success') ? 'green' : 'tomato'}}>{msg}</div>}
        <p className="subtitle" style={{marginTop: 16, textAlign: 'center'}}>
          Don't have an account? <a className="link" href="/register">Sign up</a>
        </p>
      </Card>
    </div>
  )
}