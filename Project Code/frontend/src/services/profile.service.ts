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

export async function fetchAnyUser(): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,role,full_name,avatar_url,phone,student_id,agency_name,agency_license,is_verified')
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data as DbUser) ?? null;
}

export async function uploadAvatar(file: File): Promise<string | null> {
  const filePath = `public/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return null;
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl ?? null;
}

