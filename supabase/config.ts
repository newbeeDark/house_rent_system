import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vnrfsaroziioqxvektyh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZucmZzYXJvemlpb3F4dmVrdHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjY3ODgsImV4cCI6MjA3ODg0Mjc4OH0.V8fwj-mKBGIs_VzidXNYay4ue-Ww205I5-0Rs5HZ_HM'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZucmZzYXJvemlpb3F4dmVrdHloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI2Njc4OCwiZXhwIjoyMDc4ODQyNzg4fQ.y97VPrSrRK2tyl-ZgqGMbFru1kz7fFNKvSOLS4rg7bc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
})