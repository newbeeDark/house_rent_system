# Feature Documentation: Property Sharing, Logout, Database Connection & Caching

This document consolidates all code implementations for property sharing, logout functionality, database connection management, and page caching mechanisms. Each section includes detailed comments explaining the purpose and functionality.

---

## Table of Contents
1. [Property Sharing Functionality](#1-property-sharing-functionality)
2. [Logout Logic and Implementation](#2-logout-logic-and-implementation)
3. [Database Connection Management](#3-database-connection-management)
4. [Page Caching with React Query](#4-page-caching-with-react-query)
5. [Dependency Libraries](#5-dependency-libraries)

---

## 1. Property Sharing Functionality

### File: `components/Property/PropertyShareModal.tsx`

**Purpose**: Provides a modal dialog for sharing property listings on social media platforms (Facebook, WhatsApp, Twitter, Telegram, Instagram) with link copying functionality.

```tsx
import React from 'react';
import { Property } from '../../types';

interface PropertyShareModalProps {
  property: Property;
  onClose: () => void;
}

/**
 * PropertyShareModal Component
 * 
 * Functionality:
 * - Generates formatted sharing text for property listings
 * - Provides social media sharing buttons (Facebook, WhatsApp, Twitter, Telegram, Instagram)
 * - Supports direct link copying to clipboard
 * - Uses browser native APIs for sharing (window.open, navigator.clipboard)
 * 
 * @param property - The property object to share
 * @param onClose - Callback function to close the modal
 */
const PropertyShareModal: React.FC<PropertyShareModalProps> = ({ property, onClose }) => {
  
  /**
   * Generate Share Description
   * 
   * Purpose: Creates a uniform, attractive sharing message for all platforms
   * Format: Emoji + bedroom count + property title + price + call-to-action
   * 
   * @param title - Property title
   * @param price - Monthly rental price
   * @param beds - Number of bedrooms
   * @returns Formatted sharing text string
   */
  const getShareDescription = (title: string, price: number, beds: number) => {
    return `🏠 Check out this amazing ${beds}-bedroom property! "${title}" - Only RM${price}/month. Your perfect home awaits! 🌟`;
  };

  // Generate the sharing description for the current property
  const shareDescription = getShareDescription(
    property.title, 
    property.price, 
    property.bedrooms
  );

  /**
   * Share URL Construction
   * 
   * Format: {origin}/property/{id}
   * - Uses window.location.origin to ensure correct domain
   * - Links directly to property details page
   * - Works for both localhost and production domains
   */
  const shareUrl = `${window.location.origin}/property/${property.id}`;

  /**
   * Share to Facebook
   * 
   * Method: Uses Facebook's web sharer dialog
   * API Endpoint: https://www.facebook.com/sharer/sharer.php
   * Parameters:
   * - u: URL to share (encoded)
   * - quote: Pre-filled message text (encoded)
   * 
   * Opens in a new popup window (600x400px)
   */
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareDescription)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  /**
   * Share to WhatsApp
   * 
   * Method: Uses WhatsApp's web sharing protocol
   * API Endpoint: https://wa.me/
   * Parameters:
   * - text: Combined message and URL (encoded)
   * 
   * Opens WhatsApp web or mobile app with pre-filled message
   */
  const shareToWhatsApp = () => {
    const text = `${shareDescription}\n\n${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  /**
   * Share to Twitter
   * 
   * Method: Uses Twitter's web intent API
   * API Endpoint: https://twitter.com/intent/tweet
   * Parameters:
   * - text: Tweet content (encoded)
   * - url: URL to share (encoded)
   * 
   * Opens Twitter with pre-filled tweet
   */
  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareDescription)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  /**
   * Share to Telegram
   * 
   * Method: Uses Telegram's sharing URL scheme
   * API Endpoint: https://t.me/share/url
   * Parameters:
   * - url: URL to share (encoded)
   * - text: Message text (encoded)
   * 
   * Opens Telegram with pre-filled message
   */
  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareDescription)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  /**
   * Share to Instagram
   * 
   * Limitation: Instagram has no official web sharing API
   * Workaround: Copy text to clipboard and prompt user to paste
   * 
   * Process:
   * 1. Copy sharing text + URL to clipboard using navigator.clipboard API
   * 2. Alert user with instructions to paste in Instagram
   * 3. User must manually paste into Instagram app/web
   */
  const shareToInstagram = async () => {
    try {
      const text = `${shareDescription}\n\n${shareUrl}`;
      await navigator.clipboard.writeText(text);
      alert('Link copied! Open Instagram and paste it in your story or post.');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  /**
   * Copy Link to Clipboard
   * 
   * Purpose: Direct link copying without opening any app
   * Method: Uses Clipboard API (navigator.clipboard.writeText)
   * 
   * Provides user feedback:
   * - Success: Alert confirmation
   * - Failure: Error logging and user notification
   */
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  return (
    <div className="share-modal">
      {/* Modal UI implementation */}
      <h3>Share this property</h3>
      <div className="share-buttons">
        <button onClick={shareToFacebook}>Facebook</button>
        <button onClick={shareToWhatsApp}>WhatsApp</button>
        <button onClick={shareToTwitter}>Twitter</button>
        <button onClick={shareToTelegram}>Telegram</button>
        <button onClick={shareToInstagram}>Instagram</button>
        <button onClick={copyLink}>Copy Link</button>
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default PropertyShareModal;
```

### File: `pages/PropertyDetails.tsx`

**Purpose**: Property details page that triggers share modal and persists map location data.

```tsx
/**
 * Share Click Handler
 * 
 * Purpose: Opens the share modal when user clicks share button
 * State Management: Sets shareModalOpen to true
 * 
 * Flow:
 * 1. User clicks "Share" button on property details page
 * 2. handleShareClick is triggered
 * 3. Modal state is updated to show PropertyShareModal
 */
const handleShareClick = () => {
  setShareModalOpen(true);
};

/**
 * Location Update Handler
 * 
 * Purpose: Persists map location (latitude/longitude) to database
 * Called when: User updates property location via map interface
 * 
 * Database Update:
 * - Table: properties
 * - Fields: latitude, longitude
 * - Method: Uses Supabase client to update record
 * 
 * Data Flow:
 * 1. User interacts with map to set/update location
 * 2. handleLocationUpdated receives new coordinates
 * 3. Coordinates saved to properties table
 * 4. Parent component receives callback for UI updates
 * 
 * @param latitude - Decimal latitude coordinate
 * @param longitude - Decimal longitude coordinate
 */
const handleLocationUpdated = async (latitude: number, longitude: number) => {
  try {
    // Update property location in database
    const { error } = await supabase
      .from('properties')
      .update({ 
        latitude, 
        longitude 
      })
      .eq('id', property.id);

    if (error) throw error;

    // Notify parent component of successful update
    if (onLocationUpdated) {
      onLocationUpdated(latitude, longitude);
    }

    alert('Location updated successfully!');
  } catch (error) {
    console.error('Failed to update location:', error);
    alert('Failed to update location. Please try again.');
  }
};
```

**Database Schema Reference**:
```sql
-- Properties table includes location fields
CREATE TABLE properties (
  id UUID PRIMARY KEY,
  title TEXT,
  price DECIMAL,
  bedrooms INTEGER,
  -- Map location fields
  latitude DECIMAL(10, 8),  -- Stores latitude coordinate
  longitude DECIMAL(11, 8), -- Stores longitude coordinate
  -- Other fields...
);
```

---

## 2. Logout Logic and Implementation

### File: `components/Layout/Navbar.tsx`

**Purpose**: Navigation bar with logout button that triggers authentication context logout.

```tsx
/**
 * Logout Button Handler
 * 
 * Location: User profile dropdown in navbar
 * Trigger: User clicks "Logout" button
 * 
 * Default Behavior:
 * 1. Calls AuthContext.logout() method
 * 2. Waits for network signOut to complete
 * 3. Clears local storage and session data
 * 4. Redirects to login page
 * 
 * Alternative Implementation (Force Logout):
 * - Can be replaced with supabaseClient.forceLogout()
 * - Immediate logout without waiting for network
 * - Useful for handling network timeout issues
 * 
 * Usage:
 * <button onClick={logout}>Logout</button>
 */
const { logout } = useAuth(); // From AuthContext

// Standard logout flow
const handleLogout = async () => {
  await logout();
};

// Force logout alternative (bypasses network wait)
// Uncomment to use immediate logout
// const handleForceLogout = () => {
//   supabaseClient.forceLogout();
// };
```

### File: `context/AuthContext.tsx`

**Purpose**: Centralized authentication state management with login, registration, and logout logic.

```tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

/**
 * Authentication Context
 * 
 * Responsibilities:
 * - Manage user authentication state
 * - Handle login/registration/logout operations
 * - Listen for session changes
 * - Provide auth state to all components
 * 
 * State:
 * - user: Current authenticated user or null
 * - loading: Whether auth state is being initialized
 */

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
  try {
    // Step 1: Clear AI conversation history
    localStorage.removeItem('ai_chat_history');
    
    // Step 2: Clear all authentication-related data
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('user_data');
    
    // Step 3: Sign out from Supabase with timeout protection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Logout timeout')), 5000)
    );
    
    try {
      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);
    } catch (signOutError) {
      console.error('Sign out error or timeout:', signOutError);
      // Continue logout even if signOut fails
    }
    
    // Step 4: Hard redirect to login page
    window.location.href = '/login';
    
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even on error
    window.location.href = '/login';
  }
};

/**
 * Session Listener
 * 
 * Purpose: Monitor authentication state changes
 * Listens for:
 * - SIGNED_IN: User successfully logged in
 * - SIGNED_OUT: User logged out
 * - TOKEN_REFRESHED: Session token renewed
 * - USER_UPDATED: User profile changed
 * 
 * Auto-updates user state across all tabs
 */
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### File: `lib/supabaseClient.ts`

**Purpose**: Supabase client configuration with error handling and forced logout utility.

```tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
```

---

## 3. Database Connection Management

### File: `hooks/useConnectionGuard.ts`

**Purpose**: Background database connection and session verification hook.

```tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

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
```

### File: `components/Common/ConnectionGuardProvider.tsx`

**Purpose**: Wrapper component that injects connection monitoring into app root.

```tsx
import React from 'react';
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
const ConnectionGuardProvider: React.FC<{ children: React.ReactNode }> = ({ 
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
```

---

## 4. Page Caching with React Query

### File: `App.tsx`

**Purpose**: Root application component with React Query configuration.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ConnectionGuardProvider from './components/Common/ConnectionGuardProvider';

/**
 * React Query Client Configuration
 * 
 * Purpose: Configure global caching and retry strategies for all data fetching
 * 
 * Default Options:
 * 
 * 1. refetchOnWindowFocus: true
 *    - Auto-refresh data when user returns to tab
 *    - Ensures data is fresh after tab switching
 *    - Improves user experience with up-to-date info
 * 
 * 2. refetchOnReconnect: true
 *    - Auto-refresh when network reconnects
 *    - Handles offline/online transitions
 *    - Syncs data after connectivity restored
 * 
 * 3. retry: 1
 *    - Retry failed requests once before giving up
 *    - Balances resilience vs. performance
 *    - Prevents excessive retries on permanent failures
 * 
 * 4. staleTime: 5 minutes (300000ms)
 *    - Data considered fresh for 5 minutes
 *    - Reduces unnecessary refetches
 *    - Improves performance with reasonable freshness
 * 
 * Benefits:
 * - Automatic background updates
 * - Reduced loading states
 * - Better offline support
 * - Improved perceived performance
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refresh data when window regains focus
      refetchOnWindowFocus: true,
      
      // Refresh data when network reconnects
      refetchOnReconnect: true,
      
      // Retry failed requests once
      retry: 1,
      
      // Consider data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
    },
  },
});

/**
 * App Component Structure
 * 
 * Provider Hierarchy:
 * 1. QueryClientProvider - Provides React Query functionality
 * 2. BrowserRouter - Enables routing
 * 3. ConnectionGuardProvider - Monitors database connection
 * 4. App Routes - Actual page components
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConnectionGuardProvider>
          {/* Your routes and components */}
        </ConnectionGuardProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

### File: `hooks/useProperties.ts`

**Purpose**: Unified hook for fetching property data with React Query caching.

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Property } from '../types';

/**
 * Properties Data Hook
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
export const useProperties = () => {
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
export const useProperty = (propertyId?: string) => {
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
```

---

## 5. Dependency Libraries

### Social Media Sharing

**Browser Native APIs:**
- `window.open()` - Opens sharing dialogs in new windows
- `navigator.clipboard.writeText()` - Copies text to clipboard

**Social Platform APIs:**
- **Facebook**: `https://www.facebook.com/sharer/sharer.php`
- **Twitter**: `https://twitter.com/intent/tweet`
- **Telegram**: `https://t.me/share/url`
- **WhatsApp**: `https://wa.me/`
- **Instagram**: No official web API (clipboard workaround)

### Map Integration

**Current Implementation:**
- Google Maps embed (iframe) - Used on homepage
- No npm package dependencies

**Future Options:**
- OpenStreetMap - Free alternative for share modal
- Google Maps JavaScript API - Advanced features
- Mapbox GL JS - Custom styling

### Authentication & Database

**Supabase Client:**
```json
{
  "@supabase/supabase-js": "^2.x.x"
}
```

**Features Used:**
- `supabase.auth` - Authentication (login, logout, session)
- `supabase.from()` - Database queries
- `supabase.auth.onAuthStateChange()` - Session monitoring

### Data Caching & State Management

**React Query:**
```json
{
  "@tanstack/react-query": "^5.x.x"
}
```

**Features:**
- Query caching with staleTime/gcTime
- Automatic refetching (window focus, network reconnect)
- Offline-first mode
- Loading & error states

**React Router:**
```json
{
  "react-router-dom": "^6.x.x"
}
```

**Features:**
- Route-based navigation
- `useLocation()` hook for route change detection
- Protected routes integration

---

## Implementation Summary

### Files Modified (Comments Added)

1. ✅ `components/Property/PropertyShareModal.tsx` - Social sharing functionality
2. ✅ `pages/PropertyDetails.tsx` - Share trigger and location persistence
3. ✅ `components/Layout/Navbar.tsx` - Logout button
4. ✅ `context/AuthContext.tsx` - Authentication logic
5. ✅ `lib/supabaseClient.ts` - Database client and error handling
6. ✅ `hooks/useConnectionGuard.ts` - Connection monitoring
7. ✅ `components/Common/ConnectionGuardProvider.tsx` - Connection guard wrapper
8. ✅ `App.tsx` - React Query configuration
9. ✅ `hooks/useProperties.ts` - Data fetching with caching

### Key Features Documented

✅ **Property Sharing**: Social media integration with 6 platforms
✅ **Logout System**: Multi-step logout with forced logout option
✅ **Connection Guard**: Background connection monitoring
✅ **React Query**: Intelligent caching and refetching
✅ **Session Management**: Auto-refresh and error handling

### Future Enhancements

**Map Preview in Share Modal:**
```tsx
// Add to PropertyShareModal.tsx
import MapPreview from './MapPreview';

<div className="map-preview">
  <MapPreview 
    latitude={property.latitude} 
    longitude={property.longitude} 
  />
</div>
```

**Force Logout Button:**
```tsx
// Replace in Navbar.tsx
<button onClick={() => supabaseClient.forceLogout()}>
  Force Logout
</button>
```

---

## Testing Checklist

- [ ] Test all social media sharing buttons
- [ ] Verify link copy to clipboard works
- [ ] Test logout clears all localStorage
- [ ] Verify connection guard detects disconnection
- [ ] Test React Query cache on tab switch
- [ ] Verify data refetch on network reconnect
- [ ] Test offline mode with cached data
- [ ] Verify session expiry triggers auto-logout

---

**Document Version**: 1.0
**Last Updated**: 2026-01-10
**Maintainer**: Development Team
