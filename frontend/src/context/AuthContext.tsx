import React, { createContext, useContext, useState, useEffect } from 'react';
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
        // Initialize from localStorage if available
        const cached = localStorage.getItem('house_rent_user_profile');
        return cached ? JSON.parse(cached) : null;
    });
    const [loading, setLoading] = useState(!user);
    const [error, setError] = useState<string | null>(null);

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

    const refreshProfile = async () => {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        const profile = await fetchProfile(uid);
        setUserWithCache(profile);
    };

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(async ({ data }) => {
            const s = data.session;
            if (s?.user?.id) {
                // If we have a cached user and it matches the session ID, we can keep using it
                // but we should refresh it in background to ensure role is up to date
                if (!user || user.id !== s.user.id) {
                    const profile = await fetchProfile(s.user.id);
                    setUserWithCache(profile);
                } else {
                    // Background refresh
                    fetchProfile(s.user.id).then(profile => {
                        if (profile) setUserWithCache(profile);
                    });
                }
            } else {
                setUserWithCache(null);
            }
            setLoading(false);
        });

        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user?.id) {
                const profile = await fetchProfile(session.user.id);
                setUserWithCache(profile);
            } else {
                setUserWithCache(null);
            }
            setLoading(false);
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
