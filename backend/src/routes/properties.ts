import express from 'express'
import pool from '../db'
import { authMiddleware } from './auth'
import { z } from 'zod'

const router = express.Router()

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

const updatePropertySchema = propertySchema.partial()

const searchSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
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

// 获取房源列表
router.get('/', async (req, res) => {
  try {
    const parse = searchSchema.parse(req.query)
    const { page, limit, city, district, price_min, price_max, area_min, area_max, rooms, bedrooms, bathrooms } = parse
    
    let whereClause = 'WHERE p.status = "available"'
    const params: any[] = []
    
    if (city) {
      whereClause += ' AND p.city = ?'
      params.push(city)
    }
    if (district) {
      whereClause += ' AND p.district = ?'
      params.push(district)
    }
    if (price_min) {
      whereClause += ' AND p.price >= ?'
      params.push(price_min)
    }
    if (price_max) {
      whereClause += ' AND p.price <= ?'
      params.push(price_max)
    }
    if (area_min) {
      whereClause += ' AND p.area >= ?'
      params.push(area_min)
    }
    if (area_max) {
      whereClause += ' AND p.area <= ?'
      params.push(area_max)
    }
    if (rooms) {
      whereClause += ' AND p.rooms = ?'
      params.push(rooms)
    }
    if (bedrooms) {
      whereClause += ' AND p.bedrooms = ?'
      params.push(bedrooms)
    }
    if (bathrooms) {
      whereClause += ' AND p.bathrooms = ?'
      params.push(bathrooms)
    }
    
    const offset = (page - 1) * limit
    
    const [totalRows] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM properties p 
      ${whereClause}
    `, params)
    
    const [propertyRows] = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.price,
        p.area,
        p.rooms,
        p.bedrooms,
        p.bathrooms,
        p.address,
        p.city,
        p.district,
        p.status,
        p.created_at,
        u.nickname as landlord_name,
        u.id as landlord_id,
        (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as main_image
      FROM properties p
      JOIN users u ON p.landlord_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset])
    
    const total = (totalRows as any[])[0].total
    const properties = propertyRows as any[]
    
    res.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(400).json({ error: 'invalid_query_parameters' })
  }
})

// 获取房源详情
router.get('/:id', async (req, res) => {
  const propertyId = parseInt(req.params.id)
  if (isNaN(propertyId)) return res.status(400).json({ error: 'invalid_property_id' })
  
  const [propertyRows] = await pool.query(`
    SELECT 
      p.*,
      u.nickname as landlord_name,
      u.phone as landlord_phone,
      u.email as landlord_email
    FROM properties p
    JOIN users u ON p.landlord_id = u.id
    WHERE p.id = ?
  `, [propertyId])
  
  const properties = propertyRows as any[]
  if (!properties.length) return res.status(404).json({ error: 'property_not_found' })
  
  const property = properties[0]
  
  const [imageRows] = await pool.query(`
    SELECT id, image_url, is_primary, sort_order
    FROM property_images
    WHERE property_id = ?
    ORDER BY is_primary DESC, sort_order ASC
  `, [propertyId])
  
  property.images = imageRows
  
  res.json({ property })
})

// 发布房源（需要认证）
router.post('/', authMiddleware, async (req: any, res) => {
  const parse = propertySchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'invalid_payload' })
  
  const { title, description, price, area, rooms, bedrooms, bathrooms, address, city, district, latitude, longitude, facilities, images } = parse.data
  
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    
    const [result] = await conn.query(`
      INSERT INTO properties (
        landlord_id, title, description, price, area, rooms, bedrooms, bathrooms,
        address, city, district, latitude, longitude, facilities, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, title, description, price, area, rooms, bedrooms, bathrooms,
      address, city, district, latitude || null, longitude || null,
      facilities ? JSON.stringify(facilities) : null, 'available'
    ])
    
    const propertyId = (result as any).insertId
    
    for (let i = 0; i < images.length; i++) {
      await conn.query(`
        INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
        VALUES (?, ?, ?, ?)
      `, [propertyId, images[i], i === 0, i])
    }
    
    await conn.commit()
    res.json({ id: propertyId, message: 'Property created successfully' })
    
  } catch (error) {
    await conn.rollback()
    res.status(500).json({ error: 'database_error' })
  } finally {
    conn.release()
  }
})

// 更新房源（需要认证，且必须是房源所有者）
router.put('/:id', authMiddleware, async (req: any, res) => {
  const propertyId = parseInt(req.params.id)
  if (isNaN(propertyId)) return res.status(400).json({ error: 'invalid_property_id' })
  
  const parse = updatePropertySchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'invalid_payload' })
  
  const [ownerRows] = await pool.query('SELECT landlord_id FROM properties WHERE id = ?', [propertyId])
  const owners = ownerRows as any[]
  if (!owners.length) return res.status(404).json({ error: 'property_not_found' })
  if (owners[0].landlord_id !== req.user.id) return res.status(403).json({ error: 'not_property_owner' })
  
  const updates = parse.data
  const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined)
  
  if (!fields.length) return res.status(400).json({ error: 'no_fields_to_update' })
  
  const setClause = fields.map(field => `${field} = ?`).join(', ')
  const values = fields.map(field => {
    const value = updates[field as keyof typeof updates]
    return field === 'facilities' && value ? JSON.stringify(value) : value
  })
  
  await pool.query(`UPDATE properties SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, propertyId])
  
  res.json({ message: 'Property updated successfully' })
})

// 删除房源（需要认证，且必须是房源所有者）
router.delete('/:id', authMiddleware, async (req: any, res) => {
  const propertyId = parseInt(req.params.id)
  if (isNaN(propertyId)) return res.status(400).json({ error: 'invalid_property_id' })
  
  const [ownerRows] = await pool.query('SELECT landlord_id FROM properties WHERE id = ?', [propertyId])
  const owners = ownerRows as any[]
  if (!owners.length) return res.status(404).json({ error: 'property_not_found' })
  if (owners[0].landlord_id !== req.user.id) return res.status(403).json({ error: 'not_property_owner' })
  
  await pool.query('DELETE FROM properties WHERE id = ?', [propertyId])
  
  res.json({ message: 'Property deleted successfully' })
})

// 获取用户的房源列表（需要认证）
router.get('/user/my', authMiddleware, async (req: any, res) => {
  const [properties] = await pool.query(`
    SELECT 
      p.id,
      p.title,
      p.price,
      p.area,
      p.rooms,
      p.bedrooms,
      p.bathrooms,
      p.address,
      p.city,
      p.district,
      p.status,
      p.created_at,
      (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as main_image
    FROM properties p
    WHERE p.landlord_id = ?
    ORDER BY p.created_at DESC
  `, [req.user.id])
  
  res.json({ properties })
})

export default router