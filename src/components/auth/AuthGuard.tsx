import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireAuth?: boolean;
    requireRole?: 'client' | 'admin';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    fallback = null,
    requireAuth = true,
    requireRole,
}) => {
    const { user, loading } = useAuth();

    // Don't render anything while loading
    if (loading) {
        return null;
    }

    // Check authentication requirement
    if (requireAuth && !user) {
        return <>{fallback}</>;
    }

    // Check role requirement
    if (requireRole && user?.role !== requireRole) {
        return <>{fallback}</>;
    }

    // If user doesn't need auth or is properly authenticated
    if (!requireAuth || user) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};