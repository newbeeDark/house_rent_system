import { supabase } from '../lib/supabase';

export const ComplaintService = {
  async listHostComplaints() {
    const { data, error } = await supabase.from('complaints').select('*').eq('target_type', 'property').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },
};
