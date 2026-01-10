import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Connection Guard Hook
 * 
 * Purpose: Proactively check database connection and session validity
 * Execution: Runs in background without blocking UI rendering
 * 
 * Features:
 * - Verifies database connectivity
 * - Validates session tokens
 * - Detects authentication expiry
 * - Auto-triggers on route changes
 * 
 * Return Values:
 * @returns {Object}
 * - isConnected: Boolean indicating database connection status
 * - isChecking: Boolean indicating if check is in progress
 * - error: Error object if connection fails
 * 
 * Usage:
 * const { isConnected, isChecking, error } = useConnectionGuard();
 */
export const useConnectionGuard = () => {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const location = useLocation();

    /**
     * Connection Check Function
     * 
     * Tests:
     * 1. Database connectivity - Simple query to verify connection
     * 2. Session validity - Checks if user session is still active
     * 3. Token expiration - Verifies JWT hasn't expired
     * 
     * Process:
     * - Executes lightweight query (SELECT 1)
     * - Checks current session
     * - Updates connection state
     * - Logs errors without disrupting UI
     */
    const checkConnection = async () => {
        setIsChecking(true);
        setError(null);

        try {
            // Test 1: Database connectivity
            const { error: dbError } = await supabase
                .from('properties')
                .select('id')
                .limit(1);

            if (dbError) throw dbError;

            // Test 2: Session validity
            const { data: { session }, error: sessionError } =
                await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            // Update connection status
            setIsConnected(!!session);

        } catch (err) {
            console.error('Connection check failed:', err);
            setError(err as Error);
            setIsConnected(false);
        } finally {
            setIsChecking(false);
        }
    };

    /**
     * Route Change Listener
     * 
     * Trigger: Runs whenever user navigates to different route
     * Purpose: Ensure connection is valid after route changes
     * 
     * Why: Route changes may involve:
     * - Long idle periods between navigation
     * - Session expiry during user inactivity
     * - Network changes while browsing
     */
    useEffect(() => {
        checkConnection();
    }, [location.pathname]); // Re-check on route change

    /**
     * Authentication Event Listener
     * 
     * Monitors Supabase auth events:
     * - SIGNED_OUT: User logged out → set disconnected
     * - TOKEN_REFRESHED: Token renewed → re-check connection
     * - SIGNED_IN: User logged in → verify connection
     * 
     * Ensures connection state stays synchronized with auth state
     */
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'SIGNED_OUT') {
                    setIsConnected(false);
                } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
                    checkConnection();
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return { isConnected, isChecking, error };
};
