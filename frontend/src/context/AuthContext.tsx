import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Role } from '../types';
import { supabase } from '../lib/supabase';

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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const refreshProfile = async () => {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        const profile = await fetchProfile(uid);
        setUser(profile);
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
        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

    const logout = async () => {
        try {
            // Sign out from Supabase (this clears Supabase's auth storage automatically)
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear React state
            setUser(null);

            // Only clear app-specific data, NOT Supabase's auth storage
            // Remove any app-specific localStorage keys if you have them
            // Example: localStorage.removeItem('app-specific-key');
            // DO NOT use localStorage.clear() or sessionStorage.clear()
            // as it will break Supabase's session persistence

            // Redirect to login page
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
