import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Role } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async (uid: string): Promise<User | null> => {
        for (let i = 0; i < 3; i++) {
            const u = await supabase.from('users').select('role,full_name,avatar_url').eq('id', uid).maybeSingle();
            if (!u.error && u.data) {
                const email = (await supabase.auth.getUser()).data.user?.email || '';
                return { id: uid, name: u.data.full_name || '', email, role: (u.data.role || 'guest') as Role };
            }
            const p = await supabase.from('profiles').select('role,full_name,avatar_url').eq('id', uid).maybeSingle();
            if (!p.error && p.data) {
                const email = (await supabase.auth.getUser()).data.user?.email || '';
                return { id: uid, name: p.data.full_name || '', email, role: (p.data.role || 'guest') as Role };
            }
            await new Promise(r => setTimeout(r, 500));
        }
        return null;
    };

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            const s = data.session;
            if (s?.user?.id) {
                const profile = await fetchProfile(s.user.id);
                setUser(profile);
            } else {
                setUser(null);
            }
        });
        const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user?.id) {
                const profile = await fetchProfile(session.user.id);
                setUser(profile);
            } else {
                setUser(null);
            }
        });
        return () => {
            sub.subscription.unsubscribe();
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

   // 在 src/context/AuthContext.tsx 中找到 logout 函数

        const logout = async () => {
        try {
            // 1. 尝试通知服务器退出 (但这步可能会慢，或者出错)
            await supabase.auth.signOut();
        } catch (error) {
            // 就算出错也不要在意，反正我们要走了
            console.error("Logout warning:", error);
        } finally {
            // 2. 【关键修正】这里的内容，无论上面成功、失败、还是超时，都 100% 会执行！
            
            // 清理 React 状态
            setUser(null);
            
            // 暴力清理所有缓存 (确保刷新后一定是未登录)
            localStorage.clear();
            sessionStorage.clear();
            
            // 强制刷新并跳转 (相当于自动帮你按了 F5)
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, error, login, register, logout }}>
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
