import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import ThemeToggle from '../components/ThemeToggle'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Profile() {
  const { user, fetchProfile, updateProfile, logout } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    avatar_url: ''
  })
  const [errors, setErrors] = useState<{nickname?: string, phone?: string}>({})
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      fetchProfile().catch(console.error)
    } else {
      setFormData({
        nickname: user.nickname || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    
    const errs: typeof errors = {}
    if (formData.phone && !isValidPhone(formData.phone)) {
      errs.phone = 'Invalid phone number'
    }
    if (formData.nickname && formData.nickname.length < 2) {
      errs.nickname = 'At least 2 characters'
    }
    setErrors(errs)
    
    if (Object.keys(errs).length) {
      setLoading(false)
      return
    }

    try {
      await updateProfile({
        nickname: formData.nickname || undefined,
        phone: formData.phone ? normalizePhone(formData.phone) : undefined,
        avatar_url: formData.avatar_url || undefined
      })
      setMsg('Profile updated successfully!')
      setEditing(false)
    } catch (err: any) {
      setMsg(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'tenant': return 'Tenant (租客)'
      case 'landlord': return 'Landlord (房东)'
      case 'agent': return 'Agent (中介)'
      case 'admin': return 'Administrator (管理员)'
      default: return role
    }
  }

  if (!user) {
    return (
      <div className="container">
        <div className="header"><ThemeToggle /></div>
        <Card>
          <h1 className="title">Loading...</h1>
        </Card>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header"><ThemeToggle /></div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 className="title">My Profile</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {!editing && (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
            <Button onClick={() => {
              logout()
              window.location.href = '/login'
            }} style={{ backgroundColor: '#ef4444' }}>
              Logout
            </Button>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 32,
                color: '#6b7280'
              }}>
                {user.nickname?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <Input 
              label="Nickname" 
              placeholder="Your nickname" 
              value={formData.nickname} 
              onChange={(v) => setFormData({...formData, nickname: v})} 
              error={errors.nickname} 
            />
            <Input 
              label="Phone" 
              placeholder="13800138000" 
              value={formData.phone} 
              onChange={(v) => setFormData({...formData, phone: v})} 
              error={errors.phone} 
            />
            <Input 
              label="Avatar URL (optional)" 
              placeholder="https://example.com/avatar.jpg" 
              value={formData.avatar_url} 
              onChange={(v) => setFormData({...formData, avatar_url: v})} 
            />
            
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    nickname: user.nickname || '',
                    phone: user.phone || '',
                    avatar_url: user.avatar_url || ''
                  })
                  setErrors({})
                  setMsg('')
                }}
                style={{ backgroundColor: '#6b7280' }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 32,
                color: '#6b7280'
              }}>
                {user.nickname?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ margin: '8px 0' }}>{user.nickname || user.email}</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>{getRoleLabel(user.role)}</p>
            </div>
            
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280' }}>Email</label>
                <p style={{ margin: '4px 0' }}>{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <label style={{ fontSize: 12, color: '#6b7280' }}>Phone</label>
                  <p style={{ margin: '4px 0' }}>{user.phone}</p>
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, color: '#6b7280' }}>Account Status</label>
                <p style={{ margin: '4px 0' }}>
                  <span style={{ 
                    color: user.status === 'active' ? '#10b981' : '#ef4444',
                    fontWeight: 'bold'
                  }}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280' }}>Member Since</label>
                <p style={{ margin: '4px 0' }}>{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
        
        {msg && (
          <div className="subtitle" role="status" style={{marginTop: 16, color: msg.includes('success') ? 'green' : 'tomato'}}>
            {msg}
          </div>
        )}
      </Card>
    </div>
  )
}
import { isValidPhone, normalizePhone } from '../utils/phone'