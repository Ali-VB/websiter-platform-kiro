import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common';

export const AuthCallback: React.FC = () => {
    const { user } = useAuth();

    useEffect(() => {
        const handleAuthCallback = async () => {
            // The auth state should be automatically updated by the useAuth hook
            // If we have a user, redirect to the main page
            if (user) {
                window.location.href = '/';
            }
        };

        // Small delay to allow auth state to update
        const timer = setTimeout(handleAuthCallback, 1000);

        return () => clearTimeout(timer);
    }, [user]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <h2 className="text-xl font-semibold text-secondary-900 mt-4">
                    Completing sign up...
                </h2>
                <p className="text-secondary-600 mt-2">
                    Please wait while we set up your account
                </p>
            </div>
        </div>
    );
};