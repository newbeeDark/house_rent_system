import { supabase } from '../lib/supabase';

export const PaymentService = {
  async create(application_id: string, payer_id: string, amount: number, currency: string = 'MYR') {
    const { error } = await supabase.from('payments').insert({ application_id, payer_id, amount, currency });
    return !error;
  },
};
