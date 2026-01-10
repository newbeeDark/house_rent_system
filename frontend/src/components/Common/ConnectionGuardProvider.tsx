import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useConnectionGuard } from '../../hooks/useConnectionGuard';

/**
 * Connection Guard Provider
 * 
 * Purpose: Wraps entire application to provide connection monitoring
 * Location: Injected at app root (in App.tsx)
 * 
 * Functionality:
 * - Runs connection checks in background
 * - Doesn't block rendering (non-blocking)
 * - Logs connection issues in development mode
 * - Silent in production (no user-facing alerts)
 * 
 * Rendering Strategy:
 * - Always renders children immediately
 * - Connection checks happen asynchronously
 * - No loading states or blocking UI
 * 
 * Development Mode:
 * - Logs connection status to console
 * - Helps debug connection issues
 * - Shows error details
 * 
 * Production Mode:
 * - Silent operation
 * - Only logs critical errors
 * 
 * Usage in App.tsx:
 * <ConnectionGuardProvider>
 *   <YourApp />
 * </ConnectionGuardProvider>
 */
const ConnectionGuardProvider: React.FC<{ children: ReactNode }> = ({
    children
}) => {
    const { isConnected, isChecking, error } = useConnectionGuard();

    // Development logging (removed in production builds)
    useEffect(() => {
        if (import.meta.env.DEV) {
            if (error) {
                console.warn('🔴 Connection Guard: Error detected', error);
            } else if (!isConnected && !isChecking) {
                console.warn('🟡 Connection Guard: Disconnected');
            } else if (isConnected) {
                console.log('🟢 Connection Guard: Connected');
            }
        }
    }, [isConnected, isChecking, error]);

    // Always render children - non-blocking
    return <>{children}</>;
};

export default ConnectionGuardProvider;
