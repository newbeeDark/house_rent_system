import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Role } from '../types';
import { supabase } from '../lib/supabase';
import { clearChatHistory } from '../components/AIFunction/aiService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    refreshProfile: () => Promise<void>;
    login: (params: { email: string; password: string }) => Promise<void>;
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
    }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        // 从localStorage初始化用户状态（如果可用）
        // Initialize from localStorage if available
        const cached = localStorage.getItem('house_rent_user_profile');
        return cached ? JSON.parse(cached) : null;
    });
    const [loading, setLoading] = useState(!user);
    const [error, setError] = useState<string | null>(null);

    // 防抖引用 - 防止标签页切换时快速状态变化
    // Debounce ref - prevents rapid state changes on tab switch
    const fetchDebounceRef = useRef<NodeJS.Timeout | null>(null);
    // 是否正在获取profile的标志
    // Flag to indicate if profile fetch is in progress
    const isFetchingRef = useRef<boolean>(false);

    const setUserWithCache = (u: User | null) => {
        setUser(u);
        if (u) {
            localStorage.setItem('house_rent_user_profile', JSON.stringify(u));
        } else {
            localStorage.removeItem('house_rent_user_profile');
        }
    };

    const fetchProfile = async (uid: string): Promise<User | null> => {
        for (let i = 0; i < 3; i++) {
            const u = await supabase.from('users').select('role,full_name,avatar_url,terms_accepted_at').eq('id', uid).maybeSingle();
            if (!u.error && u.data) {
                const email = (await supabase.auth.getUser()).data.user?.email || '';
                return { id: uid, name: u.data.full_name || '', email, role: (u.data.role || 'guest') as Role, terms_accepted_at: u.data.terms_accepted_at ?? null };
            }
            const p = await supabase.from('profiles').select('role,full_name,avatar_url').eq('id', uid).maybeSingle();
            if (!p.error && p.data) {
                const email = (await supabase.auth.getUser()).data.user?.email || '';
                return { id: uid, name: p.data.full_name || '', email, role: (p.data.role || 'guest') as Role, terms_accepted_at: null };
            }
            await new Promise(r => setTimeout(r, 500));
        }
        return null;
    };

    /**
     * 安全的profile获取函数（带防抖）
     * Safe profile fetch with debounce to prevent race conditions
     * 如果profile获取失败，不会清除现有用户状态
     * If profile fetch fails, existing user state is NOT cleared
     */
    const safeFetchProfile = useCallback(async (uid: string, forceUpdate: boolean = false) => {
        // 如果已经在获取中，跳过
        // Skip if already fetching
        if (isFetchingRef.current && !forceUpdate) {
            console.log('AuthContext: Skipping fetch, already in progress');
            return;
        }

        isFetchingRef.current = true;
        try {
            const profile = await fetchProfile(uid);
            if (profile) {
                setUserWithCache(profile);
            } else {
                // profile获取失败时，不清除现有用户状态（除非明确登出）
                // Don't clear existing user on fetch failure (unless explicit sign out)
                console.warn('AuthContext: Profile fetch returned null, keeping existing user state');
            }
        } catch (err) {
            console.error('AuthContext: Profile fetch error', err);
            // 错误时也不清除用户状态
            // Don't clear user on error either
        } finally {
            isFetchingRef.current = false;
        }
    }, []);

    const refreshProfile = async () => {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        await safeFetchProfile(uid, true);
    };

    useEffect(() => {
        // 初始会话检查 - Initial session check
        supabase.auth.getSession().then(async ({ data }) => {
            const s = data.session;
            if (s?.user?.id) {
                // 如果有缓存用户且ID匹配，使用缓存并在后台刷新
                // If we have cached user and ID matches, use cache and refresh in background
                if (!user || user.id !== s.user.id) {
                    await safeFetchProfile(s.user.id, true);
                } else {
                    // 后台静默刷新 - Background silent refresh
                    safeFetchProfile(s.user.id, false);
                }
            } else {
                setUserWithCache(null);
            }
            setLoading(false);
        });

        /**
         * 认证状态变化监听器（带防抖和事件过滤）
         * Auth state change listener with debounce and event filtering
         * 
         * 关键修复：
         * 1. 只在 SIGNED_IN 和 SIGNED_OUT 事件时更新用户状态
         * 2. TOKEN_REFRESHED 事件使用防抖，不立即刷新
         * 3. 防止标签页切换触发的快速状态变化
         */
        const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('AuthContext: Auth state change', event);

            // 只处理关键事件 - Only handle critical events
            if (event === 'SIGNED_OUT') {
                // 明确登出，清除用户状态
                // Explicit sign out, clear user state
                setUserWithCache(null);
                setLoading(false);
                return;
            }

            if (event === 'SIGNED_IN') {
                // 新登录，立即获取profile
                // New sign in, fetch profile immediately
                if (session?.user?.id) {
                    await safeFetchProfile(session.user.id, true);
                }
                setLoading(false);
                return;
            }

            // TOKEN_REFRESHED 和其他事件使用防抖
            // TOKEN_REFRESHED and other events use debounce
            if (event === 'TOKEN_REFRESHED' && session?.user?.id) {
                // 清除之前的防抖计时器
                if (fetchDebounceRef.current) {
                    clearTimeout(fetchDebounceRef.current);
                }
                // 延迟1秒后刷新，防止快速切换
                // Delay 1 second before refresh to prevent rapid switching
                fetchDebounceRef.current = setTimeout(() => {
                    safeFetchProfile(session.user.id, false);
                }, 1000);
                return;
            }

            // INITIAL_SESSION 事件不需要处理，因为已经在上面的 getSession 中处理了
            // INITIAL_SESSION doesn't need handling, already handled in getSession above
        });

        return () => {
            sub.subscription.unsubscribe();
            // 清理防抖计时器
            if (fetchDebounceRef.current) {
                clearTimeout(fetchDebounceRef.current);
            }
        };
    }, []);

    const login = async ({ email, password }: { email: string; password: string }) => {
        setLoading(true);
        setError(null);
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
            const text =
                /invalid/i.test(err.message) ? 'Invalid login credentials.' :
                    /email/i.test(err.message) && /confirm/i.test(err.message) ? 'Please confirm your email before signing in.' :
                        err.message || 'Login failed.';
            setError(text);
            setLoading(false);
            throw new Error(text);
        }
        setLoading(false);
    };

    const register = async ({
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
    }) => {
        setLoading(true);
        setError(null);
        const metadata: Record<string, any> = {
            full_name,
            role,
        };
        if (phone) metadata.phone = phone;
        if (student_id) metadata.student_id = student_id;
        if (agency_name) metadata.agency_name = agency_name;
        if (agency_license) metadata.agency_license = agency_license;
        if (landlord_licenceID) metadata.landlord_licenceID = landlord_licenceID;

        const { data, error: err } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        if (err) {
            const text =
                /registered|exists/i.test(err.message) ? 'Email already registered.' :
                    /password|weak/i.test(err.message) ? 'Password is too weak.' :
                        err.message || 'Registration failed.';
            setError(text);
            setLoading(false);
            throw new Error(text);
        }
        setLoading(false);
        if (!data.session) {
            return;
        }
    };

    /**
     * Logout Method
     * 
     * Complete logout process with multiple cleanup steps:
     * 
     * Step 1: Clear AI History
     * - Removes all stored AI chat conversations
     * - Clears localStorage key: 'ai_chat_history'
     * 
     * Step 2: Clear Authentication Data
     * - Removes all auth-related localStorage items
     * - Clears session tokens and user data
     * 
     * Step 3: Sign Out from Supabase
     * - Calls supabase.auth.signOut() with timeout protection
     * - Timeout: 5 seconds (prevents hanging on slow networks)
     * - Continues even if network request fails
     * 
     * Step 4: Redirect to Login
     * - Uses window.location.href for hard redirect
     * - Ensures all React state is completely cleared
     * - Forces fresh page load at /login
     * 
     * Error Handling:
     * - Logs errors but doesn't block logout
     * - User always gets logged out even if API fails
     * - Timeout ensures no infinite waiting
     */
    const logout = async () => {
        // IMMEDIATE REDIRECT - No delay for user
        // Store cleanup flag to run after redirect
        const needsCleanup = true;

        try {
            // Step 1: Clear all local data SYNCHRONOUSLY (instant)
            clearChatHistory();
            localStorage.removeItem('house_rent_user_profile');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('user_data');
            sessionStorage.clear();

            // Step 2: Clear React state (instant)
            setUserWithCache(null);

            // Step 3: IMMEDIATE HARD REDIRECT (no waiting!)
            window.location.href = '/login';

            // Step 4: Background cleanup (happens after redirect)
            // This won't block the redirect since location.href is synchronous navigation
            if (needsCleanup) {
                // Attempt Supabase sign out in background
                // This will complete after page navigation starts
                supabase.auth.signOut().catch(err => {
                    // Silent fail - user already logged out locally
                    console.error('Background sign out error:', err);
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even on error
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, error, refreshProfile, login, register, logout }}>
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
