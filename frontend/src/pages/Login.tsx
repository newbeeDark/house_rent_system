import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Logo } from '../components/Common/Logo';
import { useAuth } from '../context/AuthContext';
import { TermsModal } from '../components/Common/TermsModal';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, authReady, isAuthenticated, authSubmitting } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    // 如果已登录，立即跳转到首页
    // If already authenticated, redirect to home immediately
    useEffect(() => {
        if (authReady && isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [authReady, isAuthenticated, navigate]);

    // 3D Tilt Logic
    const cardRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;
        const handleMove = (e: PointerEvent) => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rxMult = 16, ryMult = 28;
            const rx = (py - 0.5) * rxMult;
            const ry = (px - 0.5) * -ryMult;
            card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
            card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
            card.style.setProperty('--s', '1.06');
        };
        const handleLeave = () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
            card.style.setProperty('--s', '1');
        };

        card.addEventListener('pointermove', handleMove);
        card.addEventListener('pointerleave', handleLeave);
        return () => {
            card.removeEventListener('pointermove', handleMove);
            card.removeEventListener('pointerleave', handleLeave);
        };
    }, []);

    // 表单验证后显示条款弹窗
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);

        try {
            if (!email) throw new Error('Please enter your email.');
            if (!password) throw new Error('Please enter your password.');
            setShowTerms(true);
        } catch (err: any) {
            setMsg({ text: err.message, error: true });
        }
    };

    // 同意条款后执行登录
    const handleTermsAgreed = async () => {
        setShowTerms(false);
        setLocalLoading(true);

        try {
            // 调用login - 返回 { session }
            const { session } = await login({ email, password });

            // 更新terms_accepted_at
            if (session.user) {
                await supabase
                    .from('users')
                    .update({ terms_accepted_at: new Date().toISOString() })
                    .eq('id', session.user.id);
            }

            // 检查角色决定跳转目标
            let targetPath = '/';
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .maybeSingle();

            if (profile?.role === 'admin' || session.user.user_metadata?.role === 'admin') {
                targetPath = '/admin/dashboard';
            }

            // 显示成功消息
            setMsg({ text: 'Signed in successfully — redirecting...', error: false });

            // 动画后跳转
            if (cardRef.current) {
                cardRef.current.style.animation = 'exitUp 500ms cubic-bezier(.2,.9,.2,1) both';
            }

            setTimeout(() => {
                navigate(targetPath, { replace: true });
            }, 500);

        } catch (err: any) {
            setMsg({ text: err.message || 'Login failed.', error: true });
        } finally {
            setLocalLoading(false);
        }
    };

    const handleTermsCancel = () => {
        setShowTerms(false);
    };

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
            <main className="auth-card" ref={cardRef} role="main" aria-labelledby="page-title">
                <div className="accent-ring" aria-hidden="true" style={{ position: 'absolute', inset: 'auto -10px -10px auto', width: 96, height: 96, borderRadius: 28, background: 'radial-gradient(circle at 30% 30%, rgba(30,136,255,0.09), transparent 42%)', mixBlendMode: 'screen', pointerEvents: 'none' }}></div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '28px', animation: 'logoIn 420ms cubic-bezier(.2,.9,.2,1) both', animationDelay: '120ms' }}>
                    <Logo />
                    <div>
                        <div id="page-title" style={{ fontWeight: 800, fontSize: '18px', lineHeight: '1.2', color: 'var(--text)' }}>
                            UKM Students off School Rented System
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--muted-dark)', marginTop: '2px' }}>
                            Sign in to find & manage off-campus housing
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="auth-field" style={{ animation: 'fieldIn 420ms cubic-bezier(.2,.9,.2,1) both', animationDelay: '120ms' }}>
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div className="auth-field" style={{ animation: 'fieldIn 420ms cubic-bezier(.2,.9,.2,1) both', animationDelay: '240ms' }}>
                        <label htmlFor="password" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Password</span>
                            <span style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Forgot?</span>
                        </label>
                        <input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'fieldIn 420ms cubic-bezier(.2,.9,.2,1) both', animationDelay: '360ms', marginTop: '16px', marginBottom: '20px' }}>
                        <label className="remember" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setRemember(!remember)}>
                            <div className={clsx('switch', remember && 'on')} role="checkbox" aria-checked={remember}>
                                <div className="dot"></div>
                            </div>
                            <span style={{ fontSize: '14px' }}>Remember me</span>
                        </label>
                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Need an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Register</Link></div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 600, animation: 'btnIn 420ms cubic-bezier(.2,.9,.2,1) both', animationDelay: '480ms' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {msg && (
                        <div className={clsx('msg', msg.error ? 'error' : 'ok', 'show')} style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', marginTop: '16px', background: msg.error ? 'rgba(255,107,107,0.12)' : 'rgba(32,201,151,0.08)', color: msg.error ? '#ff6b6b' : '#20c997', animation: 'pop 220ms ease both' }}>
                            {msg.text}
                        </div>
                    )}

                    <div style={{ marginTop: '24px', fontSize: '13px', color: 'var(--muted)', animation: 'helperIn 420ms ease both', animationDelay: '600ms' }}>
                        By signing in you agree to the <Link to="/terms" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Terms</Link> and <Link to="/privacy" style={{ color: 'var(--accent-2)', textDecoration: 'none' }}>Privacy</Link>.
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--muted)', animation: 'helperIn 420ms ease both', animationDelay: '700ms' }}>
                        If you have trouble signing in, contact support.
                    </div>
                </form>
            </main>

            {showTerms && (
                <TermsModal
                    mode="embedded"
                    onAgree={handleTermsAgreed}
                    onClose={handleTermsCancel}
                />
            )}
        </div>
    );
};
