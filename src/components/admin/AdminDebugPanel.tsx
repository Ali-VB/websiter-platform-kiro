import React, { useState } from 'react';
import { Card, Button } from '../common';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const AdminDebugPanel: React.FC = () => {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        const info: any = {
            timestamp: new Date().toISOString(),
            currentUser: null,
            userTableAccess: null,
            serviceRoleAvailable: false,
            authState: null,
            errors: []
        };

        try {
            // Check current auth state
            const { data: { user: authUser } } = await supabase.auth.getUser();
            info.authState = {
                authenticated: !!authUser,
                userId: authUser?.id,
                email: authUser?.email,
                emailConfirmed: !!authUser?.email_confirmed_at
            };

            // Check current user profile
            if (authUser) {
                try {
                    const { data: profile, error: profileError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();

                    if (profileError) {
                        info.errors.push(`Profile access error: ${profileError.message}`);
                        info.currentUser = { error: profileError.message };
                    } else {
                        info.currentUser = profile;
                    }
                } catch (error: any) {
                    info.errors.push(`Profile fetch error: ${error.message}`);
                }
            }

            // Test users table access
            try {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('id, email, role')
                    .limit(1);

                if (usersError) {
                    info.userTableAccess = { error: usersError.message };
                    info.errors.push(`Users table access error: ${usersError.message}`);
                } else {
                    info.userTableAccess = {
                        success: true,
                        sampleCount: usersData?.length || 0
                    };
                }
            } catch (error: any) {
                info.errors.push(`Users table test error: ${error.message}`);
            }

            // Check service role availability
            info.serviceRoleAvailable = !!(
                import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY &&
                import.meta.env.VITE_SUPABASE_URL
            );

            setDebugInfo(info);

            if (info.errors.length === 0) {
                toast.success('Diagnostics completed successfully');
            } else {
                toast.error(`Diagnostics found ${info.errors.length} issues`);
            }

        } catch (error: any) {
            info.errors.push(`Diagnostics error: ${error.message}`);
            setDebugInfo(info);
            toast.error('Diagnostics failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Admin Debug Panel</h3>
                <Button
                    onClick={runDiagnostics}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                >
                    {loading ? 'Running...' : 'Run Diagnostics'}
                </Button>
            </div>

            {debugInfo && (
                <div className="space-y-4">
                    {/* Current User Info */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                            <div><strong>Auth ID:</strong> {debugInfo.authState?.userId || 'None'}</div>
                            <div><strong>Email:</strong> {debugInfo.authState?.email || 'None'}</div>
                            <div><strong>Authenticated:</strong> {debugInfo.authState?.authenticated ? 'Yes' : 'No'}</div>
                            <div><strong>Email Confirmed:</strong> {debugInfo.authState?.emailConfirmed ? 'Yes' : 'No'}</div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">User Profile</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                            {debugInfo.currentUser?.error ? (
                                <div className="text-red-600">Error: {debugInfo.currentUser.error}</div>
                            ) : debugInfo.currentUser ? (
                                <>
                                    <div><strong>Name:</strong> {debugInfo.currentUser.name}</div>
                                    <div><strong>Role:</strong> {debugInfo.currentUser.role}</div>
                                    <div><strong>Onboarding:</strong> {debugInfo.currentUser.onboarding_completed ? 'Complete' : 'Incomplete'}</div>
                                </>
                            ) : (
                                <div className="text-gray-500">No profile found</div>
                            )}
                        </div>
                    </div>

                    {/* Table Access */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Users Table Access</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                            {debugInfo.userTableAccess?.error ? (
                                <div className="text-red-600">Error: {debugInfo.userTableAccess.error}</div>
                            ) : debugInfo.userTableAccess?.success ? (
                                <div className="text-green-600">✅ Access granted</div>
                            ) : (
                                <div className="text-gray-500">Not tested</div>
                            )}
                        </div>
                    </div>

                    {/* Service Role */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Service Role</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                            {debugInfo.serviceRoleAvailable ? (
                                <div className="text-green-600">✅ Service role key configured</div>
                            ) : (
                                <div className="text-yellow-600">⚠️ Service role key not found</div>
                            )}
                        </div>
                    </div>

                    {/* Errors */}
                    {debugInfo.errors.length > 0 && (
                        <div>
                            <h4 className="font-medium text-red-600 mb-2">Issues Found</h4>
                            <div className="bg-red-50 p-3 rounded text-sm">
                                {debugInfo.errors.map((error: string, index: number) => (
                                    <div key={index} className="text-red-700">• {error}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    <div>
                        <h4 className="font-medium text-blue-600 mb-2">Recommendations</h4>
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                            {debugInfo.currentUser?.role !== 'admin' && (
                                <div>• Ensure your user has role = 'admin' in the users table</div>
                            )}
                            {debugInfo.userTableAccess?.error && (
                                <div>• Check Row Level Security policies on users table</div>
                            )}
                            {!debugInfo.serviceRoleAvailable && (
                                <div>• Add VITE_SUPABASE_SERVICE_ROLE_KEY to environment variables</div>
                            )}
                            {!debugInfo.authState?.emailConfirmed && (
                                <div>• Confirm your email address</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};