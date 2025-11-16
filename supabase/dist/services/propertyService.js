"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyService = exports.PropertyService = void 0;
const config_1 = require("../config");
const zod_1 = require("zod");
const propertySchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(200),
    description: zod_1.z.string().min(10).max(2000),
    price: zod_1.z.number().positive(),
    area: zod_1.z.number().positive(),
    rooms: zod_1.z.number().int().positive(),
    bedrooms: zod_1.z.number().int().positive(),
    bathrooms: zod_1.z.number().int().positive(),
    address: zod_1.z.string().min(5).max(500),
    city: zod_1.z.string().min(2).max(100),
    district: zod_1.z.string().min(2).max(100),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
    facilities: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.string().url()).min(1).max(10)
});
const updatePropertySchema = propertySchema.partial();
const searchSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(10),
    city: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    price_min: zod_1.z.number().positive().optional(),
    price_max: zod_1.z.number().positive().optional(),
    area_min: zod_1.z.number().positive().optional(),
    area_max: zod_1.z.number().positive().optional(),
    rooms: zod_1.z.number().int().positive().optional(),
    bedrooms: zod_1.z.number().int().positive().optional(),
    bathrooms: zod_1.z.number().int().positive().optional()
});
class PropertyService {
    async searchProperties(filters) {
        const parse = searchSchema.safeParse(filters);
        if (!parse.success) {
            throw new Error('invalid_filters');
        }
        const { page, limit, city, district, price_min, price_max, area_min, area_max, rooms, bedrooms, bathrooms } = parse.data;
        let query = config_1.supabase
            .from('properties')
            .select(`
        *,
        landlord:users!properties_landlord_id_fkey(nickname),
        images:property_images(id, image_url, is_primary, sort_order)
      `)
            .eq('status', 'available');
        if (city)
            query = query.eq('city', city);
        if (district)
            query = query.eq('district', district);
        if (price_min)
            query = query.gte('price', price_min);
        if (price_max)
            query = query.lte('price', price_max);
        if (area_min)
            query = query.gte('area', area_min);
        if (area_max)
            query = query.lte('area', area_max);
        if (rooms)
            query = query.eq('rooms', rooms);
        if (bedrooms)
            query = query.eq('bedrooms', bedrooms);
        if (bathrooms)
            query = query.eq('bathrooms', bathrooms);
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);
        if (error) {
            throw new Error('search_failed');
        }
        return {
            properties: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
            }
        };
    }
    async getPropertyById(id) {
        const { data, error } = await config_1.supabase
            .from('properties')
            .select(`
        *,
        landlord:users!properties_landlord_id_fkey(nickname, phone, email),
        images:property_images(id, image_url, is_primary, sort_order)
      `)
            .eq('id', id)
            .single();
        if (error) {
            throw new Error('property_not_found');
        }
        return data;
    }
    async createProperty(landlordId, data) {
        const parse = propertySchema.safeParse(data);
        if (!parse.success) {
            throw new Error('invalid_payload');
        }
        const { title, description, price, area, rooms, bedrooms, bathrooms, address, city, district, latitude, longitude, facilities, images } = parse.data;
        const { data: property, error: propertyError } = await config_1.supabase
            .from('properties')
            .insert({
            landlord_id: landlordId,
            title,
            description,
            price,
            area,
            rooms,
            bedrooms,
            bathrooms,
            address,
            city,
            district,
            latitude: latitude || null,
            longitude: longitude || null,
            facilities: facilities || null,
            status: 'available',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
            .select()
            .single();
        if (propertyError) {
            throw new Error('property_creation_failed');
        }
        const imageRecords = images.map((url, index) => ({
            property_id: property.id,
            image_url: url,
            is_primary: index === 0,
            sort_order: index,
            created_at: new Date().toISOString()
        }));
        const { error: imagesError } = await config_1.supabase
            .from('property_images')
            .insert(imageRecords);
        if (imagesError) {
            await config_1.supabase.from('properties').delete().eq('id', property.id);
            throw new Error('image_upload_failed');
        }
        return property;
    }
    async updateProperty(propertyId, landlordId, updates) {
        const parse = updatePropertySchema.safeParse(updates);
        if (!parse.success) {
            throw new Error('invalid_payload');
        }
        const { data: existing, error: checkError } = await config_1.supabase
            .from('properties')
            .select('landlord_id')
            .eq('id', propertyId)
            .single();
        if (checkError || !existing) {
            throw new Error('property_not_found');
        }
        if (existing.landlord_id !== landlordId) {
            throw new Error('not_property_owner');
        }
        const { data, error } = await config_1.supabase
            .from('properties')
            .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
            .eq('id', propertyId)
            .select()
            .single();
        if (error) {
            throw new Error('update_failed');
        }
        return data;
    }
    async deleteProperty(propertyId, landlordId) {
        const { data: existing, error: checkError } = await config_1.supabase
            .from('properties')
            .select('landlord_id')
            .eq('id', propertyId)
            .single();
        if (checkError || !existing) {
            throw new Error('property_not_found');
        }
        if (existing.landlord_id !== landlordId) {
            throw new Error('not_property_owner');
        }
        const { error } = await config_1.supabase
            .from('properties')
            .delete()
            .eq('id', propertyId);
        if (error) {
            throw new Error('delete_failed');
        }
        return { message: 'Property deleted successfully' };
    }
    async getUserProperties(landlordId) {
        const { data, error } = await config_1.supabase
            .from('properties')
            .select(`
        *,
        images:property_images(id, image_url, is_primary, sort_order)
      `)
            .eq('landlord_id', landlordId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new Error('fetch_failed');
        }
        return data || [];
    }
    async toggleFavorite(userId, propertyId) {
        const { data: existing } = await config_1.supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('property_id', propertyId)
            .single();
        if (existing) {
            const { error } = await config_1.supabase
                .from('favorites')
                .delete()
                .eq('id', existing.id);
            if (error) {
                throw new Error('unfavorite_failed');
            }
            return { favorited: false };
        }
        else {
            const { error } = await config_1.supabase
                .from('favorites')
                .insert({
                user_id: userId,
                property_id: propertyId,
                created_at: new Date().toISOString()
            });
            if (error) {
                throw new Error('favorite_failed');
            }
            return { favorited: true };
        }
    }
    async getUserFavorites(userId) {
        const { data, error } = await config_1.supabase
            .from('favorites')
            .select(`
        property:properties(*, 
          landlord:users!properties_landlord_id_fkey(nickname),
          images:property_images(id, image_url, is_primary, sort_order)
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new Error('fetch_failed');
        }
        return (data || []).map(fav => fav.property);
    }
}
exports.PropertyService = PropertyService;
exports.propertyService = new PropertyService();
//# sourceMappingURL=propertyService.js.map