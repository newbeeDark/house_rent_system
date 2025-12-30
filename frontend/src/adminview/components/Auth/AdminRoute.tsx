import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/**
 * AdminRoute - Protects admin-only routes
 * 
 * This component checks if:
 * 1. User is authenticated
 * 2. User has the 'admin' role
 * 
 * If not authenticated -> Redirect to login
 * If authenticated but not admin -> Redirect to home
 * If admin -> Render the child routes
 */
export const AdminRoute: React.FC = () => {
    const { user, isAuthenticated, loading } = useAuth();

    // Show nothing while loading auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not authenticated -> redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated but not admin -> redirect to home
    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // User is admin -> render child routes
    return <Outlet />;
};

export default AdminRoute;
