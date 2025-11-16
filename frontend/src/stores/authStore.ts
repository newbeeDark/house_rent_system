import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  phone: string | null
  role: 'tenant' | 'landlord' | 'agent' | 'admin'
  nickname: string
  avatar_url: string | null
  status: 'active' | 'inactive'
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginByPhone: (phone: string, password: string) => Promise<void>
  register: (email: string, password: string, role: string, phone?: string, nickname?: string) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Login failed')
        
        set({ user: data.user, token: data.token, isAuthenticated: true })
        localStorage.setItem('token', data.token)
      },

      loginByPhone: async (phone: string, password: string) => {
        const response = await fetch('http://localhost:3001/api/auth/login/phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Login failed')
        
        set({ user: data.user, token: data.token, isAuthenticated: true })
        localStorage.setItem('token', data.token)
      },

      register: async (email: string, password: string, role: string, phone?: string, nickname?: string) => {
        const response = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role, phone, nickname })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Registration failed')
        
        set({ user: data.user, token: data.token, isAuthenticated: true })
        localStorage.setItem('token', data.token)
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('token')
      },

      fetchProfile: async () => {
        const token = get().token
        if (!token) throw new Error('No token available')
        
        const response = await fetch('http://localhost:3001/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to fetch profile')
        
        set({ user: data.user })
      },

      updateProfile: async (data: Partial<User>) => {
        const token = get().token
        if (!token) throw new Error('No token available')
        
        const response = await fetch('http://localhost:3001/api/auth/profile', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Failed to update profile')
        
        set({ user: result.user })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)