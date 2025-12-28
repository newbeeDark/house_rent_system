
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase URL or Anon Key. Please check your .env file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            storage: sessionStorage, // 使用 sessionStorage 替代 localStorage，实现“页面关闭即失效”
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);
