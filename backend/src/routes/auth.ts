import { Router } from 'express'
import pool from '../db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { Request } from 'express'

interface AuthRequest extends Request {
  user?: { id: number; role: string }
}

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().refine(v => /^\+?\d{7,15}$/.test(v), 'invalid_phone').optional(),
  password: z.string().min(6),
  role: z.enum(['tenant','landlord','agent','admin']),
  nickname: z.string().min(2).max(20).optional()
})

router.post('/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'invalid_payload' })
  const { email, phone, password, role, nickname } = parse.data
  const normalizedPhone = normalizePhone(phone)
  const [existing] = await pool.query('SELECT id FROM users WHERE email=? OR phone=? LIMIT 1', [email, phone || null])
  const rows = existing as any[]
  if ((rows as any).length) return res.status(409).json({ error: 'user_exists' })
  const hash = await bcrypt.hash(password, 10)
  const [result] = await pool.query('INSERT INTO users (email, phone, password_hash, role, status, nickname) VALUES (?,?,?,?,?,?)', [email, normalizedPhone || null, hash, role, 'active', nickname || email.split('@')[0]])
  const insert = result as any
  const token = jwt.sign({ id: insert.insertId, role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
  res.json({ 
    token,
    user: {
      id: insert.insertId,
      email,
      phone: phone || null,
      role,
      nickname: nickname || email.split('@')[0]
    }
  })
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const phoneLoginSchema = z.object({
  phone: z.string().refine(v => /^\+?\d{7,15}$/.test(v), 'invalid_phone'),
  password: z.string().min(6)
})

router.post('/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'invalid_payload' })
  const { email, password } = parse.data
  const [rows] = await pool.query('SELECT id, password_hash, role, email, phone, nickname, status FROM users WHERE email=? LIMIT 1', [email])
  const list = rows as any[]
  if (!list.length) return res.status(401).json({ error: 'invalid_credentials' })
  const user = list[0]
  if (user.status !== 'active') return res.status(403).json({ error: 'account_inactive' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
  res.json({ 
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      nickname: user.nickname,
      status: user.status
    }
  })
})

router.post('/login/phone', async (req, res) => {
  const parse = phoneLoginSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'invalid_payload' })
  const { phone, password } = parse.data
  const normalizedPhone = normalizePhone(phone)
  const [rows] = await pool.query('SELECT id, password_hash, role, email, phone, nickname, status FROM users WHERE phone=? LIMIT 1', [normalizedPhone])
  const list = rows as any[]
  if (!list.length) return res.status(401).json({ error: 'invalid_credentials' })
  const user = list[0]
  if (user.status !== 'active') return res.status(403).json({ error: 'account_inactive' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
  res.json({ 
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      nickname: user.nickname,
      status: user.status
    }
  })
})

const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(20).optional(),
  phone: z.string().refine(v => /^\+?\d{7,15}$/.test(v), 'invalid_phone').optional(),
  avatar_url: z.string().url().optional()
})

export function authMiddleware(req: AuthRequest, res: any, next: any) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'no_token' })
  const token = header.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as any
    req.user = { id: decoded.id, role: decoded.role }
    next()
  } catch {
    res.status(401).json({ error: 'invalid_token' })
  }
}

router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const [rows] = await pool.query('SELECT id, email, phone, role, nickname, avatar_url, status, created_at FROM users WHERE id=? LIMIT 1', [req.user!.id])
  const list = rows as any[]
  if (!list.length) return res.status(404).json({ error: 'user_not_found' })
  res.json({ user: list[0] })
})

router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const parse = updateProfileSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'invalid_payload' })
  const { nickname, phone, avatar_url } = parse.data
  const normalizedPhone = normalizePhone(phone)
  
  if (phone) {
    const [existing] = await pool.query('SELECT id FROM users WHERE phone=? AND id!=? LIMIT 1', [normalizedPhone, req.user!.id])
    const rows = existing as any[]
    if ((rows as any).length) return res.status(409).json({ error: 'phone_exists' })
  }
  
  const [result] = await pool.query('UPDATE users SET nickname=?, phone=?, avatar_url=?, updated_at=NOW() WHERE id=?', [
    nickname || null, normalizedPhone || null, avatar_url || null, req.user!.id
  ])
  
  const updateResult = result as any
  if (!updateResult.affectedRows) return res.status(404).json({ error: 'user_not_found' })
  
  const [rows] = await pool.query('SELECT id, email, phone, role, nickname, avatar_url, status, created_at FROM users WHERE id=? LIMIT 1', [req.user!.id])
  res.json({ user: (rows as any[])[0] })
})

export default router
function normalizePhone(input?: string) {
  return input ? input.replace(/\D+/g, '') : undefined
}