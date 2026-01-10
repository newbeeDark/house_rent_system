import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase URL or Anon Key. Please check your .env file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            storage: sessionStorage, // 使用 sessionStorage 替代 localStorage，实现"页面关闭即失效"
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

/**
 * Authentication Error Detection
 * 
 * Purpose: Identify Supabase authentication errors
 * Checks for:
 * - Token expired errors
 * - JWT validation failures
 * - Session not found errors
 * 
 * @param error - Error object from Supabase
 * @returns true if error is authentication-related
 */
export const isAuthError = (error: any): boolean => {
    if (!error) return false;

    const authErrorMessages = [
        'JWT expired',
        'invalid claim',
        'session_not_found',
        'refresh_token_not_found'
    ];

    return authErrorMessages.some(msg =>
        error.message?.toLowerCase().includes(msg.toLowerCase())
    );
};

/**
 * Unified Error Handler
 * 
 * Purpose: Centralized Supabase error handling
 * 
 * Process:
 * 1. Check if error is authentication-related
 * 2. If auth error, trigger automatic logout
 * 3. Clear all local data
 * 4. Redirect to login page
 * 5. If non-auth error, just log it
 * 
 * Usage: Call this in catch blocks for Supabase operations
 */
export const handleSupabaseError = (error: any, context?: string) => {
    if (isAuthError(error)) {
        console.error(`Auth error in ${context}:`, error);
        forceLogout();
    } else {
        console.error(`Error in ${context}:`, error);
    }
};

/**
 * Force Logout Utility
 * 
 * Purpose: Immediate local logout without network dependency
 * Use Cases:
 * - Network timeout issues
 * - Session corruption
 * - Manual forced logout needed
 * - Automatic logout on auth errors
 * 
 * Process:
 * 1. Clear all localStorage items
 * 2. Clear all sessionStorage items
 * 3. Immediate redirect to login (hard navigation)
 * 
 * Advantages:
 * - No network wait time
 * - Works even when offline
 * - Guaranteed to execute quickly
 * 
 * Disadvantages:
 * - Doesn't notify server of logout
 * - Session may remain active server-side until expiry
 */
export const forceLogout = () => {
    // Clear all local storage
    localStorage.clear();

    // Clear session storage
    sessionStorage.clear();

    // Immediate redirect without React Router
    window.location.href = '/login';
};

/**
 * Safe Query Wrapper
 * 
 * Purpose: Wraps Supabase queries with automatic error handling
 * 
 * Features:
 * - Automatic auth error detection
 * - Auto-logout on authentication failures
 * - Consistent error handling across app
 * 
 * @param queryFn - Async function that performs Supabase query
 * @param context - Description of operation (for logging)
 * @returns Query result or throws error
 */
export const safeQuery = async <T>(
    queryFn: () => Promise<T>,
    context: string
): Promise<T> => {
    try {
        return await queryFn();
    } catch (error) {
        handleSupabaseError(error, context);
        throw error;
    }
};

/**
 * Authentication Error Listener
 * 
 * Purpose: Global listener for auth state changes
 * Setup: Called once during app initialization
 * 
 * Monitors:
 * - SIGNED_OUT events → triggers cleanup
 * - TOKEN_REFRESHED events → updates session
 * - Auth errors → triggers force logout
 * 
 * Effect: Ensures consistent auth state across tabs
 */
export const setupAuthErrorListener = () => {
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            localStorage.clear();
        } else if (event === 'TOKEN_REFRESHED' && !session) {
            forceLogout();
        }
    });
};
