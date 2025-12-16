import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Layout/Navbar';

export const Diagnostics: React.FC = () => {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [latency, setLatency] = useState<number | null>(null);
    const [msg, setMsg] = useState('');
    const [tables, setTables] = useState<{ name: string; status: 'ok' | 'error'; msg?: string }[]>([]);
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        checkSystem();
    }, []);

    const checkSystem = async () => {
        setStatus('checking');
        setMsg('Starting diagnostics...');
        setTables([]);
        
        const start = performance.now();

        try {
            // 1. Check Auth / Session
            const { data: { session } } = await supabase.auth.getSession();
            setUserInfo(session?.user || null);

            // 2. Check 'properties' table access & Latency
            const { error: propError } = await supabase.from('properties').select('count').limit(1).single();
            const end = performance.now();
            setLatency(Math.round(end - start));

            if (propError) {
                setTables(prev => [...prev, { name: 'properties', status: 'error', msg: propError.message }]);
                throw propError;
            } else {
                setTables(prev => [...prev, { name: 'properties', status: 'ok' }]);
            }

            // 3. Check 'users' table access
            const { error: userError } = await supabase.from('users').select('count').limit(1).single();
            if (userError) {
                setTables(prev => [...prev, { name: 'users', status: 'error', msg: userError.message }]);
                // Don't throw here, just mark as error, maybe RLS blocks it
            } else {
                setTables(prev => [...prev, { name: 'users', status: 'ok' }]);
            }

            // 4. Check 'property_images'
            const { error: imgError } = await supabase.from('property_images').select('count').limit(1).single();
            if (imgError) {
                setTables(prev => [...prev, { name: 'property_images', status: 'error', msg: imgError.message }]);
            } else {
                setTables(prev => [...prev, { name: 'property_images', status: 'ok' }]);
            }

            setStatus('connected');
            setMsg('System is operational.');

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMsg(err.message || 'Connection failed');
        }
    };

    return (
        <div className="page" style={{ padding: '80px 20px', background: '#f4f6f8', minHeight: '100vh' }}>
            <Navbar />
            <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 30, borderRadius: 12, background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h1 style={{ fontSize: 24, marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>System Diagnostics</h1>

                {/* Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                    <div style={{ 
                        width: 16, height: 16, borderRadius: '50%', 
                        background: status === 'connected' ? '#4caf50' : status === 'error' ? '#f44336' : '#ff9800' 
                    }}></div>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>
                        {status === 'checking' ? 'Running Checks...' : status === 'connected' ? 'Systems Normal' : 'System Issue'}
                    </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                    <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#666' }}>Database Latency</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: latency && latency < 500 ? '#4caf50' : '#f44336' }}>
                            {latency ? `${latency} ms` : '---'}
                        </div>
                    </div>
                    <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#666' }}>Auth Status</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                            {userInfo ? `Logged in (${userInfo.role})` : 'Guest / Not Logged in'}
                        </div>
                        {userInfo && <div style={{fontSize: 10, color: '#999', marginTop: 4}}>{userInfo.id}</div>}
                    </div>
                </div>

                {/* Table Checks */}
                <h3 style={{ fontSize: 16, marginBottom: 10 }}>Database Table Access</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {tables.map(t => (
                        <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', background: t.status === 'ok' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', borderRadius: 6, alignItems: 'center' }}>
                            <span style={{ fontWeight: 500 }}>{t.name}</span>
                            <span style={{ fontSize: 13, color: t.status === 'ok' ? '#2e7d32' : '#c62828' }}>
                                {t.status === 'ok' ? 'Accessible ✅' : `Access Denied / Error ❌ (${t.msg})`}
                            </span>
                        </div>
                    ))}
                    {tables.length === 0 && <div style={{ color: '#999', fontSize: 13 }}>Waiting for results...</div>}
                </div>

                <button onClick={checkSystem} className="btn btn-primary" style={{ width: '100%' }}>Re-run Diagnostics</button>
                
                {msg && status === 'error' && (
                    <div style={{ marginTop: 20, padding: 15, background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: 13 }}>
                        <strong>Error Details:</strong> {msg}
                    </div>
                )}
            </div>
        </div>
    );
};

