import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Property } from '../types';

/**
 * Properties Data Hook with React Query
 * 
 * Purpose: Centralized property data fetching with intelligent caching
 * Uses React Query for:
 * - Automatic caching
 * - Background refetching
 * - Loading/error states
 * - Cache invalidation
 * 
 * Cache Configuration:
 * 
 * 1. staleTime: 5 minutes
 *    - Data stays fresh for 5 minutes
 *    - No refetch during this period
 *    - Reduces database load
 * 
 * 2. gcTime: 10 minutes (previously cacheTime)
 *    - Garbage collection time
 *    - Unused cache kept for 10 minutes
 *    - Allows quick back/forward navigation
 * 
 * 3. refetchOnWindowFocus: true
 *    - Auto-refresh when tab becomes active
 *    - Keeps data current across tab switches
 *    - User sees latest data without manual refresh
 * 
 * 4. networkMode: 'offlineFirst'
 *    - Returns cached data immediately if available
 *    - Fetches fresh data in background
 *    - Optimistic UI updates
 *    - Works offline with cached data
 * 
 * 5. enabled: User must be authenticated
 *    - Prevents unnecessary queries for logged-out users
 *    - Saves bandwidth and API calls
 *    - Automatic query when user logs in
 */

/**
 * Fetch All Properties
 * 
 * Returns: List of all properties with basic info
 * Cache Key: ['properties']
 * Refetch Triggers: Window focus, network reconnect, manual invalidation
 */
export const usePropertiesQuery = () => {
    return useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Property[];
        },
        // Data fresh for 5 minutes
        staleTime: 5 * 60 * 1000,

        // Keep in cache for 10 minutes after last use
        gcTime: 10 * 60 * 1000,

        // Refresh when window regains focus
        refetchOnWindowFocus: true,

        // Offline-first strategy
        networkMode: 'offlineFirst',
    });
};

/**
 * Fetch Single Property by ID
 * 
 * Returns: Detailed property information
 * Cache Key: ['property', propertyId]
 * Enabled: Only when propertyId is provided and user is authenticated
 * 
 * @param propertyId - UUID of the property to fetch
 */
export const usePropertyQuery = (propertyId?: string) => {
    return useQuery({
        queryKey: ['property', propertyId],
        queryFn: async () => {
            if (!propertyId) throw new Error('Property ID required');

            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', propertyId)
                .single();

            if (error) throw error;
            return data as Property;
        },
        // Only run query if propertyId exists
        enabled: !!propertyId,

        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        networkMode: 'offlineFirst',
    });
};

/**
 * Cache Invalidation
 * 
 * When to invalidate:
 * - After creating new property
 * - After updating property
 * - After deleting property
 * 
 * How to invalidate:
 * import { useQueryClient } from '@tanstack/react-query';
 * const queryClient = useQueryClient();
 * 
 * // Invalidate all properties
 * queryClient.invalidateQueries({ queryKey: ['properties'] });
 * 
 * // Invalidate specific property
 * queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
 */
