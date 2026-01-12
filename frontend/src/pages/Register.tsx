import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

type Role = 'student' | 'landlord' | 'agent';

// File Upload Component
const FileUpload: React.FC<{ label: string; hint: string; accept: string }> = ({ label, hint, accept }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setPreview(ev.target?.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        }
    };

    return (
        <div className="file-row">
            <div className="avatar-preview" style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: 'cover', color: 'transparent' } : {}}>
                {preview ? '' : <>{label}<br /><span style={{ fontSize: '11px', color: 'var(--muted)' }}>{fileName || 'No file'}</span></>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="file-btn" style={{ display: 'inline-block', textAlign: 'center' }}>
                    Upload {label}
                    <input type="file" accept={accept} style={{ display: 'none' }} onChange={handleFile} />
                </label>
                <div className="hint" style={{ fontSize: '12px', color: 'var(--muted)' }}>{hint}</div>
            </div>
        </div>
    );
};

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register, authReady, authSubmitting } = useAuth();
    const [role, setRole] = useState<Role>('student');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirm: '',
        matric: '',
        agencyName: '',
        agencyLicense: '',
        businessReg: '',
        role: 'student' as Role,
    });
    const [tos, setTos] = useState(false);
    const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
    const [localLoading, setLocalLoading] = useState(false);

    // 注册页面不需要自动跳转到首页
    // 因为注册成功后会强制登出并跳转到登录页
    // Register page does NOT auto-redirect to home
    // After successful register, we force signOut and navigate to login

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);

        // 表单验证
        if (!formData.fullName) return setMsg({ text: 'Please enter your full name.', error: true });
        if (!formData.email || !formData.email.includes('@')) return setMsg({ text: 'Please enter a valid email.', error: true });
        if (formData.password.length < 6) return setMsg({ text: 'Password must be at least 6 characters.', error: true });
        if (formData.password !== formData.confirm) return setMsg({ text: 'Passwords do not match.', error: true });
        if (!tos) return setMsg({ text: 'You must agree to the terms and privacy.', error: true });

        if (role === 'student' && formData.matric.length < 2) return setMsg({ text: 'Students: please provide your Matric No.', error: true });
        if (role === 'agent' && formData.agencyName.length < 2) return setMsg({ text: 'Agents: please provide Agency Name.', error: true });

        setLocalLoading(true);
        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                full_name: formData.fullName,
                role: formData.role,
                phone: formData.phone || undefined,
                student_id: role === 'student' ? formData.matric : undefined,
                agency_name: role === 'agent' ? formData.agencyName : undefined,
                agency_license: role === 'agent' ? formData.agencyLicense : undefined,
                landlord_licenceID: role === 'landlord' ? formData.businessReg : undefined,
            };

            // 调用register - 注册后不会自动登录
            await register(payload);

            // 注册成功 - 显示带倒计时的成功提示
            // Registration success - show countdown toast
            let countdown = 3;
            setMsg({ text: `✅ Registration successful! Redirecting to login in ${countdown}s...`, error: false });

            // 倒计时动画 - Countdown animation
            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    setMsg({ text: `✅ Registration successful! Redirecting to login in ${countdown}s...`, error: false });
                } else {
                    clearInterval(countdownInterval);
                    navigate('/login', { replace: true });
                }
            }, 1000);

        } catch (err: any) {
            setMsg({ text: err?.message || 'Registration failed.', error: true });
        } finally {
            setLocalLoading(false);
        }
    };

    // Password strength
    const getStrength = () => {
        let s = 0;
        if (formData.password.length >= 6) s++;
        if (/[A-Z]/.test(formData.password)) s++;
        if (/[0-9]/.test(formData.password)) s++;
        if (/[^A-Za-z0-9]/.test(formData.password)) s++;
        return Math.min(100, (s / 4) * 100);
    };
    const strength = getStrength();

    // 综合loading状态
    const isLoading = localLoading || authSubmitting;

    // 如果auth还在初始化，显示加载
    if (!authReady) {
        return (
            <div className="auth-page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-bg">
            {/* Toast通知 - 固定在顶部 */}
            {msg && (
                <div
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 99999,
                        padding: '16px 28px',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: msg.error
                            ? '0 10px 40px rgba(239, 68, 68, 0.4)'
                            : '0 10px 40px rgba(16, 185, 129, 0.4)',
                        background: msg.error
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        animation: 'toastSlide 0.4s ease-out'
                    }}
                >
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {msg.error ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        )}
                    </div>
                    <span>{msg.text}</span>
                </div>
            )}

            <style>{`
                @keyframes toastSlide {
                    0% {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-30px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0) scale(1);
                    }
                }
            `}</style>

            <div className="bg-blob blob-a" aria-hidden="true"></div>
            <div className="bg-blob blob-b" aria-hidden="true"></div>

            <main className="auth-card wide" role="main" aria-labelledby="register-title">
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
                    <div className="auth-header-logo">US</div>
                    <div className="title">
                        <h1 id="register-title" style={{ margin: 0, fontSize: '20px' }}>Create account</h1>
                        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>Register as Student, Landlord or Agent to start using USSR</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
                    <div className="auth-field" style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="fullName">Full name</label>
                        <input id="fullName" name="fullName" type="text" placeholder="e.g. Ahmad bin Ali" value={formData.fullName} onChange={handleChange} required />
                    </div>

                    <div className="auth-field" style={{ gridColumn: '1 / -1' }}>
                        <label>Account role</label>
                        <div className="role-group" role="tablist" aria-label="Account role">
                            {(['student', 'landlord', 'agent'] as Role[]).map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    className={clsx('pill', role === r && 'active')}
                                    onClick={() => { setRole(r); setFormData({ ...formData, role: r }); }}
                                >
                                    {r.charAt(0).toUpperCase() + r.slice(1)} {r === 'agent' && '(中介)'}
                                </button>
                            ))}
                        </div>
                        <div className="hint" style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>选择后表单会显示该角色特有的字段与上传项</div>
                    </div>

                    {role === 'student' && (
                        <div className="auth-field">
                            <label htmlFor="matric">Matric No. (Student ID)</label>
                            <input id="matric" name="matric" type="text" placeholder="学号（学生填写）" value={formData.matric} onChange={handleChange} />
                        </div>
                    )}

                    {role === 'agent' && (
                        <>
                            <div className="auth-field">
                                <label htmlFor="agencyName">Agency Name</label>
                                <input id="agencyName" name="agencyName" type="text" placeholder="中介/Agency 名称" value={formData.agencyName} onChange={handleChange} />
                            </div>
                            <div className="auth-field">
                                <label htmlFor="agencyLicense">Agency License No.</label>
                                <input id="agencyLicense" name="agencyLicense" type="text" placeholder="执照编号" value={formData.agencyLicense} onChange={handleChange} />
                            </div>
                        </>
                    )}

                    {role === 'landlord' && (
                        <div className="auth-field">
                            <label htmlFor="businessReg">Business / Registration No. (Landlord)</label>
                            <input id="businessReg" name="businessReg" type="text" placeholder="公司注册号或房东身份证明" value={formData.businessReg} onChange={handleChange} />
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="phone">Phone (optional)</label>
                        <input id="phone" name="phone" type="text" placeholder="+60 12 345 6789" value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" placeholder="至少 6 个字符" value={formData.password} onChange={handleChange} required />
                        <div className="pw-meter">
                            <i style={{ width: `${strength}%`, background: strength < 40 ? 'var(--danger)' : (strength < 70 ? 'orange' : undefined) }}></i>
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="confirm">Confirm password</label>
                        <input id="confirm" name="confirm" type="password" placeholder="重复输入密码" value={formData.confirm} onChange={handleChange} required />
                    </div>

                    <div className="auth-field" style={{ gridColumn: '1 / -1' }}>
                        <label>Uploads (per role)</label>
                        {role === 'student' && (
                            <FileUpload label="Student ID" hint="JPG/PNG/PDF, max 3MB" accept="image/*,application/pdf" />
                        )}
                        {role === 'landlord' && (
                            <FileUpload label="Property Proof" hint="房产证 / 授权书 / PDF, max 3MB" accept="image/*,application/pdf" />
                        )}
                        {role === 'agent' && (
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <FileUpload label="Agency License" hint="执照扫描, max 3MB" accept="image/*,application/pdf" />
                                <FileUpload label="Agreement" hint="Agency Agreement, max 3MB" accept="application/pdf,image/*" />
                            </div>
                        )}
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input id="tos" type="checkbox" checked={tos} onChange={(e) => setTos(e.target.checked)} style={{ width: 18, height: 18 }} />
                        <label htmlFor="tos" style={{ fontSize: '13px', color: 'var(--muted)' }}>I agree to the <Link to="/terms" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>Terms</Link> and <Link to="/privacy" target="_blank" style={{ color: 'var(--accent-2)', fontWeight: 600 }}>Privacy</Link></label>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create account'}
                        </button>
                    </div>

                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign in</Link>
                    </div>
                </form>
            </main>
        </div>
    );
};
