import React, { useState } from 'react';
import { Card, Button } from '../common';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const SimpleDatabaseOverview: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadSimpleData = async () => {
        if (loading) return;

        try {
            setLoading(true);
            console.log('Loading simple database data...');

            const [users, projects, payments] = await Promise.all([
                supabase.from('users').select('*'),
                supabase.from('projects').select('*'),
                supabase.from('payments').select('*')
            ]);

            setData({
                users: users.data || [],
                projects: projects.data || [],
                payments: payments.data || [],
                usersError: users.error?.message,
                projectsError: projects.error?.message,
                paymentsError: payments.error?.message
            });

            console.log('Simple data loaded:', {
                users: users.data?.length || 0,
                projects: projects.data?.length || 0,
                payments: payments.data?.length || 0
            });

        } catch (error: any) {
            console.error('Simple load error:', error);
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">📊 Simple Database Overview</h2>
                    <p className="text-gray-600">Basic database information without complex processing</p>
                </div>
                <Button
                    onClick={loadSimpleData}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {loading ? 'Loading...' : 'Load Data'}
                </Button>
            </div>

            {data && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {data.users.length}
                        </div>
                        <div className="text-sm text-gray-600">Users</div>
                        {data.usersError && (
                            <div className="text-xs text-red-600 mt-1">Error: {data.usersError}</div>
                        )}
                    </Card>

                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {data.projects.length}
                        </div>
                        <div className="text-sm text-gray-600">Projects</div>
                        {data.projectsError && (
                            <div className="text-xs text-red-600 mt-1">Error: {data.projectsError}</div>
                        )}
                    </Card>

                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {data.payments.length}
                        </div>
                        <div className="text-sm text-gray-600">Payments</div>
                        {data.paymentsError && (
                            <div className="text-xs text-red-600 mt-1">Error: {data.paymentsError}</div>
                        )}
                    </Card>
                </div>
            )}

            {data && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Data</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900">Users:</h4>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                                {JSON.stringify(data.users, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900">Projects:</h4>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                                {JSON.stringify(data.projects, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900">Payments:</h4>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                                {JSON.stringify(data.payments, null, 2)}
                            </pre>
                        </div>
                    </div>
                </Card>
            )}

            {!data && !loading && (
                <Card className="p-8 text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Simple Database Overview
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Click "Load Data" to see your database information
                    </p>
                </Card>
            )}
        </div>
    );
};