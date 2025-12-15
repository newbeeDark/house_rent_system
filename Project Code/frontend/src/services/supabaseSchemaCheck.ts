import { supabase } from '../lib/supabase';

type CheckResult = { table: string; ok: boolean; error?: string };

const tables: { name: string; columns: string[] }[] = [
  { name: 'profiles', columns: ['id','role','full_name','avatar_url','phone','student_id','agency_name','agency_license','is_verified','created_at','updated_at'] },
  { name: 'properties', columns: ['id','owner_id','title','description','price','deposit','address','area','category','beds','bathrooms','size_sqm','kitchen','furnished','latitude','longitude','amenities','rules','available_from','rating','views_count','applications_count','status','created_at','updated_at'] },
  { name: 'property_images', columns: ['id','property_id','image_url','is_cover','order_index','created_at'] },
  { name: 'applications', columns: ['id','property_id','applicant_id','property_owner_id','message','documents','status','created_at','updated_at'] },
  { name: 'favorites', columns: ['user_id','property_id','created_at'] },
  { name: 'complaints', columns: ['id','reporter_id','target_type','target_id','category','description','status','created_at'] },
];

async function checkTable(table: string, columns: string[]): Promise<CheckResult> {
  const { error } = await supabase.from(table).select(columns.join(',')).range(0, 0);
  return { table, ok: !error, error: error?.message };
}

export async function runSupabaseSchemaCheck(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const t of tables) {
    const r = await checkTable(t.name, t.columns);
    results.push(r);
  }
  return results;
}

