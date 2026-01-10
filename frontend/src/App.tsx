import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { HomePage } from './pages/HomePage';
import { PropertyDetails } from './pages/PropertyDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Profile } from './pages/Profile';
import { Applications } from './pages/Applications';
import { CreateListing } from './pages/CreateListing';
import { Favorites } from './pages/Favorites';
import { Messages } from './pages/Messages';
import { ContractReport } from './pages/ContractReport';
import { PlaceholderPage } from './pages/Placeholder';
import { Diagnostics } from './pages/Diagnostics';
import { AnalyticsPage as AdminAnalytics } from './adminview/pages/AdminAnalyticsPage';
import { PropertiesView as AdminProperties } from './adminview/pages/AdminPropertiesPage';
import { UsersView as AdminUsers } from './adminview/pages/AdminUsersPage';
import { MaintenanceView as AdminMaintenance } from './adminview/pages/AdminMaintenancePage';
import { AdminLayout } from './adminview/components/Layout/AdminLayout';
import { DashboardPage as AdminDashboard } from './adminview/pages/AdminDashboardPage';
import { AdminRoute } from './adminview/components/Auth/AdminRoute';

import ScrollToTop from './components/Common/ScrollToTop';
import ConnectionGuardProvider from './components/Common/ConnectionGuardProvider';
import './index.css';

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
 * 2. AuthProvider - Authentication state management
 * 3. Router - Routing functionality
 * 4. ConnectionGuardProvider - Monitors database connection
 * 5. App Routes - Actual page components
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <Router>
            <ConnectionGuardProvider>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                <Route path="/profile" element={<Profile />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/create-listing" element={<CreateListing />} />

                <Route path="/favorites" element={<Favorites />} />
                <Route path="/contract/:id" element={<ContractReport />} />
                <Route path="/host-dashboard" element={<PlaceholderPage title="Landlord Dashboard" />} />
                <Route path="/agent-dashboard" element={<PlaceholderPage title="Agent Dashboard" />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/diagnostics" element={<Diagnostics />} />

                {/* Admin Routes - Protected by AdminRoute */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="properties" element={<AdminProperties />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="maintenance" element={<AdminMaintenance />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ConnectionGuardProvider>
          </Router>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
