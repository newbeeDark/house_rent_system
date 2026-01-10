import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Favorites Context
 * 
 * Purpose: Centralized favorites management to avoid N+1 query problem
 * 
 * Problem:
 * - Old approach: Each PropertyCard checks isFavorite() individually
 * - Result: N database queries for N properties (inefficient!)
 * 
 * Solution:
 * - Fetch all user favorites once on mount
 * - Store as Set for O(1) lookup
 * - Share across all components via context
 * 
 * Benefits:
 * - Reduces database calls from N to 1
 * - Eliminates 406 errors from individual checks
 * - Faster UI updates
 * - Centralized favorite state management
 */

interface FavoritesContextType {
    favoriteIds: Set<string>;
    isLoading: boolean;
    isFavorite: (propertyId: string) => boolean;
    addFavorite: (propertyId: string) => Promise<void>;
    removeFavorite: (propertyId: string) => Promise<void>;
    refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Fetch All User Favorites
     * 
     * Query: SELECT property_id FROM favorites WHERE user_id = auth.uid()
     * Result: Array of property IDs
     * Storage: Convert to Set for O(1) lookup performance
     * 
     * When called:
     * - On initial mount
     * - When user logs in/out
     * - After add/remove favorite action
     */
    const fetchFavorites = async () => {
        if (!user) {
            setFavoriteIds(new Set());
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('property_id')
                .eq('user_id', user.id);

            if (error) throw error;

            // Convert array to Set for O(1) lookups
            const ids = new Set(data?.map(item => item.property_id) || []);
            setFavoriteIds(ids);
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
            setFavoriteIds(new Set());
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch and refetch on user change
    useEffect(() => {
        fetchFavorites();
    }, [user?.id]);

    /**
     * Check if Property is Favorited
     * 
     * O(1) lookup in Set - much faster than database query!
     * @param propertyId - UUID of property to check
     * @returns true if property is in favorites
     */
    const isFavorite = (propertyId: string): boolean => {
        return favoriteIds.has(propertyId);
    };

    /**
     * Add Property to Favorites
     * 
     * Process:
     * 1. Optimistic update: Add to local Set immediately
     * 2. Database insert
     * 3. On error: Rollback local change
     * 
     * @param propertyId - UUID of property to favorite
     */
    const addFavorite = async (propertyId: string) => {
        if (!user) {
            throw new Error('User must be logged in');
        }

        // Optimistic update
        const newFavorites = new Set(favoriteIds);
        newFavorites.add(propertyId);
        setFavoriteIds(newFavorites);

        try {
            const { error } = await supabase
                .from('favorites')
                .insert({ user_id: user.id, property_id: propertyId });

            if (error) throw error;
        } catch (error) {
            console.error('Failed to add favorite:', error);
            // Rollback on error
            const rollback = new Set(favoriteIds);
            rollback.delete(propertyId);
            setFavoriteIds(rollback);
            throw error;
        }
    };

    /**
     * Remove Property from Favorites
     * 
     * Process:
     * 1. Optimistic update: Remove from local Set immediately
     * 2. Database delete
     * 3. On error: Rollback local change
     * 
     * @param propertyId - UUID of property to unfavorite
     */
    const removeFavorite = async (propertyId: string) => {
        if (!user) {
            throw new Error('User must be logged in');
        }

        // Optimistic update
        const newFavorites = new Set(favoriteIds);
        newFavorites.delete(propertyId);
        setFavoriteIds(newFavorites);

        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('property_id', propertyId);

            if (error) throw error;
        } catch (error) {
            console.error('Failed to remove favorite:', error);
            // Rollback on error
            const rollback = new Set(favoriteIds);
            rollback.add(propertyId);
            setFavoriteIds(rollback);
            throw error;
        }
    };

    return (
        <FavoritesContext.Provider
            value={{
                favoriteIds,
                isLoading,
                isFavorite,
                addFavorite,
                removeFavorite,
                refreshFavorites: fetchFavorites
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

/**
 * useFavorites Hook
 * 
 * Usage in components:
 * ```tsx
 * const { isFavorite, addFavorite, removeFavorite } = useFavorites();
 * 
 * const isLiked = isFavorite(propertyId); // O(1) lookup!
 * await addFavorite(propertyId);
 * await removeFavorite(propertyId);
 * ```
 */
export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};
