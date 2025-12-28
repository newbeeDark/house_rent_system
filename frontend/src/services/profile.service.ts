// src/services/profile.service.ts
import { supabase } from '../lib/supabase';

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
};

// 1. 改名：从 fetchAnyUser 改为 getUserProfile
// 2. 参数：接收 userId
export async function getUserProfile(userId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users') // ✅ 修正：表名改为 'users'
    .select('id,role,full_name,avatar_url,phone,student_id,agency_name,agency_license,is_verified')
    .eq('id', userId) // ✅ 修正：只查询当前用户的 ID
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return (data as DbUser) ?? null;
}

export async function uploadAvatar(file: File): Promise<string | null> {
  // 确保你的 Storage Bucket 叫 'avatars' 或者是 'photos' (根据你实际创建的)
  // 如果你之前只创建了 'photos'，就把下面的 'avatars' 改成 'photos'
  const filePath = `public/${Date.now()}_${file.name}`;
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