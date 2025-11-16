import { create } from 'zustand'
import { useAuthStore } from './authStore'

interface Property {
  id: string
  title: string
  description: string
  price: number
  area: number
  rooms: number
  bedrooms: number
  bathrooms: number
  address: string
  city: string
  district: string
  latitude?: number
  longitude?: number
  status: 'available' | 'rented' | 'offline'
  facilities?: string[]
  images: Array<{
    id: string
    image_url: string
    is_primary: boolean
    sort_order: number
  }>
  created_at: string
  updated_at: string
  landlord: {
    id: string
    nickname: string
    phone?: string
    email: string
  }
}

interface PropertyState {
  properties: Property[]
  currentProperty: Property | null
  loading: boolean
  error: string | null
  searchFilters: {
    city?: string
    district?: string
    price_min?: number
    price_max?: number
    area_min?: number
    area_max?: number
    rooms?: number
    bedrooms?: number
    bathrooms?: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  fetchProperties: (page?: number) => Promise<void>
  fetchPropertyById: (id: string) => Promise<void>
  createProperty: (propertyData: any) => Promise<void>
  updateProperty: (id: string, propertyData: any) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  fetchUserProperties: () => Promise<void>
  fetchUserFavorites: () => Promise<void>
  setSearchFilters: (filters: any) => void
  clearError: () => void
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentProperty: null,
  loading: false,
  error: null,
  searchFilters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },

  fetchProperties: async (page = 1) => {
    const { searchFilters, pagination } = get()
    
    set({ loading: true, error: null })
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(searchFilters).filter(([_, v]) => v !== undefined))
      })
      
      const response = await fetch(`http://localhost:3001/api/properties?${queryParams}`)
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch properties')
      
      set({
        properties: data.properties || [],
        pagination: data.pagination || { page, limit: 10, total: 0, pages: 1 }
      })
    } catch (error: any) {
      set({ error: error.message, properties: [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchPropertyById: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      const response = await fetch(`http://localhost:3001/api/properties/${id}`)
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Property not found')
      
      set({ currentProperty: data.property })
    } catch (error: any) {
      set({ error: error.message, currentProperty: null })
    } finally {
      set({ loading: false })
    }
  },

  createProperty: async (propertyData: any) => {
    const { token } = useAuthStore.getState()
    
    if (!token) throw new Error('No authentication token')
    
    set({ loading: true, error: null })
    
    try {
      const response = await fetch('http://localhost:3001/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to create property')
      
      // Refresh properties after creation
      await get().fetchProperties()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateProperty: async (id: string, propertyData: any) => {
    const { token } = useAuthStore.getState()
    
    if (!token) throw new Error('No authentication token')
    
    set({ loading: true, error: null })
    
    try {
      const response = await fetch(`http://localhost:3001/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to update property')
      
      // Refresh properties after update
      await get().fetchProperties()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  deleteProperty: async (id: string) => {
    const { token } = useAuthStore.getState()
    
    if (!token) throw new Error('No authentication token')
    
    set({ loading: true, error: null })
    
    try {
      const response = await fetch(`http://localhost:3001/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to delete property')
      
      // Refresh properties after deletion
      await get().fetchProperties()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  toggleFavorite: async (id: string) => {
    const { token } = useAuthStore.getState()
    
    if (!token) throw new Error('No authentication token')
    
    set({ loading: true, error: null })
    
    try {
      const response = await fetch(`http://localhost:3001/api/properties/${id}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to toggle favorite')
      
      // Refresh current property if it's the one being toggled
      if (get().currentProperty?.id === id) {
        await get().fetchPropertyById(id)
      }
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  fetchUserProperties: async () => {
    const { token } = useAuthStore.getState()
    
    if (!token) throw new Error('No authentication token')
    
    set({ loading: true, error: null })
    
    try {
      const response = await fetch('http://localhost:3001/api/properties/user/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch user properties')
      
      set({ properties: data.properties || [] })
    } catch (error: any) {
      set({ error: error.message, properties: [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchUserFavorites: async () => {
    const { token } = useAuthStore.getState()
    
    if (!token) throw new Error('No authentication token')
    
    set({ loading: true, error: null })
    
    try {
      const response = await fetch('http://localhost:3001/api/properties/user/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch favorites')
      
      set({ properties: data.properties || [] })
    } catch (error: any) {
      set({ error: error.message, properties: [] })
    } finally {
      set({ loading: false })
    }
  },

  setSearchFilters: (filters: any) => {
    set({ searchFilters: filters })
  },

  clearError: () => {
    set({ error: null })
  }
}))