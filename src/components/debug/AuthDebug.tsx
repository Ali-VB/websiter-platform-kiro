import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const AuthDebug: React.FC = () => {
    const { user, loading } = useAuth();

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        return (
            <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
                <h4 className="font-bold mb-2">Auth Debug</h4>
                <div>Loading: {loading ? 'true' : 'false'}</div>
                <div>User: {user ? 'authenticated' : 'not authenticated'}</div>
                {user && (
                    <div className="mt-2">
                        <div>ID: {user.id}</div>
                        <div>Email: {user.email}</div>
                        <div>Name: {user.name}</div>
                        <div>Role: {user.role}</div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};