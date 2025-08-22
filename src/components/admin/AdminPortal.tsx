import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export const AdminPortal: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState<'loading' | 'login' | 'dashboard'>('loading');
    const stableTimer = useRef<number | null>(null);

    useEffect(() => {
        // Clear any existing timer when auth state changes
        if (stableTimer.current) {
            window.clearTimeout(stableTimer.current);
            stableTimer.current = null;
        }

        if (loading) {
            setView('loading');
            return;
        }

        const isAdmin = !!user && (user as any).role === 'admin';

        if (isAdmin) {
            // Wait briefly to ensure auth state is stable before switching to dashboard
            stableTimer.current = window.setTimeout(() => {
                setView('dashboard');
            }, 200);
        } else {
            // Immediately show login for non-admins
            setView('login');
        }

        return () => {
            if (stableTimer.current) {
                window.clearTimeout(stableTimer.current);
                stableTimer.current = null;
            }
        };
    }, [user, loading]);

    return (
        <div className="min-h-screen">
            {view === 'loading' && (
                <div className="min-h-screen flex items-center justify-center">Loading admin portal...</div>
            )}

            {view === 'login' && (
                <AdminLogin onLoginSuccess={() => navigate('/system-management-portal')} />
            )}

            {view === 'dashboard' && (
                <AdminDashboard />
            )}
        </div>
    );
};

export default AdminPortal;
