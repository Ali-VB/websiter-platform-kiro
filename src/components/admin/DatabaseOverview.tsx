import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../common';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import toast from 'react-hot-toast';
import {
    UserIcon,
    DocumentTextIcon,
    CreditCardIcon,
    LifebuoyIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

interface DatabaseStats {
    users: any[];
    projects: any[];
    payments: any[];
    supportTickets: any[];
    orphanedProjects: any[];
    missingClientRecords: any[];
    relationships: {
        clientProjects: Array<{
            clientId: string;
            clientName: string;
            clientEmail: string;
            clientRole: string;
            clientCreated: string;
            projectCount: number;
            projects: any[];
        }>;
        paymentSummary: Array<{
            clientId: string;
            clientName: string;
            clientEmail: string;
            totalAmount: number;
            paymentCount: number;
            succeededCount: number;
            pendingCount: number;
            failedCount: number;
        }>;
    };
}

export const DatabaseOverview: React.FC = React.memo(() => {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const loadDatabaseStats = async () => {
        // Prevent multiple simultaneous calls
        if (loading) {
            console.log('⚠️ Already loading, skipping duplicate call');
            return;
        }

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            console.error('⏰ Database load timeout - taking too long');
            setError('Database load timeout - please check your connection and try again');
            setLoading(false);
        }, 30000); // 30 second timeout

        try {
            console.log('🔄 Starting database stats load...');
            setLoading(true);
            setError(null);

            // Create admin client with service role key for full access
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

            let adminClient = supabase; // Default to regular client
            let canUseAdminClient = false;

            if (serviceRoleKey && supabaseUrl) {
                try {
                    adminClient = createClient(supabaseUrl, serviceRoleKey);
                    canUseAdminClient = true;
                    console.log('✅ Using Service Role key for full admin access');
                } catch (error) {
                    console.warn('⚠️ Failed to create admin client, using regular client:', error);
                }
            } else {
                console.warn('⚠️ Service Role key not found. Add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file for full access.');
            }

            // Get all data from main tables
            const [usersResult, projectsResult, paymentsResult, ticketsResult] = await Promise.all([
                supabase.from('users').select('*'), // Custom users table
                supabase.from('projects').select('*'),
                supabase.from('payments').select('*'),
                supabase.from('support_tickets').select('*').limit(100), // Limit to avoid too much data
            ]);

            // Get auth users with proper admin access
            let authUsersResult;
            if (canUseAdminClient) {
                try {
                    authUsersResult = await adminClient.auth.admin.listUsers();
                    console.log('✅ Successfully accessed auth users with admin client');
                } catch (authError) {
                    console.error('❌ Admin client auth access failed:', authError);
                    authUsersResult = { data: { users: [] }, error: authError };
                }
            } else {
                // Try with regular client (will likely fail)
                try {
                    authUsersResult = await supabase.auth.admin.listUsers();
                } catch (authError) {
                    console.warn('❌ Regular client auth access failed (expected):', authError);
                    authUsersResult = { data: { users: [] }, error: authError };
                }
            }

            if (usersResult.error) throw usersResult.error;
            if (projectsResult.error) throw projectsResult.error;
            if (paymentsResult.error) throw paymentsResult.error;
            // Support tickets might not exist, so don't throw error

            const customUsers = usersResult.data || [];
            const authUsers = authUsersResult.data?.users || [];
            const projects = projectsResult.data || [];
            const payments = paymentsResult.data || [];
            const supportTickets = ticketsResult.data || [];

            // If we can't access auth users, work with what we have
            let users;
            if (authUsers.length > 0) {
                // Combine auth users with custom user data
                users = authUsers.map(authUser => {
                    const customUser = customUsers.find(cu => cu.id === authUser.id);
                    const hasProjects = projects.some(p => p.client_id === authUser.id);

                    return {
                        id: authUser.id,
                        name: customUser?.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Unknown',
                        email: authUser.email || 'No email',
                        role: customUser?.role || (hasProjects ? 'client' : 'user'),
                        created_at: authUser.created_at,
                        hasCustomRecord: !!customUser,
                        hasProjects: hasProjects,
                        ...customUser
                    };
                });
            } else {
                // Fallback: use custom users + infer missing users from projects
                console.warn('⚠️ Cannot access Supabase Auth users. Using fallback method.');
                const projectClientIds = [...new Set(projects.map(p => p.client_id).filter(Boolean))];
                const missingUserIds = projectClientIds.filter(clientId => !customUsers.find(u => u.id === clientId));

                console.log('Project client IDs:', projectClientIds);
                console.log('Custom user IDs:', customUsers.map(u => u.id));
                console.log('Missing user IDs (inferred from projects):', missingUserIds);

                // Create placeholder users for missing client IDs
                const inferredUsers = missingUserIds.map(clientId => ({
                    id: clientId,
                    name: 'Unknown User (from project)',
                    email: 'Unknown Email',
                    role: 'client',
                    created_at: new Date().toISOString(),
                    hasCustomRecord: false,
                    hasProjects: true,
                    isInferred: true // Mark as inferred
                }));

                // Combine custom users with inferred users
                users = [
                    ...customUsers.map(user => ({
                        ...user,
                        hasCustomRecord: true,
                        hasProjects: projects.some(p => p.client_id === user.id),
                        isInferred: false
                    })),
                    ...inferredUsers
                ];

                console.log('Final combined users:', users);
            }

            // Debug logging to understand the data structure
            console.log('=== DATABASE DEBUG ===');
            console.log('Raw custom users result:', usersResult);
            console.log('Raw auth users result:', authUsersResult);
            console.log('Raw projects result:', projectsResult);
            console.log('Raw payments result:', paymentsResult);
            console.log('Custom users count:', customUsers.length);
            console.log('Auth users count:', authUsers.length);
            console.log('Combined users count:', users.length);
            console.log('Combined users:', users);
            console.log('Projects count:', projects.length);
            console.log('Projects:', projects);
            console.log('Payments count:', payments.length);
            console.log('User IDs:', users.map(u => u.id));
            console.log('Project client_ids:', projects.map(p => ({ title: p.title, client_id: p.client_id })));

            // Show the difference between auth and custom users
            console.log('=== USER DATA COMPARISON ===');
            console.log('Auth users (from Supabase Auth):', authUsers.map(u => ({ id: u.id, email: u.email, created: u.created_at })));
            console.log('Custom users (from users table):', customUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));

            // Check which auth users don't have custom user records
            const missingCustomUsers = authUsers.filter(authUser => !customUsers.find(cu => cu.id === authUser.id));
            const missingClientsWithProjects = missingCustomUsers.filter(authUser => projects.some(p => p.client_id === authUser.id));

            if (missingCustomUsers.length > 0) {
                console.warn('⚠️ Auth users without custom user records:', missingCustomUsers.map(u => ({ id: u.id, email: u.email })));
            }
            if (missingClientsWithProjects.length > 0) {
                console.warn('🚨 CRITICAL: Clients with projects but no user records:', missingClientsWithProjects.map(u => ({ id: u.id, email: u.email })));
            }

            // Test if we can access users table directly
            console.log('=== DIRECT USER TABLE TEST ===');
            try {
                const directUserTest = await supabase.from('users').select('id, name, email, role, created_at');
                console.log('Direct user query result:', directUserTest);
            } catch (directError) {
                console.error('Direct user query failed:', directError);
            }

            // Check for mismatched relationships
            console.log('=== RELATIONSHIP ANALYSIS ===');
            projects.forEach(project => {
                const client = users.find(u => u.id === project.client_id);
                console.log(`Project "${project.title}": client_id="${project.client_id}", client found:`, !!client);
                if (!client && project.client_id) {
                    console.warn(`⚠️ Project "${project.title}" has client_id "${project.client_id}" but no matching user found`);
                    console.log('Available user IDs:', users.map(u => ({ id: u.id, name: u.name, email: u.email })));
                    console.log(`To fix this project, update its client_id to one of the available user IDs above`);
                }
                if (!project.client_id) {
                    console.warn(`⚠️ Project "${project.title}" has NULL client_id`);
                    console.log('Available users to assign:', users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
                }
            });

            // Show which users have no projects
            const usersWithoutProjects = users.filter(user => !projects.some(p => p.client_id === user.id));
            if (usersWithoutProjects.length > 0) {
                console.log('=== USERS WITHOUT PROJECTS ===');
                usersWithoutProjects.forEach(user => {
                    console.log(`User "${user.name}" (${user.email}) has no projects assigned`);
                });
            }

            // Build relationships - include all users who have projects, regardless of role
            const clientProjects = users
                .filter(user => projects.some(p => p.client_id === user.id))
                .map(client => {
                    const clientProjects = projects.filter(p => p.client_id === client.id);
                    return {
                        clientId: client.id,
                        clientName: client.name || 'Unknown',
                        clientEmail: client.email || 'No email',
                        clientRole: client.role || 'No role',
                        clientCreated: client.created_at,
                        projectCount: clientProjects.length,
                        projects: clientProjects,
                    };
                });

            // Also check for projects with null or invalid client_id
            const orphanedProjects = projects.filter(p => !p.client_id || !users.find(u => u.id === p.client_id));
            if (orphanedProjects.length > 0) {
                console.warn('⚠️ Found orphaned projects:', orphanedProjects);
            }

            const paymentSummary = users
                .filter(user => payments.some(p => p.client_id === user.id))
                .map(client => {
                    const clientPayments = payments.filter(p => p.client_id === client.id);
                    return {
                        clientId: client.id,
                        clientName: client.name || 'Unknown',
                        clientEmail: client.email || 'No email',
                        totalAmount: clientPayments
                            .filter(p => p.status === 'succeeded')
                            .reduce((sum, p) => sum + p.amount, 0),
                        paymentCount: clientPayments.length,
                        succeededCount: clientPayments.filter(p => p.status === 'succeeded').length,
                        pendingCount: clientPayments.filter(p => p.status === 'pending').length,
                        failedCount: clientPayments.filter(p => p.status === 'failed').length,
                        payments: clientPayments,
                    };
                });

            setStats({
                users,
                projects,
                payments,
                supportTickets,
                relationships: {
                    clientProjects,
                    paymentSummary,
                },
                orphanedProjects,
                missingClientRecords: missingClientsWithProjects,
            });

            console.log('✅ Database overview loaded successfully');
            // Don't show toast on initial load to avoid spam
        } catch (error: any) {
            console.error('❌ Database overview error:', error);
            setError(error.message || 'Unknown error occurred');
            // Don't show toast error on initial load, just log it
            console.error('Failed to load database overview:', error.message);
        } finally {
            clearTimeout(timeoutId); // Clear the timeout
            console.log('✅ Database stats load completed');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!mounted) {
            setMounted(true);
            console.log('🚀 Component mounted, loading data once');
            loadDatabaseStats();
        }

        // Cleanup function to prevent memory leaks
        return () => {
            console.log('🧹 Component unmounting');
        };
    }, []); // Absolutely empty dependency array

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
        }).format(amount / 100);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded':
            case 'completed':
                return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
            case 'pending':
            case 'in_progress':
                return <ClockIcon className="w-4 h-4 text-yellow-600" />;
            case 'failed':
            case 'canceled':
                return <XCircleIcon className="w-4 h-4 text-red-600" />;
            default:
                return <ExclamationTriangleIcon className="w-4 h-4 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-gray-600">Loading database overview...</div>
                <div className="text-xs text-gray-500 mt-2">
                    If this takes too long, check the browser console for errors
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6 text-center">
                <div className="text-4xl mb-2">❌</div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Database Overview Error
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-y-2">
                    <Button
                        onClick={() => {
                            setError(null);
                            setStats(null);
                            loadDatabaseStats();
                        }}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Retry
                    </Button>
                    <div className="text-xs text-gray-500">
                        Check browser console for detailed error information
                    </div>
                </div>
            </Card>
        );
    }

    if (!stats) return null;

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">📊 Database Overview</h2>
                    <p className="text-gray-600">Complete system data analysis and relationships</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            console.log('🔄 Manual refresh triggered');
                            setStats(null);
                            setError(null);
                            loadDatabaseStats();
                        }}
                        variant="outline"
                        disabled={loading}
                        className="flex items-center space-x-2"
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        <span>Refresh</span>
                    </Button>
                    <Button
                        onClick={async () => {
                            console.log('=== MANUAL DATABASE TEST ===');
                            try {
                                // Create admin client for testing
                                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                                const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

                                let testClient = supabase;
                                let usingAdminClient = false;

                                if (serviceRoleKey && supabaseUrl) {
                                    try {
                                        testClient = createClient(supabaseUrl, serviceRoleKey);
                                        usingAdminClient = true;
                                        console.log('✅ Using Service Role for test');
                                    } catch (error) {
                                        console.warn('⚠️ Failed to create admin client for test');
                                    }
                                }

                                // Test each table individually
                                const customUserTest = await supabase.from('users').select('*');
                                const projectTest = await supabase.from('projects').select('*');
                                const paymentTest = await supabase.from('payments').select('*');

                                // Test auth users with admin client
                                let authUserTest;
                                try {
                                    authUserTest = await testClient.auth.admin.listUsers();
                                } catch (authError) {
                                    authUserTest = { data: { users: [] }, error: authError };
                                }

                                console.log('Manual custom user test:', customUserTest);
                                console.log('Manual auth user test:', authUserTest);
                                console.log('Manual project test:', projectTest);
                                console.log('Manual payment test:', paymentTest);

                                const customUserCount = customUserTest.data?.length || 0;
                                const authUserCount = authUserTest.data?.users?.length || 0;

                                // Show counts
                                toast.success(`Found: ${customUserCount} custom users, ${authUserCount} auth users, ${projectTest.data?.length || 0} projects, ${paymentTest.data?.length || 0} payments`);

                                // Show in alert for immediate visibility
                                const authStatus = authUserTest.error ? 'ERROR: ' + (authUserTest.error as any).message : 'OK';
                                alert(`Database Test Results:
Custom Users (users table): ${customUserCount} (${customUserTest.error ? 'ERROR: ' + customUserTest.error.message : 'OK'})
Auth Users (Supabase Auth): ${authUserCount} (${authStatus})
Projects: ${projectTest.data?.length || 0} (${projectTest.error ? 'ERROR: ' + projectTest.error.message : 'OK'})
Payments: ${paymentTest.data?.length || 0} (${paymentTest.error ? 'ERROR: ' + paymentTest.error.message : 'OK'})

Admin Client: ${usingAdminClient ? '✅ Using Service Role' : '❌ Service Role not available'}
${authUserTest.error && !usingAdminClient ? '\n⚠️ Add VITE_SUPABASE_SERVICE_ROLE_KEY to .env for full access' : ''}

Check console for detailed data.`);
                            } catch (error) {
                                console.error('Manual test failed:', error);
                                toast.error('Manual database test failed');
                            }
                        }}
                        variant="outline"
                        className="flex items-center space-x-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                        <span>Test Database</span>
                    </Button>
                </div>
            </motion.div>

            {/* Summary Stats */}
            <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className={`p-4 text-center ${stats.users.length === 0 ? 'border-red-300 bg-red-50' : ''}`}>
                        <UserIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{stats.users.length}</div>
                        <div className="text-sm text-gray-600">Users</div>
                        {stats.users.length === 0 && (
                            <div className="text-xs text-red-600 mt-1">⚠️ No users found</div>
                        )}
                    </Card>
                    <Card className={`p-4 text-center ${stats.projects.length === 0 ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                        <DocumentTextIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{stats.projects.length}</div>
                        <div className="text-sm text-gray-600">Projects</div>
                        {stats.projects.length === 0 && (
                            <div className="text-xs text-yellow-600 mt-1">⚠️ No projects found</div>
                        )}
                    </Card>
                    <Card className="p-4 text-center">
                        <CreditCardIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{stats.payments.length}</div>
                        <div className="text-sm text-gray-600">Payments</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <LifebuoyIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{stats.supportTickets.length}</div>
                        <div className="text-sm text-gray-600">Support Tickets</div>
                    </Card>
                </div>
            </motion.div>

            {/* Service Role Key Setup Guide */}
            {!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY && (
                <motion.div variants={fadeInUp}>
                    <Card className="p-6 border-blue-300 bg-blue-50">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">
                            🔑 Setup Required: Add Service Role Key for Full Access
                        </h3>
                        <div className="space-y-3 text-sm text-blue-700">
                            <p>To see ALL users with complete details, you need to add your Supabase Service Role key.</p>

                            <div className="bg-white border border-blue-200 rounded p-4">
                                <p className="font-medium text-blue-800 mb-2">Step-by-Step Setup:</p>
                                <ol className="list-decimal list-inside space-y-2">
                                    <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase Dashboard</a></li>
                                    <li>Select your project: <code className="bg-blue-100 px-1 rounded">websiter-kiro</code></li>
                                    <li>Go to <strong>Settings</strong> → <strong>API</strong></li>
                                    <li>Copy the <strong>"service_role" key</strong> (not the anon key)</li>
                                    <li>Add it to your <code className="bg-blue-100 px-1 rounded">.env</code> file:</li>
                                </ol>

                                <div className="mt-3 p-3 bg-gray-100 rounded font-mono text-xs">
                                    <div className="text-gray-600"># Add this line to your .env file:</div>
                                    <div className="text-blue-800">VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
                                </div>

                                <div className="mt-3 text-xs text-blue-600">
                                    ⚠️ <strong>Important:</strong> The Service Role key has full database access. Keep it secure and never expose it in client-side code.
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded p-3">
                                <p className="font-medium text-green-800">After adding the key:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1 text-green-700">
                                    <li>Restart your development server</li>
                                    <li>Refresh this page</li>
                                    <li>You'll see ALL users with complete details</li>
                                    <li>No more "Unknown User" entries</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Permission Issue Warning */}
            {import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY && stats.users.some(u => u.isInferred) && (
                <motion.div variants={fadeInUp}>
                    <Card className="p-6 border-yellow-300 bg-yellow-50">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                            ⚠️ Service Role Key Issue
                        </h3>
                        <div className="space-y-2 text-sm text-yellow-700">
                            <p>Service Role key is configured but auth access is still failing.</p>
                            <p><strong>Possible issues:</strong></p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Invalid or expired Service Role key</li>
                                <li>Key not properly formatted in .env file</li>
                                <li>Development server needs restart after adding key</li>
                            </ul>
                            <div className="mt-4 p-3 bg-white border border-yellow-200 rounded">
                                <p className="font-medium">Quick fixes:</p>
                                <ol className="list-decimal list-inside mt-2 space-y-1">
                                    <li>Verify the Service Role key in your Supabase Dashboard</li>
                                    <li>Check .env file format (no quotes around the key)</li>
                                    <li>Restart your development server</li>
                                    <li>Click "Test Database" button to verify</li>
                                </ol>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Debug Information */}
            {(stats.users.length <= 1 || stats.projects.length === 0) && !stats.users.some(u => u.isInferred) && (
                <motion.div variants={fadeInUp}>
                    <Card className="p-6 border-red-300 bg-red-50">
                        <h3 className="text-lg font-semibold text-red-800 mb-4">
                            🚨 Data Loading Issue Detected
                        </h3>
                        <div className="space-y-2 text-sm text-red-700">
                            <p>Expected more users, but only found {stats.users.length}</p>
                            <p>This could be due to:</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Row Level Security (RLS) policies blocking access</li>
                                <li>Database connection issues</li>
                                <li>Authentication/permission problems</li>
                                <li>Data actually missing from database</li>
                            </ul>
                            <div className="mt-4 p-3 bg-white border border-red-200 rounded">
                                <p className="font-medium">Troubleshooting Steps:</p>
                                <ol className="list-decimal list-inside mt-2 space-y-1">
                                    <li>Click "Test Database" button above</li>
                                    <li>Check browser console for detailed error messages</li>
                                    <li>Verify your Supabase RLS policies allow admin access</li>
                                    <li>Check if users actually exist in your database</li>
                                </ol>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Missing Client Records Warning */}
            {stats.missingClientRecords && stats.missingClientRecords.length > 0 && (
                <motion.div variants={fadeInUp}>
                    <Card className="p-6 border-red-300 bg-red-50">
                        <h3 className="text-lg font-semibold text-red-800 mb-4">
                            🚨 Missing Client Records Found
                        </h3>
                        <p className="text-red-700 mb-4">
                            These users have projects but no records in your custom users table. This can cause issues with client tracking and dashboard functionality.
                        </p>
                        <div className="space-y-2">
                            {stats.missingClientRecords.map((authUser, index) => {
                                const userProjects = stats.projects.filter(p => p.client_id === authUser.id);
                                return (
                                    <div key={index} className="bg-white border border-red-200 rounded p-3">
                                        <div className="mb-3">
                                            <div className="font-medium text-gray-900">
                                                {authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Unknown User'}
                                            </div>
                                            <div className="text-sm text-gray-600">{authUser.email}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Auth ID: <code className="bg-gray-100 px-1 rounded">{authUser.id}</code>
                                            </div>
                                            <div className="text-sm text-blue-600 mt-1">
                                                Has {userProjects.length} project(s): {userProjects.map(p => p.title).join(', ')}
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-200 pt-3">
                                            <Button
                                                size="sm"
                                                onClick={async () => {
                                                    try {
                                                        const userName = authUser.user_metadata?.name ||
                                                            authUser.user_metadata?.full_name ||
                                                            authUser.email?.split('@')[0] ||
                                                            'Unknown User';

                                                        const { error } = await supabase
                                                            .from('users')
                                                            .insert({
                                                                id: authUser.id,
                                                                name: userName,
                                                                email: authUser.email,
                                                                role: 'client',
                                                                created_at: authUser.created_at
                                                            });

                                                        if (error) throw error;

                                                        toast.success(`Created user record for ${userName}`);
                                                        loadDatabaseStats(); // Refresh data
                                                    } catch (error: any) {
                                                        console.error('Error creating user record:', error);
                                                        toast.error(`Failed to create user record: ${error.message}`);
                                                    }
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white mr-2"
                                            >
                                                Create User Record
                                            </Button>
                                            <span className="text-xs text-gray-600">
                                                This will create a record in your users table
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 p-3 bg-white border border-red-200 rounded">
                            <p className="text-sm text-red-700">
                                <strong>Why this happens:</strong> Users can authenticate and create projects without having records in your custom users table.
                                Creating user records ensures proper client tracking and dashboard functionality.
                            </p>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Orphaned Projects Warning */}
            {stats.orphanedProjects && stats.orphanedProjects.length > 0 && (
                <motion.div variants={fadeInUp}>
                    <Card className="p-6 border-yellow-300 bg-yellow-50">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                            ⚠️ Orphaned Projects Found
                        </h3>
                        <p className="text-yellow-700 mb-4">
                            These projects have invalid or missing client_id values. Check the browser console for detailed information about available user IDs and how to fix these relationships manually.
                        </p>
                        <div className="space-y-2">
                            {stats.orphanedProjects.map((project, index) => (
                                <div key={index} className="bg-white border border-yellow-200 rounded p-3">
                                    <div className="mb-3">
                                        <div className="font-medium text-gray-900">{project.title}</div>
                                        <div className="text-sm text-gray-600">
                                            Current client_id: <code className="bg-gray-100 px-1 rounded">{project.client_id || 'null'}</code>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Project ID: <code className="bg-gray-100 px-1 rounded">{project.id}</code>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="text-xs text-gray-600 mb-2">
                                            <strong>Available Users (choose the correct client):</strong>
                                        </div>
                                        <div className="space-y-1">
                                            {stats.users.map(user => (
                                                <div key={user.id} className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between">
                                                    <div>
                                                        <code className="text-blue-600 font-mono">{user.id.substring(0, 12)}...</code>
                                                        <span className="ml-2">{user.name} ({user.email})</span>
                                                        <span className={`ml-2 px-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 text-xs text-red-600">
                                            ⚠️ Update the project's client_id in your database to the correct user ID above
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Client-Project Relationships */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        👥 Client-Project Relationships
                    </h3>
                    {stats.relationships.clientProjects.length > 0 ? (
                        <div className="space-y-3">
                            {stats.relationships.clientProjects.map((client, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{client.clientName}</h4>
                                            <p className="text-sm text-gray-600">{client.clientEmail}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <span>ID: {client.clientId}</span>
                                                <span>•</span>
                                                <span>Role: {client.clientRole}</span>
                                                <span>•</span>
                                                <span>Joined: {new Date(client.clientCreated).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-blue-600">
                                                {client.projectCount} projects
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {client.projects.map((project, pIndex) => (
                                            <div
                                                key={pIndex}
                                                className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs"
                                            >
                                                {getStatusIcon(project.status)}
                                                <span>{project.title}</span>
                                                <span className="text-gray-500">({project.status})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-600">
                            No client-project relationships found
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Payment Summary */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        💳 Payment Summary by Client
                    </h3>
                    {stats.relationships.paymentSummary.length > 0 ? (
                        <div className="space-y-3">
                            {stats.relationships.paymentSummary.map((client, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{client.clientName}</h4>
                                            <p className="text-sm text-gray-600">{client.clientEmail}</p>
                                            <div className="text-xs text-gray-500">
                                                ID: {client.clientId}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-green-600">
                                                {formatCurrency(client.totalAmount)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {client.paymentCount} payments
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                            <span>{client.succeededCount} succeeded</span>
                                        </div>
                                        {client.pendingCount > 0 && (
                                            <div className="flex items-center gap-1">
                                                <ClockIcon className="w-4 h-4 text-yellow-600" />
                                                <span>{client.pendingCount} pending</span>
                                            </div>
                                        )}
                                        {client.failedCount > 0 && (
                                            <div className="flex items-center gap-1">
                                                <XCircleIcon className="w-4 h-4 text-red-600" />
                                                <span>{client.failedCount} failed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-600">
                            No payment data found
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* All Users Details */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        👥 All Users Details
                    </h3>
                    {stats.users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payments</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.users.map((user) => {
                                        const userProjects = stats.projects.filter(p => p.client_id === user.id);
                                        const userPayments = stats.payments.filter(p => p.client_id === user.id);
                                        const succeededPayments = userPayments.filter(p => p.status === 'succeeded');
                                        const totalPaid = succeededPayments.reduce((sum, p) => sum + p.amount, 0);

                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-xs font-mono text-gray-600">
                                                    {user.id.substring(0, 8)}...
                                                </td>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                    {user.name || 'No name'}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    {user.email || 'No email'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : user.role === 'client'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {user.role || 'no role'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-1">
                                                        {user.hasCustomRecord ? (
                                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                ✓ Complete
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                                ⚠️ Auth Only
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                    {userProjects.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-blue-600">
                                                                {userProjects.length} projects
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {userProjects.map(p => p.status).join(', ')}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No projects</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                    {userPayments.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-green-600">
                                                                {formatCurrency(totalPaid)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {userPayments.length} payments
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No payments</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-600">
                            No users found
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* All Projects Details */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📋 All Projects Details
                    </h3>
                    {stats.projects.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.projects.map((project) => {
                                        const client = stats.users.find(u => u.id === project.client_id);

                                        return (
                                            <tr key={project.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-xs font-mono text-gray-600">
                                                    {project.id.substring(0, 8)}...
                                                </td>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                    {project.title || 'No title'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(project.status)}
                                                        <span className="text-sm capitalize">{project.status || 'no status'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                    {client ? (
                                                        <div>
                                                            <div className="font-medium text-gray-900">{client.name}</div>
                                                            <div className="text-xs text-gray-500">{client.email}</div>
                                                            <div className="text-xs text-gray-400">ID: {client.id.substring(0, 8)}...</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-red-500">No client found</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-sm font-medium text-green-600">
                                                    {project.price ? formatCurrency(Number(project.price) * 100) : 'No price'}
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
                    ) : (
                        <div className="text-center py-4 text-gray-600">
                            No projects found
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Raw Data Summary */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        🗄️ Data Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Users by Role</h4>
                            <div className="space-y-1 text-sm">
                                {Object.entries(
                                    stats.users.reduce((acc, user) => {
                                        const role = user.role || 'no role';
                                        acc[role] = (acc[role] || 0) + 1;
                                        return acc;
                                    }, {} as Record<string, number>)
                                ).map(([role, count]) => (
                                    <div key={role} className="flex justify-between">
                                        <span className="capitalize">{role}:</span>
                                        <span className="font-medium">{count as any}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Projects by Status</h4>
                            <div className="space-y-1 text-sm">
                                {Object.entries(
                                    stats.projects.reduce((acc, project) => {
                                        const status = project.status || 'no status';
                                        acc[status] = (acc[status] || 0) + 1;
                                        return acc;
                                    }, {} as Record<string, number>)
                                ).map(([status, count]) => (
                                    <div key={status} className="flex justify-between">
                                        <span className="capitalize">{status}:</span>
                                        <span className="font-medium">{count as any}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Payments by Status</h4>
                            <div className="space-y-1 text-sm">
                                {Object.entries(
                                    stats.payments.reduce((acc, payment) => {
                                        const status = payment.status || 'no status';
                                        acc[status] = (acc[status] || 0) + 1;
                                        return acc;
                                    }, {} as Record<string, number>)
                                ).map(([status, count]) => (
                                    <div key={status} className="flex justify-between">
                                        <span className="capitalize">{status}:</span>
                                        <span className="font-medium">{count as any}</span>
                                    </div>
                                 ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
});