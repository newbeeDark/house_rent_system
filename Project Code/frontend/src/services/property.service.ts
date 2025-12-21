import { supabase } from '../lib/supabase';
import type { Property } from '../types';


// 确保这里的类型定义覆盖了你数据库 users 表里的字段
export type DbUser = {
  id: string;
  role: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  student_id: string | null;
  agency_name: string | null;
  agency_license: string | null;
  is_verified: boolean;
  // 如果你需要用到 landlord_licenceid，也可以加在这里
  // landlord_licenceid: string | null;
};

// ✅ 修改 1: 函数改名并接收 userId 参数，使其能查询特定用户
export async function getUserProfile(userId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users') // ✅ 修改 2: 表名从 'profiles' 改为 'users'
    .select('id,role,full_name,avatar_url,phone,student_id,agency_name,agency_license,is_verified')
    .eq('id', userId) // ✅ 修改 3: 增加 ID 过滤，锁定特定用户
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return (data as DbUser) ?? null;
}

export async function uploadAvatar(file: File): Promise<string | null> {
  const filePath = `public/${Date.now()}_${file.name}`;
  
  // ⚠️ 注意：请确保你在 Supabase Storage 只有创建了名为 'avatars' 的桶，并且开启了 Public 权限。
  // 如果你想共用之前的桶，可以把 'avatars' 改为 'photos'。
  const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl ?? null;
}
export const PropertyService = {
    getAll: async (): Promise<Property[]> => {
        // 1. Fetch Properties and Images
        const { data: props, error: propError } = await supabase
            .from('properties')
            .select(`
                *,
                property_images ( image_url, is_cover, order_index )
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (propError) {
            console.error('Error fetching properties:', propError);
            throw new Error(propError.message);
        }

        // 2. Fetch Profiles (Manual Join)
        const ownerIds = Array.from(new Set(props.map((p: any) => p.owner_id).filter(Boolean)));
        let profilesMap: Record<string, any> = {};

        if (ownerIds.length > 0) {
            const { data: profiles, error: profError } = await supabase
                .from('users')
                .select('id, full_name, role, phone, created_at, agency_name, avatar_url')
                .in('id', ownerIds);
            
            if (!profError && profiles) {
                profiles.forEach((p: any) => {
                    profilesMap[p.id] = p;
                });
            }
        }

        // 3. Transform and Merge
        return props.map((row: any) => {
            const profile = profilesMap[row.owner_id];
            // Inject profile into row for the transformer
            return transformRowToProperty({ ...row, profiles: profile });
        });
    },

    getById: async (id: string): Promise<Property | undefined> => {
        // 1. Fetch Property
        const { data: row, error } = await supabase
            .from('properties')
            .select(`
                *,
                property_images ( image_url, is_cover, order_index )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching property by ID:', error);
            return undefined;
        }

        // 2. Fetch Profile
        let profile = null;
        if (row.owner_id) {
            const { data: prof } = await supabase
                .from('users')
                .select('id, full_name, role, phone, created_at, agency_name, avatar_url')
                .eq('id', row.owner_id)
                .single();
            profile = prof;
        }

        return transformRowToProperty({ ...row, profiles: profile });
    },

    getFavorites: async (userId: string): Promise<Property[]> => {
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                created_at,
                property:properties (
                    *,
                    property_images ( image_url, is_cover, order_index )
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching favorites:', error);
            throw new Error(error.message);
        }

        if (!data) return [];

        return data.map((row: any) => {
             const prop = row.property;
             if (!prop) return null;
             // We don't fetch host info for favorites list to keep it fast
             return transformRowToProperty(prop);
        }).filter(Boolean) as Property[];
    },

    addToFavorites: async (userId: string, propertyId: string) => {
        const { error } = await supabase
            .from('favorites')
            .insert({ user_id: userId, property_id: propertyId });
        if (error) throw error;
    },

    removeFromFavorites: async (userId: string, propertyId: string) => {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('property_id', propertyId);
        if (error) throw error;
    },

    isFavorite: async (userId: string, propertyId: string): Promise<boolean> => {
        const { data, error } = await supabase
            .from('favorites')
            .select('property_id')
            .eq('user_id', userId)
            .eq('property_id', propertyId)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
             console.error('Error checking favorite:', error);
        }
        return !!data;
    }
};

function transformRowToProperty(row: any): Property {
    // 1. Process Images
    let coverImage = '/placeholder-house.jpg'; // Default fallback
    const images: string[] = [];

    if (row.property_images && Array.isArray(row.property_images)) {
        // Sort by order_index
        const sortedImgs = row.property_images.sort((a: any, b: any) => a.order_index - b.order_index);
        
        // Collect all URLs
        sortedImgs.forEach((img: any) => {
            if (img.image_url) images.push(img.image_url);
        });

        // Find cover
        const coverObj = sortedImgs.find((img: any) => img.is_cover) || sortedImgs[0];
        if (coverObj && coverObj.image_url) {
            coverImage = coverObj.image_url;
        }
    }

    // 2. Process Host
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const host = {
        type: profile?.role || 'Landlord',
        name: profile?.agency_name || profile?.full_name || 'Unknown Host',
        contact: profile?.phone || '',
        since: profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : '2025'
    };

    // 3. Map Fields
    return {
        id: row.id,
        ownerId: row.owner_id,
        title: row.title,
        lat: row.latitude || 0,
        lon: row.longitude || 0,
        price: row.price,
        beds: row.beds,
        area: row.area || '',
        img: coverImage,
        rating: row.rating || 0,
        deposit: row.deposit,
        desc: row.description,
        features: row.amenities || [], // Mapping amenities to features as well for display compatibility
        rules: row.rules || [],
        images: images,
        host: host,
        stats: {
            views: row.views_count || 0,
            applications: row.applications_count || 0
        },
        address: row.address,
        bathroom: row.bathrooms,
        kitchen: row.kitchen,
        propertySize: row.size_sqm,
        propertyType: row.category,
        furnished: row.furnished,
        availableFrom: row.available_from,
        amenities: row.amenities || []
    };
}

export async function updateProperty(id: string, payload: Partial<{
  title: string;
  description: string | null;
  price: number;
  address: string;
  area: string | null;
  beds: number;
  bathrooms: number | null;
  size_sqm: number | null;
  kitchen: boolean | null;
  furnished: 'full' | 'half' | 'none' | null;
  available_from: string | null;
  amenities: string[] | null;
  rules: string[] | null;
}>): Promise<boolean> {
  const { error } = await supabase.from('properties').update(payload).eq('id', id);
  return !error;
}

export async function deleteImageByUrl(propertyId: string, url: string): Promise<boolean> {
  const { error } = await supabase.from('property_images').delete().eq('property_id', propertyId).eq('image_url', url);
  return !error;
}

export async function uploadImageToBucket(propertyId: string, file: File): Promise<{ url: string; path: string } | null> {
  const name = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const path = `${propertyId}/${name}-${file.name}`;
  const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: false });
  if (error) return null;
  const { data } = supabase.storage.from('photos').getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function insertImageRecord(propertyId: string, url: string, is_cover: boolean = false, order_index: number = 0): Promise<boolean> {
  const { error } = await supabase.from('property_images').insert({ property_id: propertyId, image_url: url, is_cover, order_index });
  return !error;
}

