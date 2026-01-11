import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Connection Guard Hook
 * 连接守卫钩子
 * 
 * Purpose: Proactively check database connection and session validity
 * 目的：主动检查数据库连接和会话有效性
 * Execution: Runs in background without blocking UI rendering
 * 执行：在后台运行，不阻塞UI渲染
 * 
 * Features:
 * - Verifies database connectivity 验证数据库连接
 * - Validates session tokens 验证会话令牌
 * - Detects authentication expiry 检测认证过期
 * - Auto-triggers on route changes 路由变化时自动触发
 * - Debounced to prevent rapid checking 防抖处理防止频繁检查
 * - Tab visibility aware 感知标签页可见性
 * 
 * Return Values:
 * @returns {Object}
 * - isConnected: Boolean indicating database connection status
 * - isChecking: Boolean indicating if check is in progress
 * - error: Error object if connection fails
 */
export const useConnectionGuard = () => {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const location = useLocation();

    // 防抖计时器引用 - Debounce timer ref
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    // 上次检查时间 - Last check timestamp
    const lastCheckRef = useRef<number>(0);
    // 最小检查间隔（毫秒）- Minimum interval between checks (ms)
    const MIN_CHECK_INTERVAL = 3000;

    /**
     * Connection Check Function (Debounced)
     * 连接检查函数（防抖）
     * 
     * Tests:
     * 1. Database connectivity - Simple query to verify connection
     * 2. Session validity - Checks if user session is still active
     * 3. Token expiration - Verifies JWT hasn't expired
     * 
     * Process:
     * - Debounces rapid calls to prevent 406 errors
     * - Skips if checked recently (within MIN_CHECK_INTERVAL)
     * - Executes lightweight query (SELECT 1)
     * - Checks current session
     * - Updates connection state
     */
    const checkConnection = useCallback(async (force: boolean = false) => {
        const now = Date.now();

        // 跳过过于频繁的检查（除非强制）
        // Skip if checked too recently (unless forced)
        if (!force && now - lastCheckRef.current < MIN_CHECK_INTERVAL) {
            console.log('Connection Guard: Skipping check (too recent)');
            return;
        }

        // 清除之前的防抖计时器
        // Clear previous debounce timer
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        setIsChecking(true);
        setError(null);
        lastCheckRef.current = now;

        try {
            // Test 1: Session validity first (lightweight)
            // 测试1：先检查会话有效性（轻量级）
            const { data: { session }, error: sessionError } =
                await supabase.auth.getSession();

            if (sessionError) {
                console.warn('Connection Guard: Session error', sessionError);
                // 不立即断开，可能只是暂时问题
                // Don't disconnect immediately, might be temporary
                setError(sessionError);
                return;
            }

            // 如果没有会话，可能是未登录状态，这是正常的
            // No session might mean not logged in, which is normal
            if (!session) {
                setIsConnected(true); // 仍然连接，只是未认证
                return;
            }

            // Test 2: Database connectivity (only if session exists)
            // 测试2：数据库连接（仅在会话存在时）
            const { error: dbError } = await supabase
                .from('properties')
                .select('id')
                .limit(1);

            if (dbError) {
                // 406错误通常表示请求问题，不是连接问题
                // 406 error usually means request issue, not connection issue
                if (dbError.message?.includes('406')) {
                    console.warn('Connection Guard: 406 error, likely stale request');
                    // 不设置断开连接，只记录
                    // Don't set disconnected, just log
                    return;
                }
                throw dbError;
            }

            // 连接正常 - Connection OK
            setIsConnected(true);

        } catch (err) {
            console.error('Connection check failed:', err);
            setError(err as Error);
            // 只在严重错误时标记断开
            // Only mark disconnected on serious errors
            const errMsg = (err as Error).message || '';
            if (!errMsg.includes('406') && !errMsg.includes('timeout')) {
                setIsConnected(false);
            }
        } finally {
            setIsChecking(false);
        }
    }, []);

    /**
     * Debounced check wrapper
     * 防抖检查包装器
     * 延迟500ms执行检查，防止快速切换导致多次检查
     */
    const debouncedCheck = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            checkConnection(false);
        }, 500);
    }, [checkConnection]);

    /**
     * Route Change Listener
     * 路由变化监听器
     * 
     * Trigger: Runs whenever user navigates to different route
     * 触发：用户导航到不同路由时运行
     * 使用防抖版本防止频繁检查
     */
    useEffect(() => {
        debouncedCheck();
    }, [location.pathname, debouncedCheck]);

    /**
     * Tab Visibility Handler
     * 标签页可见性处理器
     * 
     * 当用户切换回标签页时，不立即刷新会话，而是使用防抖
     * When user switches back to tab, don't refresh immediately, use debounce
     */
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // 标签页变为可见时，延迟检查而不是立即检查
                // When tab becomes visible, delay check instead of immediate
                console.log('Connection Guard: Tab visible, scheduling check');
                debouncedCheck();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [debouncedCheck]);

    /**
     * Authentication Event Listener
     * 认证事件监听器
     * 
     * Monitors Supabase auth events:
     * - SIGNED_OUT: User logged out → set disconnected
     * - TOKEN_REFRESHED: Token renewed → re-check connection (debounced)
     * - SIGNED_IN: User logged in → verify connection (debounced)
     * 
     * 使用防抖防止快速事件导致问题
     */
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                console.log('Connection Guard: Auth event', event);
                if (event === 'SIGNED_OUT') {
                    setIsConnected(false);
                } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
                    // 使用防抖而不是立即检查
                    // Use debounce instead of immediate check
                    debouncedCheck();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
            // 清理防抖计时器
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [debouncedCheck]);

    return { isConnected, isChecking, error };
};
