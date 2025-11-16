import express from 'express'
import { authService } from '../services/authService'
import { propertyService } from '../services/propertyService'
import { z } from 'zod'
import { normalizePhone } from '../utils/phone'
import { supabase } from '../config'

const router = express.Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().refine((v) => /^\+?\d{7,15}$/.test(v), 'invalid_phone').optional(),
  role: z.enum(['tenant', 'landlord', 'agent']).default('tenant'),
  nickname: z.string().min(2).max(20).optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const phoneLoginSchema = z.object({
  phone: z.string().refine((v) => /^\+?\d{7,15}$/.test(v), 'invalid_phone'),
  password: z.string().min(6)
})

const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(20).optional(),
  phone: z.string().refine((v) => /^\+?\d{7,15}$/.test(v), 'invalid_phone').optional(),
  avatar_url: z.string().url().optional()
})

const propertySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  area: z.number().positive(),
  rooms: z.number().int().positive(),
  bedrooms: z.number().int().positive(),
  bathrooms: z.number().int().positive(),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  district: z.string().min(2).max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  facilities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).min(1).max(10)
})

const searchSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
  city: z.string().optional(),
  district: z.string().optional(),
  price_min: z.string().regex(/^\d*\.?\d+$/).transform(Number).optional(),
  price_max: z.string().regex(/^\d*\.?\d+$/).transform(Number).optional(),
  area_min: z.string().regex(/^\d*\.?\d+$/).transform(Number).optional(),
  area_max: z.string().regex(/^\d*\.?\d+$/).transform(Number).optional(),
  rooms: z.string().regex(/^\d+$/).transform(Number).optional(),
  bedrooms: z.string().regex(/^\d+$/).transform(Number).optional(),
  bathrooms: z.string().regex(/^\d+$/).transform(Number).optional()
})

async function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'no_token' })
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ error: 'invalid_token' })
    }
    req.auth = { user, token }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'invalid_token' })
  }
}

router.post('/auth/register', async (req, res) => {
  try {
    const parse = registerSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ error: 'invalid_payload' })
    }

    const result = await authService.register(parse.data)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/auth/login', async (req, res) => {
  try {
    const parse = loginSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ error: 'invalid_payload' })
    }

    const result = await authService.login(parse.data.email, parse.data.password)
    res.json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

router.post('/auth/login/phone', async (req, res) => {
  try {
    const parse = phoneLoginSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({ error: 'invalid_payload' })
    }

    const result = await authService.loginByPhone(normalizePhone(parse.data.phone), parse.data.password)
    res.json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

router.get('/auth/profile', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.auth.user.id
    const user = await authService.getProfile(userId)
    res.json({ user })
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

router.put('/auth/profile', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.auth.user.id
    const updates = updateProfileSchema.parse(req.body)
    const user = await authService.updateProfile(userId, updates)
    res.json({ user })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/properties', async (req, res) => {
  try {
    const filters = searchSchema.parse(req.query)
    const result = await propertyService.searchProperties(filters)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/properties/:id', async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id)
    res.json({ property })
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

router.post('/properties', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.auth.user.id
    const property = await propertyService.createProperty(userId, req.body)
    res.json({ property })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/properties/:id', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.auth.user.id
    const property = await propertyService.updateProperty(req.params.id, userId, req.body)
    res.json({ property })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/properties/:id', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.auth.user.id
    const result = await propertyService.deleteProperty(req.params.id, userId)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/properties/user/my', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.auth.user.id
    const properties = await propertyService.getUserProperties(userId)
    res.json({ properties })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/properties/:id/favorite', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.auth.user.id
    const result = await propertyService.toggleFavorite(userId, req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/properties/user/favorites', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.auth.user.id
    const properties = await propertyService.getUserFavorites(userId)
    res.json({ properties })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router