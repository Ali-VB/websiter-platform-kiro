import React, { useState } from 'react';
import { Card, Button } from '../common';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { UserSyncService } from '../../services/supabase/userSync';
import { AdminDebugPanel } from './AdminDebugPanel';

import toast from 'react-hot-toast';
import {
    UserIcon,
    DocumentTextIcon,
    CreditCardIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

interface DatabaseStats {
    users: any[];
    projects: any[];
    payments: any[];
    authUsers: any[];
}

export const StandaloneDatabaseOverview: React.FC = React.memo(() => {
    const [stats, setStats] = useState<DatabaseStats | null>(() => {
        // Try to load from localStorage on init
        try {
            const saved = localStorage.getItem('kiro-database-stats');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataLoaded, setDataLoaded] = useState(() => {
        return localStorage.getItem('kiro-database-stats') !== null;
    });

    const loadData = async () => {
        if (loading) return;

        try {
            setLoading(true);
            setError(null);
            console.log('🔄 Loading standalone database data...');

            // Create admin client with service role key
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

            if (serviceRoleKey && supabaseUrl) {
                createClient(supabaseUrl, serviceRoleKey);
                console.log('✅ Using Service Role key');
            }

            // Load all data using standardized approach
            const [projectsResult, paymentsResult] = await Promise.all([
                supabase.from('projects').select('*'),
                supabase.from('payments').select('*')
            ]);

            // Get users using standardized UserSyncService with fallback
            let customUsers = [];
            let authUsers = [];

            try {
                const userResult = await UserSyncService.getAdminUserList();
                customUsers = userResult.customUsers;
                authUsers = userResult.authUsers;
                console.log('✅ Users loaded via UserSyncService:', customUsers.length, 'custom,', authUsers.length, 'auth');
            } catch (userError: any) {
                console.warn('⚠️ UserSyncService failed, trying direct access:', userError.message);

                // Fallback: Try direct access to users table
                try {
                    const directResult = await supabase.from('users').select('*');
                    if (directResult.error) throw directResult.error;
                    customUsers = directResult.data || [];
                    console.log('✅ Users loaded via direct access:', customUsers.length, 'users');
                } catch (directError: any) {
                    console.error('❌ Direct users access also failed:', directError.message);
                    // Continue with empty users array
                    customUsers = [];
                    authUsers = [];
                }
            }

            const projects = projectsResult.data || [];
            const payments = paymentsResult.data || [];

            // Combine users
            let allUsers;
            if (authUsers.length > 0) {
                allUsers = authUsers.map(authUser => {
                    const customUser = customUsers.find(cu => cu.id === authUser.id);
                    return {
                        id: authUser.id,
                        name: customUser?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Unknown',
                        email: authUser.email || 'No email',
                        role: customUser?.role || 'client',
                        created_at: authUser.created_at,
                        hasCustomRecord: !!customUser,
                        source: 'auth'
                    };
                });
            } else {
                allUsers = customUsers.map(user => ({
                    ...user,
                    hasCustomRecord: true,
                    source: 'custom'
                }));
            }

            const statsData = {
                users: allUsers,
                projects,
                payments,
                authUsers
            };

            // Save to localStorage to persist across re-renders
            localStorage.setItem('kiro-database-stats', JSON.stringify(statsData));

            setStats(statsData);
            setDataLoaded(true);

            console.log('✅ Data loaded successfully and saved to localStorage:', {
                users: allUsers.length,
                projects: projects.length,
                payments: payments.length,
                authUsers: authUsers.length
            });

        } catch (error: any) {
            console.error('❌ Load error:', error);

            let errorMessage = error.message;

            // Provide specific guidance for common errors
            if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
                errorMessage = 'Access denied. This might be due to Row Level Security policies. Please check that:\n' +
                    '1. Your user has admin role in the users table\n' +
                    '2. RLS policies allow admin access\n' +
                    '3. Service role key is configured correctly';
                console.error('🔒 RLS Policy Issue - Check admin permissions and database policies');
            } else if (error.message?.includes('JWT')) {
                errorMessage = 'Authentication issue. Please sign out and sign back in.';
            }

            setError(errorMessage);
            toast.error('Failed to load database data');
            setDataLoaded(false);
            // Clear localStorage on error
            localStorage.removeItem('kiro-database-stats');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
        }).format(amount / 100);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">📊 Database Overview</h1>
                        <p className="text-gray-600">
                            Complete system data analysis - Standalone Version
                            {dataLoaded && (
                                <span className="ml-2 text-green-600 text-sm">
                                    (Data loaded and persisted)
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={loadData}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Loading...' : dataLoaded ? 'Refresh Data' : 'Load Data'}
                        </Button>
                        {dataLoaded && (
                            <Button
                                onClick={() => {
                                    localStorage.removeItem('kiro-database-stats');
                                    setStats(null);
                                    setDataLoaded(false);
                                    setError(null);
                                    console.log('🗑️ Data cleared');
                                }}
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                                Clear Data
                            </Button>
                        )}

                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <Card className="p-8 text-center">
                        <div className="text-4xl mb-2">⏳</div>
                        <div className="text-gray-600">Loading database information...</div>
                    </Card>
                )}

                {/* Error State */}
                {error && (
                    <Card className="p-6 border-red-300 bg-red-50">
                        <div className="text-center">
                            <div className="text-4xl mb-2">❌</div>
                            <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
                            <p className="text-red-700 mb-4 whitespace-pre-line">{error}</p>
                            <Button onClick={loadData} className="bg-red-600 hover:bg-red-700">
                                Retry
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Debug Panel - Show when there are errors */}
                {error && (
                    <AdminDebugPanel />
                )}

                {/* Data Display */}
                {stats && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="p-4 text-center">
                                <UserIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">{stats.users.length}</div>
                                <div className="text-sm text-gray-600">Total Users</div>
                                <div className="text-xs text-blue-600 mt-1">
                                    {stats.authUsers.length} from Auth
                                </div>
                            </Card>
                            <Card className="p-4 text-center">
                                <DocumentTextIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">{stats.projects.length}</div>
                                <div className="text-sm text-gray-600">Projects</div>
                            </Card>
                            <Card className="p-4 text-center">
                                <CreditCardIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">{stats.payments.length}</div>
                                <div className="text-sm text-gray-600">Payments</div>
                            </Card>
                            <Card className="p-4 text-center">
                                <ChartBarIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats.payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0))}
                                </div>
                                <div className="text-sm text-gray-600">Total Revenue</div>
                            </Card>
                        </div>

                        {/* Users Table */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Users</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {stats.users.map((user, index) => (
                                            <tr key={user.id || index} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.source === 'auth'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {user.source === 'auth' ? 'Supabase Auth' : 'Custom Table'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Projects Table */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Projects</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {stats.projects.map((project, index) => {
                                            const client = stats.users.find(u => u.id === project.client_id);
                                            return (
                                                <tr key={project.id || index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                        {project.title || 'Untitled'}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                            {project.status || 'unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                        {client ? `${client.name} (${client.email})` : 'Unknown Client'}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm font-medium text-green-600">
                                                        {project.price ? formatCurrency(project.price * 100) : 'No price'}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </>
                )}

                {/* Initial State */}
                {!stats && !loading && !error && (
                    <Card className="p-8 text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Standalone Database Overview
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Click "Load Data" to see your complete database information
                        </p>
                        <p className="text-sm text-blue-600">
                            This version runs independently and won't have loading loops
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
});