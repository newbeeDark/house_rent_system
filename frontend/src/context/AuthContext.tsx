import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Role } from '../types';
import type { Session, User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { clearChatHistory } from '../components/AIFunction/aiService';

/**
 * AuthContext 类型定义
 * 3个独立的loading状态，防止互相阻塞
 */
interface AuthContextType {
    // 3个独立的loading状态 - 3 separate loading states
    authInitializing: boolean;  // 应用启动时读取session
    authSubmitting: boolean;    // signIn/signUp/signOut 网络操作
    profileLoading: boolean;    // 从数据库拉取profile

    // 稳定值 - Stable values
    session: Session | null;
    user: User | null;
    isAuthenticated: boolean;   // !!session?.user - 仅由session决定
    authReady: boolean;         // !authInitializing - 初始化完成标志

    // 方法 - Methods
    login: (params: { email: string; password: string }) => Promise<{ session: Session }>;
    register: (params: {
        email: string;
        password: string;
        full_name: string;
        role: Role;
        phone?: string;
        student_id?: string;
        agency_name?: string;
        agency_license?: string;
        landlord_licenceID?: string;
    }) => Promise<{ user: AuthUser; session: Session | null }>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // ========================
    // 状态定义 - State definitions
    // ========================

    // Session状态 - 仅由session决定登录状态
    const [session, setSession] = useState<Session | null>(null);

    // Profile状态 - 可以失败但不影响登录
    const [user, setUser] = useState<User | null>(() => {
        const cached = localStorage.getItem('house_rent_user_profile');
        return cached ? JSON.parse(cached) : null;
    });

    // 3个独立的loading状态
    const [authInitializing, setAuthInitializing] = useState(true);  // 初始为true
    const [authSubmitting, setAuthSubmitting] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // 派生状态 - Derived states
    const isAuthenticated = !!session?.user;
    const authReady = !authInitializing;

    // 防抖和去重引用
    const fetchRequestIdRef = useRef<number>(0);
    const initCompletedRef = useRef(false);

    // ========================
    // Profile缓存 - Profile cache helper
    // ========================
    const setUserWithCache = useCallback((u: User | null) => {
        setUser(u);
        if (u) {
            localStorage.setItem('house_rent_user_profile', JSON.stringify(u));
        } else {
            localStorage.removeItem('house_rent_user_profile');
        }
    }, []);

    // ========================
    // Profile获取 - Profile fetch (不影响session/auth状态)
    // ========================
    const fetchProfile = useCallback(async (uid: string): Promise<User | null> => {
        // 重试3次
        for (let i = 0; i < 3; i++) {
            try {
                const u = await supabase.from('users').select('role,full_name,avatar_url,terms_accepted_at').eq('id', uid).maybeSingle();
                if (!u.error && u.data) {
                    const emailResult = await supabase.auth.getUser();
                    const email = emailResult.data.user?.email || '';
                    return {
                        id: uid,
                        name: u.data.full_name || '',
                        email,
                        role: (u.data.role || 'guest') as Role,
                        terms_accepted_at: u.data.terms_accepted_at ?? null
                    };
                }
                // 回退到profiles表
                const p = await supabase.from('profiles').select('role,full_name,avatar_url').eq('id', uid).maybeSingle();
                if (!p.error && p.data) {
                    const emailResult = await supabase.auth.getUser();
                    const email = emailResult.data.user?.email || '';
                    return {
                        id: uid,
                        name: p.data.full_name || '',
                        email,
                        role: (p.data.role || 'guest') as Role,
                        terms_accepted_at: null
                    };
                }
            } catch (err) {
                console.warn('AuthContext: Profile fetch attempt failed', i, err);
            }
            await new Promise(r => setTimeout(r, 500));
        }
        return null;
    }, []);

    /**
     * 安全的profile获取 - 带去重机制
     * 失败时不会清除session，不会影响登录状态
     */
    const safeFetchProfile = useCallback(async (uid: string) => {
        const requestId = ++fetchRequestIdRef.current;

        setProfileLoading(true);
        try {
            const profile = await fetchProfile(uid);

            // 检查是否是最新请求（去重）
            if (requestId !== fetchRequestIdRef.current) {
                console.log('AuthContext: Ignoring stale profile fetch', requestId);
                return;
            }

            if (profile) {
                setUserWithCache(profile);
            } else {
                // Profile获取失败 - 不清除session，不影响登录
                console.warn('AuthContext: Profile fetch failed, keeping session');
            }
        } catch (err) {
            console.error('AuthContext: Profile fetch error', err);
            // 错误时也不清除session
        } finally {
            if (requestId === fetchRequestIdRef.current) {
                setProfileLoading(false);
            }
        }
    }, [fetchProfile, setUserWithCache]);

    const refreshProfile = useCallback(async () => {
        if (session?.user?.id) {
            await safeFetchProfile(session.user.id);
        }
    }, [session, safeFetchProfile]);

    // ========================
    // 初始化 - One-time session initialization
    // ========================
    useEffect(() => {
        // 防止重复初始化
        if (initCompletedRef.current) return;
        initCompletedRef.current = true;

        const initSession = async () => {
            try {
                const { data, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('AuthContext: getSession error', sessionError);
                    setSession(null);
                    return;
                }

                const s = data.session;
                setSession(s);

                if (s?.user?.id) {
                    // 有session，后台获取profile（不阻塞authReady）
                    safeFetchProfile(s.user.id);
                } else {
                    // 无session，清除缓存的profile
                    setUserWithCache(null);
                }
            } catch (err) {
                console.error('AuthContext: Init error', err);
                setSession(null);
            } finally {
                // 无论成功失败，都结束初始化
                setAuthInitializing(false);
            }
        };

        initSession();
    }, [safeFetchProfile, setUserWithCache]);

    // ========================
    // onAuthStateChange - 带去重
    // ========================
    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('AuthContext: Auth state change', event);

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUserWithCache(null);
                return;
            }

            if (event === 'SIGNED_IN' && newSession) {
                setSession(newSession);
                if (newSession.user?.id) {
                    safeFetchProfile(newSession.user.id);
                }
                return;
            }

            if (event === 'TOKEN_REFRESHED' && newSession) {
                // 只更新session，不触发profile fetch
                setSession(newSession);
                return;
            }

            if (event === 'USER_UPDATED' && newSession) {
                setSession(newSession);
                if (newSession.user?.id) {
                    safeFetchProfile(newSession.user.id);
                }
                return;
            }
        });

        return () => {
            sub.subscription.unsubscribe();
        };
    }, [safeFetchProfile, setUserWithCache]);

    // ========================
    // login - 返回 { session }
    // ========================
    const login = useCallback(async ({ email, password }: { email: string; password: string }): Promise<{ session: Session }> => {
        setAuthSubmitting(true);
        setError(null);

        try {
            const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });

            if (err) {
                const text = /invalid/i.test(err.message)
                    ? 'Invalid login credentials.'
                    : /email/i.test(err.message) && /confirm/i.test(err.message)
                        ? 'Please confirm your email before signing in.'
                        : err.message || 'Login failed.';
                setError(text);
                throw new Error(text);
            }

            if (!data.session) {
                const text = 'Login succeeded but no session returned.';
                setError(text);
                throw new Error(text);
            }

            // 成功 - session会通过onAuthStateChange自动更新
            return { session: data.session };
        } finally {
            setAuthSubmitting(false);
        }
    }, []);

    // ========================
    // register - 注册后强制登出，不自动登录
    // ========================
    const register = useCallback(async ({
        email,
        password,
        full_name,
        role,
        phone,
        student_id,
        agency_name,
        agency_license,
        landlord_licenceID,
    }: {
        email: string;
        password: string;
        full_name: string;
        role: Role;
        phone?: string;
        student_id?: string;
        agency_name?: string;
        agency_license?: string;
        landlord_licenceID?: string;
    }): Promise<{ user: AuthUser; session: Session | null }> => {
        setAuthSubmitting(true);
        setError(null);

        try {
            const metadata: Record<string, any> = { full_name, role };
            if (phone) metadata.phone = phone;
            if (student_id) metadata.student_id = student_id;
            if (agency_name) metadata.agency_name = agency_name;
            if (agency_license) metadata.agency_license = agency_license;
            if (landlord_licenceID) metadata.landlord_licenceID = landlord_licenceID;

            const { data, error: err } = await supabase.auth.signUp({
                email,
                password,
                options: { data: metadata },
            });

            if (err) {
                const text = /registered|exists/i.test(err.message)
                    ? 'Email already registered.'
                    : /password|weak/i.test(err.message)
                        ? 'Password is too weak.'
                        : err.message || 'Registration failed.';
                setError(text);
                throw new Error(text);
            }

            if (!data.user) {
                const text = 'Registration failed - no user returned.';
                setError(text);
                throw new Error(text);
            }

            // 注册成功后强制登出并清除所有缓存
            // Force sign out and clear all cache after successful registration
            console.log('AuthContext: Register success, forcing sign out and clearing cache');

            // 清除Supabase session
            await supabase.auth.signOut();

            // 清除所有本地缓存
            localStorage.removeItem('house_rent_user_profile');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('user_data');
            sessionStorage.clear();

            // 清除状态
            setSession(null);
            setUserWithCache(null);

            return { user: data.user, session: null };
        } finally {
            setAuthSubmitting(false);
        }
    }, [setUserWithCache]);

    // ========================
    // logout
    // ========================
    const logout = useCallback(async () => {
        try {
            clearChatHistory();
            localStorage.removeItem('house_rent_user_profile');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('user_data');
            sessionStorage.clear();

            setSession(null);
            setUserWithCache(null);

            window.location.href = '/login';

            supabase.auth.signOut().catch(err => {
                console.error('Background sign out error:', err);
            });
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
    }, [setUserWithCache]);

    // ========================
    // Provider
    // ========================
    return (
        <AuthContext.Provider value={{
            authInitializing,
            authSubmitting,
            profileLoading,
            session,
            user,
            isAuthenticated,
            authReady,
            login,
            register,
            logout,
            refreshProfile,
            error
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
