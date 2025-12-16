import { supabase } from '../lib/supabase';
import type { ListingDraft } from '../types';

type DbPropertyInsert = {
  owner_id: string;
  title: string;
  description?: string | null;
  price: number;
  deposit?: number | null;
  address: string;
  area?: string | null;
  category?: string | null;
  beds: number;
  bathrooms?: number | null;
  size_sqm?: number | null;
  kitchen?: boolean | null;
  furnished?: 'full' | 'half' | 'none' | null;
  available_from?: string | null;
  amenities?: string[] | null;
  rules?: string[] | null;
  status?: 'active' | 'rented' | 'delisted' | null;
};

type ImageRecord = {
  property_id: string;
  image_url: string;
  is_cover: boolean;
  order_index: number;
};

const BUCKET = 'photos';

function toDbPayload(form: ListingDraft, userId: string): DbPropertyInsert {
  return {
    owner_id: userId,
    title: form.title,
    description: form.description || null,
    price: Number(form.price || 0),
    deposit: form.price ? Number(form.price) : null,
    address: form.address,
    area: form.area || null,
    category: form.propertyType || null,
    beds: Number(form.beds || 1),
    bathrooms: form.bathroom != null ? Number(form.bathroom) : null,
    size_sqm: form.propertySize != null ? Number(form.propertySize) : null,
    kitchen: form.kitchen ?? null,
    furnished: (form.furnished as any) ?? null,
    available_from: form.availableFrom || null,
    amenities: form.amenities?.length ? form.amenities : null,
    rules: null,
    status: 'active',
  };
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseBase64(b64: string): { ext: string; bytes: Uint8Array } {
  const m = /^data:(.+?);base64,(.+)$/.exec(b64);
  const data = m ? m[2] : b64;
  const mime = m ? m[1] : 'image/jpeg';
  const ext = mime.split('/')[1] || 'jpg';
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { ext, bytes };
}

async function uploadBase64Image(propertyId: string, base64: string, index: number): Promise<{ url: string; path: string; isCover: boolean; orderIndex: number }> {
  const { ext, bytes } = parseBase64(base64);
  const name = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const path = `${propertyId}/${name}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: `image/${ext}` });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, isCover: index === 0, orderIndex: index };
}

async function insertProperty(payload: DbPropertyInsert): Promise<string> {
  const { data, error } = await supabase.from('properties').insert(payload).select('id').single();
  if (error) throw new Error(error.message);
  return String(data.id);
}

async function insertPropertyImages(records: ImageRecord[]): Promise<void> {
  if (!records.length) return;
  const { error } = await supabase.from('property_images').insert(records);
  if (error) throw new Error(error.message);
}

async function removeStoragePaths(paths: string[]): Promise<void> {
  if (!paths.length) return;
  await supabase.storage.from(BUCKET).remove(paths);
}

export const ListingService = {
  async publishFromFiles(form: ListingDraft, files: File[], userId: string): Promise<string> {
    const photos = await Promise.all(files.map(f => fileToBase64(f)));
    return this.publish(form, photos, userId);
  },

  async publish(form: ListingDraft, photos: string[], userId: string): Promise<string> {
    const payload = toDbPayload({ ...form, photos }, userId);
    const propertyId = await insertProperty(payload);
    const uploaded = [];
    try {
      for (let i = 0; i < photos.length; i++) {
        const res = await uploadBase64Image(propertyId, photos[i], i);
        uploaded.push(res);
      }
      const records: ImageRecord[] = uploaded.map(u => ({
        property_id: propertyId,
        image_url: u.url,
        is_cover: u.isCover,
        order_index: u.orderIndex,
      }));
      await insertPropertyImages(records);
      return propertyId;
    } catch (err) {
      const paths = uploaded.map(u => u.path);
      await removeStoragePaths(paths);
      throw err instanceof Error ? err : new Error('Publish failed');
    }
  },
};
