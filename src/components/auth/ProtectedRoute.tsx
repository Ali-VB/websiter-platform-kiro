import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common';
import { AuthModal } from './AuthModal';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireRole?: 'client' | 'admin';
    fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true,
    requireRole,
    fallback,
}) => {
    const { user, loading } = useAuth();
    const [showAuthModal, setShowAuthModal] = React.useState(false);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Check if authentication is required
    if (requireAuth && !user) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                            Authentication Required
                        </h2>
                        <p className="text-secondary-600 mb-6">
                            Please sign in to access this page
                        </p>
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="btn btn-primary"
                        >
                            Sign In
                        </button>
                    </div>
                </div>

                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    initialView="login"
                />
            </>
        );
    }

    // Check role requirements
    if (requireRole && user?.role !== requireRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                        Access Denied
                    </h2>
                    <p className="text-secondary-600">
                        You don't have permission to access this page
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};