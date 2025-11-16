import { supabase, supabaseAdmin } from '../config'
import { z } from 'zod'
import { normalizePhone, isValidPhoneDigits } from '../utils/phone'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const phoneLoginSchema = z.object({
  phone: z.string().refine((v) => /^\+?\d{7,15}$/.test(v), 'invalid_phone'),
  password: z.string().min(6)
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().refine((v) => /^\+?\d{7,15}$/.test(v), 'invalid_phone').optional(),
  role: z.enum(['tenant', 'landlord', 'agent']).default('tenant'),
  nickname: z.string().min(2).max(20).optional()
})

const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(20).optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional(),
  avatar_url: z.string().url().optional()
})

export class AuthService {
  async login(email: string, password: string) {
    const parse = loginSchema.safeParse({ email, password })
    if (!parse.success) {
      throw new Error('invalid_payload')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, phone, role, nickname, avatar_url, created_at')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      throw new Error('user_not_found')
    }

    return {
      user: userData,
      token: data.session.access_token
    }
  }

  async loginByPhone(phone: string, password: string) {
    const parse = phoneLoginSchema.safeParse({ phone, password })
    if (!parse.success) {
      throw new Error('invalid_payload')
    }

    const normalized = normalizePhone(phone)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('email, phone')
      .eq('phone', normalized)
      .single()

    if (userError || !userData) {
      throw new Error('phone_not_found')
    }

    return this.login(userData.email, password)
  }

  async register(data: {
    email: string
    password: string
    phone?: string
    role?: string
    nickname?: string
  }) {
    const parse = registerSchema.safeParse(data)
    if (!parse.success) {
      throw new Error('invalid_payload')
    }

    const { email, password, phone, role, nickname } = parse.data
    const normalizedPhone = phone ? normalizePhone(phone) : undefined
    if (normalizedPhone && !isValidPhoneDigits(normalizedPhone)) {
      throw new Error('invalid_phone')
    }

    if (normalizedPhone) {
      const { data: existingPhone } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('phone', normalizedPhone)
        .single()
      if (existingPhone) {
        throw new Error('phone_exists')
      }
    }

    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    if (existingEmail) {
      throw new Error('user_exists')
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('registration_failed')
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('users')
      .update({
        phone: normalizedPhone || null,
        role: role || 'tenant',
        nickname: nickname || email.split('@')[0]
      })
      .eq('id', authData.user.id)
      .select('id, email, phone, role, nickname, avatar_url, created_at')
      .single()
    if (updateErr) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error('profile_creation_failed')
    }

    const userData = updated

    return {
      user: userData,
      token: authData.session?.access_token
    }
  }

  async getProfile(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, phone, role, nickname, avatar_url, created_at')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error('user_not_found')
    }

    return data
  }

  async updateProfile(userId: string, updates: {
    nickname?: string
    phone?: string
    avatar_url?: string
  }) {
    const parse = updateProfileSchema.safeParse(updates)
    if (!parse.success) {
      throw new Error('invalid_payload')
    }

    if (updates.phone) {
      const normalizedPhone = normalizePhone(updates.phone)
      if (!isValidPhoneDigits(normalizedPhone)) {
        throw new Error('invalid_phone')
      }
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('phone', normalizedPhone)
        .neq('id', userId)
        .single()

      if (existing) {
        throw new Error('phone_exists')
      }
      updates.phone = normalizedPhone
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, phone, role, nickname, avatar_url, created_at')
      .single()

    if (error) {
      throw new Error('update_failed')
    }

    return data
  }

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }
}

export const authService = new AuthService()