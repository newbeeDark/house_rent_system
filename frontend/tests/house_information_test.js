const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

function env() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL/SUPABASE_ANON_KEY (or VITE_*) environment variables');
  }
  return { url, key, serviceKey };
}

function client() {
  const { url, key } = env();
  return createClient(url, key);
}

function adminClient() {
  const { url, serviceKey } = env();
  if (!serviceKey) return null;
  return createClient(url, serviceKey);
}

function randEmail(prefix = 'jest') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
}

async function ensureUser(role) {
  const admin = adminClient();
  const providedEmail = process.env.SUPABASE_TEST_EMAIL;
  const providedPassword = process.env.SUPABASE_TEST_PASSWORD || 'Test#12345';
  const email = role === 'landlord' && providedEmail ? providedEmail : randEmail(role);
  const password = role === 'landlord' && providedEmail ? providedPassword : 'Test#12345';
  if (admin) {
    const res = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
    });
    if (res.error) {
      if (/registered|exists/i.test(res.error.message || '')) {
        const sup = client();
        const login = await sup.auth.signInWithPassword({ email, password });
        if (login.error) throw new Error(login.error.message);
        return { uid: login.data.user?.id, email };
      }
      throw new Error(res.error.message);
    }
    return { uid: res.data.user?.id, email };
  } else {
    const supabase = client();
    const res = await supabase.auth.signUp({ email, password, options: { data: { role } } });
    if (res.error) {
      const login = await supabase.auth.signInWithPassword({ email, password });
      if (login.error) throw new Error(login.error.message);
      return { uid: login.data.user?.id, email };
    }
    return { uid: res.data.user?.id, email };
  }
}

async function signIn(email, password = 'Test#12345') {
  const supabase = client();
  const res = await supabase.auth.signInWithPassword({ email, password });
  if (res.error) throw new Error(res.error.message);
  return res.data.user?.id || null;
}

function makePayload(uid, overrides = {}) {
  const base = {
    owner_id: uid,
    title: 'Jest Listing',
    description: 'Testing create',
    price: 500,
    deposit: 500,
    address: 'Jest Street',
    area: 'Bangi',
    category: 'Studio',
    beds: 1,
    bathrooms: 1,
    size_sqm: 300,
    kitchen: true,
    furnished: 'full',
    available_from: '2026-01-01',
    amenities: ['Wi-Fi'],
    status: 'active',
  };
  return { ...base, ...overrides };
}

describe('House Information CRUD (Jest)', () => {
  const HAS_ADMIN = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
  test('Database connectivity', async () => {
    const supabase = client();
    const { data, error } = await supabase.from('properties').select('id').range(0, 0);
    expect(error).toBeFalsy();
    expect(Array.isArray(data)).toBeTruthy();
  }, 20000);

  test('Create: required fields and persistence', async () => {
    const supabase = client();
    const { uid, email } = await ensureUser('landlord');
    expect(uid).toBeTruthy();
    await signIn(email);
    const payload = makePayload(uid);
    const { data, error } = await supabase.from('properties').insert(payload).select('id,title,owner_id').single();
    expect(error).toBeFalsy();
    expect(data.id).toBeTruthy();
    const back = await supabase.from('properties').select('id,title,owner_id').eq('id', data.id).single();
    expect(back.error).toBeFalsy();
    expect(back.data.owner_id).toEqual(uid);
  }, 30000);

  (HAS_ADMIN ? test : test.skip)('Create: boundary checks (invalid price, beds)', async () => {
    const supabase = client();
    const { uid, email } = await ensureUser('landlord');
    await signIn(email);
    const invalid1 = makePayload(uid, { price: -1 });
    const res1 = await supabase.from('properties').insert(invalid1).select('id').single();
    expect(res1.error).toBeTruthy();
    const invalid2 = makePayload(uid, { beds: 0 });
    const res2 = await supabase.from('properties').insert(invalid2).select('id').single();
    expect(res2.error).toBeTruthy();
  }, 30000);

  test('Read: by id and batch', async () => {
    const supabase = client();
    const { uid, email } = await ensureUser('landlord');
    await signIn(email);
    const p = await supabase.from('properties').insert(makePayload(uid)).select('id').single();
    const id = p.data.id;
    const one = await supabase.from('properties').select('id,title,owner_id').eq('id', id).single();
    expect(one.error).toBeFalsy();
    const batch = await supabase.from('properties').select('id').limit(5);
    expect(Array.isArray(batch.data)).toBeTruthy();
  }, 30000);

  test('Update: allowed for owner', async () => {
    const supabase = client();
    const { uid, email } = await ensureUser('landlord');
    await signIn(email);
    const created = await supabase.from('properties').insert(makePayload(uid, { category: 'Apartment' })).select('id,price').single();
    const id = created.data.id;
    const upd = await supabase.from('properties').update({ price: 888 }).eq('id', id).select('id,price').single();
    expect(upd.error).toBeFalsy();
    expect(upd.data.price).toBe(888);
  }, 30000);

  test('Delete: allowed for owner', async () => {
    const supabase = client();
    const { uid, email } = await ensureUser('landlord');
    await signIn(email);
    const created = await supabase.from('properties').insert(makePayload(uid)).select('id').single();
    const id = created.data.id;
    const del = await supabase.from('properties').delete().eq('id', id);
    expect(del.error).toBeFalsy();
  }, 30000);

  (HAS_ADMIN ? test : test.skip)('Security: student write blocked (RLS)', async () => {
    const supabase = client();
    const { uid, email } = await ensureUser('student');
    await signIn(email);
    const attempt = await supabase.from('properties').insert(makePayload(uid)).select('id').single();
    expect(attempt.error).toBeTruthy();
  }, 30000);

  test('Security: spoofed owner_id blocked', async () => {
    const supabase = client();
    const { uid: aUid, email: aEmail } = await ensureUser('landlord');
    await signIn(aEmail);
    const attempt = await supabase.from('properties').insert(makePayload(aUid, { owner_id: '00000000-0000-0000-0000-000000000000' })).select('id').single();
    expect(attempt.error).toBeTruthy();
  }, 30000);
}
);
