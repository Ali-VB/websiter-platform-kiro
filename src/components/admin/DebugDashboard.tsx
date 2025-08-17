import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useAllProjects } from '../../hooks/useProjects';
import toast from 'react-hot-toast';
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ServerIcon,
    CircleStackIcon,
    UserIcon,
    DocumentTextIcon,
    CogIcon,

} from '@heroicons/react/24/outline';

interface DebugResult {
    category: string;
    test: string;
    status: 'success' | 'warning' | 'error' | 'info';
    message: string;
    details?: any;
    timestamp: Date;
}

export const DebugDashboard: React.FC = () => {
    const { user } = useAuth();
    const { projects, loading: projectsLoading, error: projectsError } = useAllProjects();
    const [debugResults, setDebugResults] = useState<DebugResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [lastRun, setLastRun] = useState<Date | null>(null);


    const addResult = (result: Omit<DebugResult, 'timestamp'>) => {
        setDebugResults(prev => [...prev, { ...result, timestamp: new Date() }]);
    };

    const clearResults = () => {
        setDebugResults([]);
        setLastRun(null);
    };

    // Database Health Checks
    const testDatabaseConnection = async () => {
        try {
            const { error } = await supabase.from('users').select('count').limit(1);
            if (error) throw error;

            addResult({
                category: 'Database',
                test: 'Connection Test',
                status: 'success',
                message: 'Database connection successful'
            });
        } catch (error: any) {
            addResult({
                category: 'Database',
                test: 'Connection Test',
                status: 'error',
                message: `Database connection failed: ${error.message}`,
                details: error
            });
        }
    };

    const testTableIntegrity = async () => {
        const tables = ['users', 'projects', 'support_tickets', 'client_notes'];

        for (const table of tables) {
            try {
                const { error } = await supabase.from(table).select('count').limit(1);
                if (error) throw error;

                addResult({
                    category: 'Database',
                    test: `Table: ${table}`,
                    status: 'success',
                    message: `Table ${table} accessible`
                });
            } catch (error: any) {
                addResult({
                    category: 'Database',
                    test: `Table: ${table}`,
                    status: 'error',
                    message: `Table ${table} error: ${error.message}`,
                    details: error
                });
            }
        }
    };

    const testDataConsistency = async () => {
        try {
            // Check for orphaned projects (projects without valid users)
            // First get all valid user IDs
            const { data: validUsers, error: usersError } = await supabase
                .from('users')
                .select('id');

            if (usersError) throw usersError;

            const validUserIds = validUsers?.map(user => user.id) || [];

            // Then check for projects with invalid client_id
            const { data: allProjects, error: projectsError } = await supabase
                .from('projects')
                .select('id, title, client_id');

            if (projectsError) throw projectsError;

            const orphanedProjects = allProjects?.filter(project =>
                project.client_id && !validUserIds.includes(project.client_id)
            ) || [];

            if (orphanedProjects.length > 0) {
                addResult({
                    category: 'Data Integrity',
                    test: 'Orphaned Projects',
                    status: 'warning',
                    message: `Found ${orphanedProjects.length} projects with invalid client_id`,
                    details: orphanedProjects
                });
            } else {
                addResult({
                    category: 'Data Integrity',
                    test: 'Orphaned Projects',
                    status: 'success',
                    message: 'No orphaned projects found'
                });
            }

            // Check for projects with null client_id
            const projectsWithoutClient = allProjects?.filter(project => !project.client_id) || [];

            if (projectsWithoutClient.length > 0) {
                addResult({
                    category: 'Data Integrity',
                    test: 'Projects Without Client',
                    status: 'warning',
                    message: `Found ${projectsWithoutClient.length} projects without client_id`,
                    details: projectsWithoutClient
                });
            } else {
                addResult({
                    category: 'Data Integrity',
                    test: 'Projects Without Client',
                    status: 'success',
                    message: 'All projects have valid client_id'
                });
            }

            // Check for duplicate project titles
            const titleCounts = allProjects?.reduce((acc, project) => {
                acc[project.title] = (acc[project.title] || 0) + 1;
                return acc;
            }, {} as Record<string, number>) || {};

            const duplicateTitles = Object.entries(titleCounts)
                .filter(([_, count]) => count > 1)
                .map(([title, count]) => ({ title, count }));

            if (duplicateTitles.length > 0) {
                addResult({
                    category: 'Data Integrity',
                    test: 'Duplicate Project Titles',
                    status: 'info',
                    message: `Found ${duplicateTitles.length} duplicate project titles`,
                    details: duplicateTitles
                });
            } else {
                addResult({
                    category: 'Data Integrity',
                    test: 'Duplicate Project Titles',
                    status: 'success',
                    message: 'No duplicate project titles found'
                });
            }

        } catch (error: any) {
            addResult({
                category: 'Data Integrity',
                test: 'Data Consistency Check',
                status: 'error',
                message: `Data consistency check failed: ${error.message}`,
                details: error
            });
        }
    };

    // Authentication & Authorization Tests
    const testAuthSystem = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            if (!currentUser) {
                addResult({
                    category: 'Authentication',
                    test: 'User Session',
                    status: 'error',
                    message: 'No authenticated user found'
                });
                return;
            }

            addResult({
                category: 'Authentication',
                test: 'User Session',
                status: 'success',
                message: `User authenticated: ${currentUser.email}`
            });

            // Test admin permissions
            if (user?.role === 'admin') {
                addResult({
                    category: 'Authorization',
                    test: 'Admin Permissions',
                    status: 'success',
                    message: 'Admin role verified'
                });
            } else {
                addResult({
                    category: 'Authorization',
                    test: 'Admin Permissions',
                    status: 'warning',
                    message: `User role: ${user?.role || 'unknown'} (not admin)`
                });
            }
        } catch (error: any) {
            addResult({
                category: 'Authentication',
                test: 'Auth System',
                status: 'error',
                message: `Authentication test failed: ${error.message}`,
                details: error
            });
        }
    };

    // API & Services Tests
    const testCoreServices = async () => {
        // Test project loading
        if (projectsError) {
            addResult({
                category: 'Services',
                test: 'Project Service',
                status: 'error',
                message: `Project loading failed: ${projectsError}`,
                details: projectsError
            });
        } else if (projectsLoading) {
            addResult({
                category: 'Services',
                test: 'Project Service',
                status: 'info',
                message: 'Projects still loading...'
            });
        } else {
            addResult({
                category: 'Services',
                test: 'Project Service',
                status: 'success',
                message: `Projects loaded successfully (${projects.length} projects)`
            });
        }

        // Test real-time subscriptions
        try {
            const channel = supabase.channel('debug-test');
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Subscription timeout')), 5000);

                channel
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => { })
                    .subscribe((status) => {
                        clearTimeout(timeout);
                        if (status === 'SUBSCRIBED') {
                            resolve(status);
                        } else {
                            reject(new Error(`Subscription failed: ${status}`));
                        }
                    });
            });

            await channel.unsubscribe();

            addResult({
                category: 'Services',
                test: 'Real-time Subscriptions',
                status: 'success',
                message: 'Real-time subscriptions working'
            });
        } catch (error: any) {
            addResult({
                category: 'Services',
                test: 'Real-time Subscriptions',
                status: 'warning',
                message: `Real-time test failed: ${error.message}`,
                details: error
            });
        }
    };

    // Database Overview
    const testDatabaseOverview = async () => {
        try {
            // Get counts from all main tables
            const tables = ['users', 'projects', 'payments', 'support_tickets'];

            for (const table of tables) {
                try {
                    const { error, count } = await supabase
                        .from(table)
                        .select('*', { count: 'exact', head: true });

                    if (error) throw error;

                    addResult({
                        category: 'Database Overview',
                        test: `Table: ${table}`,
                        status: 'info',
                        message: `${count || 0} records in ${table} table`,
                        details: { table, count }
                    });
                } catch (error: any) {
                    addResult({
                        category: 'Database Overview',
                        test: `Table: ${table}`,
                        status: 'error',
                        message: `Error accessing ${table}: ${error.message}`,
                        details: error
                    });
                }
            }

            // Get sample data from key tables
            const { data: sampleUsers } = await supabase
                .from('users')
                .select('id, name, email, role, created_at')
                .limit(5);

            const { data: sampleProjects } = await supabase
                .from('projects')
                .select('id, title, status, client_id, created_at')
                .limit(5);

            addResult({
                category: 'Database Overview',
                test: 'Sample Data',
                status: 'info',
                message: `Sample users: ${sampleUsers?.length || 0}, Sample projects: ${sampleProjects?.length || 0}`,
                details: { sampleUsers, sampleProjects }
            });

        } catch (error: any) {
            addResult({
                category: 'Database Overview',
                test: 'Database Overview',
                status: 'error',
                message: `Database overview failed: ${error.message}`,
                details: error
            });
        }
    };

    // Client Dashboard Tests
    const testClientDashboards = async () => {
        try {
            // Get all clients with projects
            const { data: clientsWithProjects, error: clientsError } = await supabase
                .from('projects')
                .select(`
                    client_id,
                    id,
                    title,
                    status,
                    price,
                    created_at,
                    users!projects_client_id_fkey(id, name, email)
                `)
                .not('client_id', 'is', null);

            if (clientsError) throw clientsError;

            // Group by client
            const clientGroups = clientsWithProjects?.reduce((acc, project) => {
                const clientId = project.client_id;
                if (clientId && project.users) { // Only process if both client_id and user data exist
                    if (!acc[clientId]) {
                        acc[clientId] = {
                            client: project.users,
                            projects: []
                        };
                    }
                    acc[clientId].projects.push(project);
                }
                return acc;
            }, {} as Record<string, any>) || {};

            addResult({
                category: 'Client Dashboards',
                test: 'Client Data Access',
                status: 'success',
                message: `Found ${Object.keys(clientGroups).length} clients with projects`,
                details: Object.entries(clientGroups).map(([clientId, data]) => ({
                    clientId,
                    clientName: data.client.name,
                    clientEmail: data.client.email,
                    projectCount: data.projects.length,
                    projects: data.projects.map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        status: p.status,
                        price: p.price
                    }))
                }))
            });

            // Test payment data for each client
            for (const [clientId, clientData] of Object.entries(clientGroups)) {
                if (!clientData.client || !clientData.client.name) {
                    addResult({
                        category: 'Client Dashboards',
                        test: `Payment Data - Client ${clientId}`,
                        status: 'warning',
                        message: `Client ${clientId} has missing user data`,
                        details: { clientId, clientData }
                    });
                    continue;
                }

                const { data: payments, error: paymentsError } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('client_id', clientId);

                if (paymentsError) {
                    addResult({
                        category: 'Client Dashboards',
                        test: `Payment Data - ${clientData.client.name}`,
                        status: 'error',
                        message: `Failed to load payments for ${clientData.client.name}: ${paymentsError.message}`,
                        details: { clientId, error: paymentsError }
                    });
                } else {
                    const paymentSummary = {
                        totalPayments: payments?.length || 0,
                        succeededPayments: payments?.filter(p => p.status === 'succeeded').length || 0,
                        pendingPayments: payments?.filter(p => p.status === 'pending').length || 0,
                        failedPayments: payments?.filter(p => p.status === 'failed').length || 0,
                        totalAmount: payments?.reduce((sum, p) => sum + (p.status === 'succeeded' ? p.amount : 0), 0) || 0
                    };

                    const hasIssues = paymentSummary.pendingPayments > 0 || paymentSummary.failedPayments > 0;

                    addResult({
                        category: 'Client Dashboards',
                        test: `Payment Data - ${clientData.client.name}`,
                        status: hasIssues ? 'warning' : 'success',
                        message: `${clientData.client.name}: ${paymentSummary.totalPayments} payments (${paymentSummary.succeededPayments} succeeded, ${paymentSummary.pendingPayments} pending, ${paymentSummary.failedPayments} failed)`,
                        details: { clientId, ...paymentSummary, payments }
                    });
                }
            }

            // Test project status consistency
            for (const [clientId, clientData] of Object.entries(clientGroups)) {
                if (!clientData.client || !clientData.client.name) continue;

                const projectStatuses = clientData.projects.map((p: any) => p.status);
                const statusCounts = projectStatuses.reduce((acc: any, status: string) => {
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});

                addResult({
                    category: 'Client Dashboards',
                    test: `Project Status - ${clientData.client.name}`,
                    status: 'info',
                    message: `${clientData.client.name}: ${Object.entries(statusCounts).map(([status, count]) => `${count} ${status}`).join(', ')}`,
                    details: { clientId, statusCounts, projects: clientData.projects }
                });
            }

        } catch (error: any) {
            addResult({
                category: 'Client Dashboards',
                test: 'Client Dashboard Analysis',
                status: 'error',
                message: `Client dashboard test failed: ${error.message}`,
                details: error
            });
        }
    };

    // System Performance Tests
    const testPerformance = async () => {
        const startTime = performance.now();

        try {
            // Test query performance
            await supabase.from('projects').select('id, title, status').limit(100);
            const queryTime = performance.now() - startTime;

            if (queryTime < 1000) {
                addResult({
                    category: 'Performance',
                    test: 'Query Speed',
                    status: 'success',
                    message: `Query completed in ${queryTime.toFixed(2)}ms`
                });
            } else if (queryTime < 3000) {
                addResult({
                    category: 'Performance',
                    test: 'Query Speed',
                    status: 'warning',
                    message: `Query took ${queryTime.toFixed(2)}ms (slow)`
                });
            } else {
                addResult({
                    category: 'Performance',
                    test: 'Query Speed',
                    status: 'error',
                    message: `Query took ${queryTime.toFixed(2)}ms (very slow)`
                });
            }
        } catch (error: any) {
            addResult({
                category: 'Performance',
                test: 'Query Speed',
                status: 'error',
                message: `Performance test failed: ${error.message}`,
                details: error
            });
        }
    };

    // Configuration & Environment Tests
    const testConfiguration = async () => {
        // Check environment variables
        const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

        requiredEnvVars.forEach(envVar => {
            const value = import.meta.env[envVar];
            if (value) {
                addResult({
                    category: 'Configuration',
                    test: `Environment: ${envVar}`,
                    status: 'success',
                    message: `${envVar} configured`
                });
            } else {
                addResult({
                    category: 'Configuration',
                    test: `Environment: ${envVar}`,
                    status: 'error',
                    message: `${envVar} missing`
                });
            }
        });

        // Check browser compatibility
        const features = {
            'localStorage': typeof Storage !== 'undefined',
            'fetch': typeof fetch !== 'undefined',
            'WebSocket': typeof WebSocket !== 'undefined',
            'Promise': typeof Promise !== 'undefined'
        };

        Object.entries(features).forEach(([feature, supported]) => {
            addResult({
                category: 'Browser',
                test: `Feature: ${feature}`,
                status: supported ? 'success' : 'error',
                message: `${feature} ${supported ? 'supported' : 'not supported'}`
            });
        });
    };

    const runAllTests = async () => {
        setIsRunning(true);
        setDebugResults([]);

        addResult({
            category: 'System',
            test: 'Debug Session',
            status: 'info',
            message: 'Starting comprehensive system check...'
        });

        // Run all tests
        await testDatabaseConnection();
        await testDatabaseOverview();
        await testTableIntegrity();
        await testDataConsistency();
        await testAuthSystem();
        await testCoreServices();
        await testClientDashboards();
        await testPerformance();
        await testConfiguration();

        addResult({
            category: 'System',
            test: 'Debug Session',
            status: 'info',
            message: 'System check completed'
        });

        setLastRun(new Date());
        setIsRunning(false);
    };

    const getStatusIcon = (status: DebugResult['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
            case 'error':
                return <XCircleIcon className="w-5 h-5 text-red-600" />;
            case 'info':
                return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
        }
    };

    const getStatusColor = (status: DebugResult['status']) => {
        switch (status) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Database':
            case 'Data Integrity':
                return <CircleStackIcon className="w-5 h-5" />;
            case 'Authentication':
            case 'Authorization':
                return <UserIcon className="w-5 h-5" />;
            case 'Services':
                return <ServerIcon className="w-5 h-5" />;
            case 'Performance':
                return <CogIcon className="w-5 h-5" />;
            case 'Configuration':
            case 'Browser':
                return <CogIcon className="w-5 h-5" />;
            default:
                return <DocumentTextIcon className="w-5 h-5" />;
        }
    };

    const groupedResults = debugResults.reduce((acc, result) => {
        if (!acc[result.category]) {
            acc[result.category] = [];
        }
        acc[result.category].push(result);
        return acc;
    }, {} as Record<string, DebugResult[]>);

    const getOverallStatus = () => {
        if (debugResults.length === 0) return 'info';
        if (debugResults.some(r => r.status === 'error')) return 'error';
        if (debugResults.some(r => r.status === 'warning')) return 'warning';
        return 'success';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">System Debug Dashboard</h2>
                    <p className="text-gray-600 mt-1">
                        Comprehensive system health and maintenance checks
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    {lastRun && (
                        <span className="text-sm text-gray-500">
                            Last run: {lastRun.toLocaleTimeString()}
                        </span>
                    )}

                    <Button
                        onClick={() => {
                            const quickDebug = async () => {
                                console.log('=== QUICK DATABASE DEBUG ===');
                                try {
                                    const { data: users } = await supabase.from('users').select('*');
                                    const { data: projects } = await supabase.from('projects').select('*');
                                    console.log(`Found ${users?.length || 0} users and ${projects?.length || 0} projects`);
                                    console.log('Users:', users);
                                    console.log('Projects:', projects);
                                    toast.success(`Found ${users?.length || 0} users, ${projects?.length || 0} projects - check console`);
                                } catch (error) {
                                    console.error('Debug error:', error);
                                    toast.error('Debug failed - check console');
                                }
                            };
                            quickDebug();
                        }}
                        variant="outline"
                        className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50"
                    >
                        <span>Quick Debug</span>
                    </Button>
                    <Button
                        onClick={runAllTests}
                        disabled={isRunning}
                        loading={isRunning}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Run System Check
                    </Button>
                    <Button
                        variant="outline"
                        onClick={clearResults}
                        disabled={isRunning || debugResults.length === 0}
                    >
                        Clear Results
                    </Button>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                console.log('=== COMPLETE DATABASE OVERVIEW ===');

                                // Get all data from main tables
                                const { data: users } = await supabase.from('users').select('*');
                                const { data: projects } = await supabase.from('projects').select('*');
                                const { data: payments } = await supabase.from('payments').select('*');

                                console.log('Users:', users);
                                console.log('Projects:', projects);
                                console.log('Payments:', payments);

                                // Show relationships
                                if (projects && projects.length > 0) {
                                    console.log('Project-Client relationships:');
                                    projects.forEach(project => {
                                        const client = users?.find(u => u.id === project.client_id);
                                        console.log(`Project "${project.title}" -> Client: ${client?.name || 'Unknown'} (${client?.email || 'No email'})`);
                                    });
                                }

                                toast.success('Complete database overview logged to console');
                            } catch (error) {
                                console.error('Database overview error:', error);
                                toast.error('Failed to get database overview');
                            }
                        }}
                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    >
                        Database Overview
                    </Button>
                </div>
            </div>

            {/* Overall Status */}
            {debugResults.length > 0 && (
                <Card className={`p-4 ${getStatusColor(getOverallStatus())}`}>
                    <div className="flex items-center space-x-3">
                        {getStatusIcon(getOverallStatus())}
                        <div>
                            <h3 className="font-semibold">
                                System Status: {getOverallStatus().toUpperCase()}
                            </h3>
                            <p className="text-sm">
                                {debugResults.filter(r => r.status === 'success').length} passed, {' '}
                                {debugResults.filter(r => r.status === 'warning').length} warnings, {' '}
                                {debugResults.filter(r => r.status === 'error').length} errors
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Results by Category */}
            {Object.entries(groupedResults).map(([category, results]) => (
                <Card key={category} className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        {getCategoryIcon(category)}
                        <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                        <Badge className="bg-gray-100 text-gray-800">
                            {results.length} tests
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                            >
                                <div className="flex items-start space-x-3">
                                    {getStatusIcon(result.status)}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{result.test}</h4>
                                            <span className="text-xs text-gray-500">
                                                {result.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1">{result.message}</p>
                                        {result.details && (
                                            <details className="mt-2">
                                                <summary className="text-xs text-gray-600 cursor-pointer">
                                                    Show details
                                                </summary>
                                                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                                    {JSON.stringify(result.details, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}

            {/* Empty State */}
            {debugResults.length === 0 && !isRunning && (
                <Card className="p-12 text-center">
                    <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        System Debug Dashboard
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Run comprehensive system checks to ensure platform health and identify potential issues.
                    </p>
                    <Button
                        onClick={runAllTests}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Start System Check
                    </Button>
                </Card>
            )}

            {/* Loading State */}
            {isRunning && (
                <Card className="p-8 text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600 mt-4">Running system diagnostics...</p>
                </Card>
            )}


        </div>
    );
};