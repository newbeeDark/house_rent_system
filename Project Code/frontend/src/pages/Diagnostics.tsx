import React, { useState } from 'react';
import { Navbar } from '../components/Layout/Navbar';
import { supabase } from '../lib/supabase';

type LogItem = { title: string; ok: boolean; detail?: any };

export const Diagnostics: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const push = (item: LogItem) => setLogs(prev => [...prev, item]);
  const [running, setRunning] = useState(false);

  const ensureAuth = async () => {
    const email = `diag_${Date.now()}@example.com`;
    const password = 'DiagTest#12345';
    const signUp = await supabase.auth.signUp({ email, password });
    if (signUp.error && !/already/.test(signUp.error.message)) {
      push({ title: 'Auth signUp', ok: false, detail: signUp.error.message });
      return null;
    }
    const user = signUp.data.user || (await supabase.auth.getUser()).data.user;
    push({ title: 'Auth user', ok: !!user, detail: user?.id });
    return user?.id || null;
  };

  const testReadActiveProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('id,title,price,status')
      .eq('status', 'active')
      .limit(3);
    push({ title: 'Read active properties', ok: !error, detail: error ? error.message : data });
  };

  const testWriteProperty = async (uid: string | null) => {
    if (!uid) {
      push({ title: 'Write property precheck', ok: false, detail: 'No auth user' });
      return;
    }
    const payload = {
      owner_id: uid,
      title: 'Diag Test Listing',
      price: 1234,
      beds: 1,
      address: 'Diag Street',
      status: 'active',
    };
    const { data, error } = await supabase.from('properties').insert(payload).select('id,title').single();
    push({ title: 'Insert property', ok: !error, detail: error ? error.message : data });
    if (!error && data?.id) {
      const { data: back, error: re } = await supabase.from('properties').select('id,title').eq('id', data.id).single();
      push({ title: 'Read back property', ok: !re, detail: re ? re.message : back });
    }
  };

  const runAll = async () => {
    setRunning(true);
    setLogs([]);
    try {
      await testReadActiveProperties();
      const uid = await ensureAuth();
      await testWriteProperty(uid);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
      <Navbar />
      <main className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
        <section className="card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Diagnostics</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Run end-to-end DB connectivity and RLS/write tests.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={runAll} className="btn btn-primary" disabled={running}>{running ? 'Running...' : 'Run tests'}</button>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            {logs.map((l, i) => (
              <div key={i} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>{l.title}</span>
                <span style={{ color: l.ok ? 'var(--success)' : 'var(--danger)' }}>{l.ok ? 'OK' : 'FAIL'}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

