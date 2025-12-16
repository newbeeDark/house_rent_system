import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { runSupabaseSchemaCheck } from '../services/supabaseSchemaCheck';
import { getUserProfile, uploadAvatar } from '../services/profile.service';

interface Doc {
    name: string;
    url: string;
    type: string;
}

export const Profile: React.FC = () => {
    const { user } = useAuth(); // simplistic access
    const navigate = useNavigate();
// ✅ 新增：加载用户数据的 Effect
    useEffect(() => {
        async function loadData() {
            if (!user?.id) return;
            
            const data = await getUserProfile(user.id);
            if (data) {
                // 将数据库里的数据填充到表单里
                setFullName(data.full_name || '');
                setDisplayName(data.full_name || ''); // 假设显示名也是全名
                setPhone(data.phone || '');
                setRole(data.role as any || 'student');
                setStudentId(data.student_id || '');
                setAgencyName(data.agency_name || '');
                setAgencyLicense(data.agency_license || '');
                setIsVerified(data.is_verified || false);
                // 如果有头像 state 也要在这里设置
            }
        }
        loadData();
    }, [user?.id]); // 依赖 user.id 变化时重新加载
    // Local form state
    const [fullName, setFullName] = useState(user?.name || '');
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'student' | 'landlord' | 'agent'>(user?.role === 'agent' || user?.role === 'landlord' ? user.role : 'student');
    const [studentId, setStudentId] = useState('');
    const [agencyName, setAgencyName] = useState('');
    const [agencyLicense, setAgencyLicense] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    // Prefs
    const [prefs, setPrefs] = useState({ email: true, sms: false, push: false });
    const [privacy, setPrivacy] = useState({ visible: true, showContact: false });

    // Address
    const [address, setAddress] = useState('');
    const [locating, setLocating] = useState(false);

    // Docs
    const [docs, setDocs] = useState<Doc[]>([]);

    // Avatar
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Password
    const [pwd, setPwd] = useState({ current: '', new: '', confirm: '' });
    const [pwdMsg, setPwdMsg] = useState({ text: '', error: false });

    // Toast
    const [toast, setToast] = useState<{ text: string; bg?: string } | null>(null);

    // Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (!user) {
            // navigate('/login'); // Allow guest viewing for demo? maybe not
        } else {
            // In a real app, fetch profile from API
            setFullName(user.name);
            setDisplayName(user.name);
            setEmail(user.email);
            if (user.role === 'agent' || user.role === 'landlord' || user.role === 'student') {
                setRole(user.role);
            }
        }
    }, [user]);

    useEffect(() => {
        (async () => {
            if (user?.id) {
                const dbu = await getUserProfile(user.id);
                if (dbu) {
                    setFullName(dbu.full_name || '');
                    setPhone(dbu.phone || '');
                    if (dbu.role === 'agent' || dbu.role === 'landlord' || dbu.role === 'student') {
                        setRole(dbu.role as any);
                    }
                    setStudentId(dbu.student_id || '');
                    setAgencyName(dbu.agency_name || '');
                    setAgencyLicense(dbu.agency_license || '');
                    setIsVerified(!!dbu.is_verified);
                    setAvatarUrl(dbu.avatar_url || null);
                }
            }
        })();
    }, [user]);
    const showToastMsg = (text: string, error = false) => {
        setToast({ text, bg: error ? 'linear-gradient(90deg,var(--danger),#ff8b8b)' : 'linear-gradient(90deg,var(--accent),var(--accent-2))' });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith('image/')) { showToastMsg('Invalid avatar file', true); return; }
        const url = await uploadAvatar(f);
        if (!url) { showToastMsg('Avatar upload failed', true); return; }
        setAvatarUrl(url);
        showToastMsg('Avatar updated');
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 3 * 1024 * 1024) { showToastMsg('File too large (max 3MB)', true); return; }
        const url = URL.createObjectURL(f);
        setDocs([...docs, { name: f.name, url, type: f.type }]);
        showToastMsg('Document uploaded (demo)');
    };

    const detectAddress = async () => {
        if (!navigator.geolocation) {
            setAddress('Geolocation not supported');
            return;
        }
        setLocating(true);
        try {
            const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }));
            const { latitude: lat, longitude: lon } = pos.coords;
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`);
            const data = await resp.json();
            const addr = data.display_name || 'Unknown location';
            setAddress(addr);
            showToastMsg('Address detected');
        } catch (err) {
            console.warn(err);
            showToastMsg('Location failed', true);
        } finally {
            setLocating(false);
        }
    };

    const handleSave = () => {
        if (!fullName.trim()) { showToastMsg('Full name is required', true); return; }
        showToastMsg('Profile saved (demo)');
    };

    const handleExport = () => {
        const data = { fullName, displayName, email, phone, role, prefs, privacy, address, docs };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ukm_profile.json';
        a.click();
        URL.revokeObjectURL(url);
        showToastMsg('Profile exported');
    };

    const handleDelete = () => {
        // mock delete
        setShowDeleteModal(false);
        showToastMsg('Account deleted (demo)');
        navigate('/');
    };

    return (
        <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
            <Navbar />

            <main className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px', maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
                <section className="card" style={{ background: 'rgba(255,255,255,0.94)', borderRadius: 12, padding: 24, boxShadow: '0 8px 26px rgba(8,12,24,0.06)' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>My profile</h2>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>Edit your personal details. Changes are saved locally in this demo.</p>

                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>Avatar</label>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '24px', fontWeight: 700, overflow: 'hidden' }}>
                                    {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (displayName || user?.name || 'UK').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                        <label className="btn btn-ghost" style={{ cursor: 'pointer', fontSize: '13px', padding: '6px 12px' }}>
                                            Upload avatar
                                            <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
                                        </label>
                                        <button type="button" onClick={() => setAvatarUrl(null)} className="btn btn-ghost" style={{ fontSize: '13px', padding: '6px 12px' }}>Remove</button>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Max 3 MB. Used on listings.</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>Full Name</label>
                                <input className="input-field" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Ahmad bin Ali" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>Display Name</label>
                                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Public display name" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)' }} />
                            </div>
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)' }} disabled />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>Phone</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+60 12 345 6789" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>Account Role</label>
                            <select value={role} onChange={e => setRole(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)' }}>
                                <option value="student">Student</option>
                                <option value="landlord">Landlord</option>
                                <option value="agent">Agent</option>
                            </select>
                            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 6 }} >Switching roles is disabled in this mockup (requires re-login or verification).</div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>Identity / Verification</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <label className="btn btn-ghost" style={{ cursor: 'pointer', fontSize: '13px' }}>
                                    Upload document
                                    <input type="file" accept="image/*,application/pdf" onChange={handleDocUpload} hidden />
                                </label>
                                {docs.map((d, i) => (
                                    <div key={i} style={{ padding: '6px 10px', background: '#F0F4F8', borderRadius: 8, fontSize: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>{d.name.substring(0, 15)}...</span>
                                        <button type="button" onClick={() => setDocs(docs.filter((_, idx) => idx !== i))} style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>×</button>
                                    </div>
                                ))}
                                <div style={{ padding: '6px 10px', background: isVerified ? 'rgba(16,183,127,0.1)' : '#F0F4F8', borderRadius: 8, fontSize: '12px' }}>
                                    {isVerified ? 'Verified account' : 'Not verified'}
                                </div>
                            </div>
                        </div>

                        {role === 'student' && (
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>Student ID</label>
                                <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="e.g. A21XX..." style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)' }} />
                            </div>
                        )}

                        {(role === 'agent' || role === 'landlord') && (
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>Agency Name</label>
                                    <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Company / Agency" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: 6 }}>License No</label>
                                    <input type="text" value={agencyLicense} onChange={e => setAgencyLicense(e.target.value)} placeholder="License / Registration" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)' }} />
                                </div>
                            </div>
                        )}

                        

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <button type="submit" className="btn btn-primary">Save changes</button>
                            <button type="button" onClick={handleExport} className="btn btn-ghost">Export profile</button>
                            <button type="button" onClick={() => setShowDeleteModal(true)} className="btn btn-ghost" style={{ marginLeft: 'auto', color: 'var(--danger)' }}>Delete account</button>
                        </div>
                    </form>
                </section>

                <aside>
                    <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 12 }}>Account summary</div>
                        <div style={{ fontSize: '13px', marginBottom: 6 }}><strong>Role:</strong> {role}</div>
                        <div style={{ fontSize: '13px', marginBottom: 6 }}><strong>Email:</strong> {email || '—'}</div>
                        <div style={{ fontSize: '13px', marginBottom: 6 }}><strong>Phone:</strong> {phone || '—'}</div>
                        
                    </div>
                </aside>
            </main>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: '90%', maxWidth: 400 }}>
                        <h3 style={{ margin: '0 0 12px' }}>Delete Account?</h3>
                        <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: 20 }}>This action cannot be undone. All your data will be removed locally.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost">Cancel</button>
                            <button onClick={handleDelete} className="btn btn-primary" style={{ background: 'var(--danger)' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', borderRadius: 20, color: '#fff', background: toast.bg, fontSize: '14px', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    {toast.text}
                </div>
            )}
        </div>
    );
};
