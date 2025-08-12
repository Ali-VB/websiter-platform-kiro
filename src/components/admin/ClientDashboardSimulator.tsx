import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Modal } from '../common';
import { supabase } from '../../lib/supabase';
import { ClientDashboard } from '../dashboard/ClientDashboard';
import { PaymentHistory } from '../dashboard/PaymentHistory';
import { ProjectOverview } from '../dashboard/ProjectOverview';
import { SupportTickets } from '../dashboard/SupportTickets';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import toast from 'react-hot-toast';
import {
    UserIcon,
    EyeIcon,
    ComputerDesktopIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Client {
    id: string;
    name: string;
    email: string;
    created_at: string;
    projects?: any[];
    payments?: any[];
}

interface ClientDashboardSimulatorProps {
    onClose: () => void;
}

export const ClientDashboardSimulator: React.FC<ClientDashboardSimulatorProps> = ({ onClose }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [simulatorView, setSimulatorView] = useState<'dashboard' | 'payments' | 'projects' | 'support'>('dashboard');
    const [loading, setLoading] = useState(true);
    const [simulatingAs, setSimulatingAs] = useState<Client | null>(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);

            // First, get all users who have projects (they are clients)
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select(`
                    client_id,
                    users!projects_client_id_fkey(id, name, email, created_at, role)
                `)
                .not('client_id', 'is', null);

            if (projectsError) throw projectsError;

            // Get unique clients
            const uniqueClients = projectsData?.reduce((acc, project) => {
                const client = project.users;
                if (client && !acc.find(c => c.id === client.id)) {
                    acc.push(client);
                }
                return acc;
            }, [] as any[]) || [];

            console.log('Found clients:', uniqueClients);

            // For each client, get their projects and payments
            const clientsWithData = await Promise.all(
                uniqueClients.map(async (client) => {
                    // Get projects
                    const { data: projects } = await supabase
                        .from('projects')
                        .select('*')
                        .eq('client_id', client.id);

                    // Get payments
                    const { data: payments } = await supabase
                        .from('payments')
                        .select('*')
                        .eq('client_id', client.id);

                    return {
                        ...client,
                        projects: projects || [],
                        payments: payments || []
                    };
                })
            );

            setClients(clientsWithData);

            // If no clients found, try alternative approach
            if (clientsWithData.length === 0) {
                console.log('No clients found via projects, trying alternative approach...');

                // Try to get all users and see if any have projects
                const { data: allUsers, error: usersError } = await supabase
                    .from('users')
                    .select('id, name, email, created_at, role')
                    .order('created_at', { ascending: false });

                if (!usersError && allUsers) {
                    console.log('All users in system:', allUsers);

                    // Check which users have projects
                    const usersWithProjects = [];
                    for (const user of allUsers) {
                        const { data: userProjects } = await supabase
                            .from('projects')
                            .select('*')
                            .eq('client_id', user.id);

                        if (userProjects && userProjects.length > 0) {
                            const { data: userPayments } = await supabase
                                .from('payments')
                                .select('*')
                                .eq('client_id', user.id);

                            usersWithProjects.push({
                                ...user,
                                projects: userProjects,
                                payments: userPayments || []
                            });
                        }
                    }

                    console.log('Users with projects:', usersWithProjects);
                    setClients(usersWithProjects);
                }
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const simulateClientView = (client: Client) => {
        setSimulatingAs(client);
        setSelectedClient(client);
    };

    const stopSimulation = () => {
        setSimulatingAs(null);
        setSelectedClient(null);
        setSimulatorView('dashboard');
    };

    const getClientSummary = (client: Client) => {
        const projects = client.projects || [];
        const payments = client.payments || [];

        return {
            totalProjects: projects.length,
            activeProjects: projects.filter(p => ['confirmed', 'in_progress', 'in_design', 'review'].includes(p.status)).length,
            completedProjects: projects.filter(p => p.status === 'completed').length,
            totalPaid: payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0),
            pendingPayments: payments.filter(p => p.status === 'pending').length,
            failedPayments: payments.filter(p => p.status === 'failed').length,
        };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
        }).format(amount / 100);
    };

    if (simulatingAs) {
        return (
            <div className="fixed inset-0 bg-gray-900 z-50">
                {/* Simulation Header */}
                <div className="bg-yellow-100 border-b border-yellow-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                            <div>
                                <span className="font-medium text-yellow-800">
                                    Admin Simulation Mode
                                </span>
                                <span className="text-yellow-700 ml-2">
                                    Viewing as: {simulatingAs.name} ({simulatingAs.email})
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-white rounded-lg p-1">
                                {[
                                    { key: 'dashboard', label: 'Dashboard', icon: ComputerDesktopIcon },
                                    { key: 'projects', label: 'Projects', icon: UserIcon },
                                    { key: 'payments', label: 'Payments', icon: UserIcon },
                                    { key: 'support', label: 'Support', icon: UserIcon },
                                ].map((view) => (
                                    <button
                                        key={view.key}
                                        onClick={() => setSimulatorView(view.key as any)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${simulatorView === view.key
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {view.label}
                                    </button>
                                ))}
                            </div>
                            <Button
                                onClick={stopSimulation}
                                variant="outline"
                                size="sm"
                                className="bg-white"
                            >
                                Exit Simulation
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Simulated Client View */}
                <div className="h-full bg-gray-50 overflow-auto">
                    <div className="pt-16">
                        {simulatorView === 'dashboard' && (
                            <ClientDashboard />
                        )}
                        {simulatorView === 'projects' && (
                            <div className="max-w-7xl mx-auto px-4 py-8">
                                <ProjectOverview />
                            </div>
                        )}
                        {simulatorView === 'payments' && (
                            <div className="max-w-7xl mx-auto px-4 py-8">
                                <PaymentHistory projects={simulatingAs.projects || []} />
                            </div>
                        )}
                        {simulatorView === 'support' && (
                            <div className="max-w-7xl mx-auto px-4 py-8">
                                <SupportTickets />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Modal isOpen={true} onClose={onClose} size="xl">
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="p-6"
            >
                <motion.div variants={fadeInUp} className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        👁️ Client Dashboard Simulator
                    </h2>
                    <p className="text-gray-600">
                        View what any client sees in their dashboard to debug issues and understand their experience.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">⏳</div>
                        <div className="text-gray-600">Loading clients...</div>
                    </div>
                ) : (
                    <motion.div variants={fadeInUp}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                            {clients.map((client) => {
                                const summary = getClientSummary(client);
                                const hasIssues = summary.pendingPayments > 0 || summary.failedPayments > 0;

                                return (
                                    <Card
                                        key={client.id}
                                        className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${hasIssues ? 'border-yellow-300 bg-yellow-50' : ''
                                            }`}
                                        onClick={() => simulateClientView(client)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        {client.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {client.email}
                                                    </p>
                                                </div>
                                            </div>
                                            {hasIssues && (
                                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Projects:</span>
                                                <span className="font-medium">
                                                    {summary.totalProjects} ({summary.activeProjects} active)
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Paid:</span>
                                                <span className="font-medium text-green-600">
                                                    {formatCurrency(summary.totalPaid)}
                                                </span>
                                            </div>
                                            {summary.pendingPayments > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Pending Payments:</span>
                                                    <span className="font-medium text-yellow-600">
                                                        {summary.pendingPayments}
                                                    </span>
                                                </div>
                                            )}
                                            {summary.failedPayments > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Failed Payments:</span>
                                                    <span className="font-medium text-red-600">
                                                        {summary.failedPayments}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    Joined {new Date(client.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-1 text-blue-600">
                                                    <EyeIcon className="w-4 h-4" />
                                                    <span className="text-xs font-medium">View Dashboard</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {clients.length === 0 && (
                            <div className="text-center py-8">
                                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Clients Found
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    No clients with projects found in the system.
                                </p>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left max-w-md mx-auto">
                                    <h4 className="font-medium text-yellow-800 mb-2">Debug Information:</h4>
                                    <p className="text-sm text-yellow-700 mb-2">
                                        Check the browser console for detailed information about users and projects in your database.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={async () => {
                                            console.log('=== DATABASE DEBUG INFO ===');

                                            // Check users table
                                            const { data: users, error: usersError } = await supabase
                                                .from('users')
                                                .select('*');
                                            console.log('Users table:', { users, error: usersError });

                                            // Check projects table
                                            const { data: projects, error: projectsError } = await supabase
                                                .from('projects')
                                                .select('*');
                                            console.log('Projects table:', { projects, error: projectsError });

                                            // Check payments table
                                            const { data: payments, error: paymentsError } = await supabase
                                                .from('payments')
                                                .select('*');
                                            console.log('Payments table:', { payments, error: paymentsError });

                                            toast.success('Debug info logged to console');
                                        }}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                    >
                                        Debug Database
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                <motion.div variants={fadeInUp} className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </motion.div>
            </motion.div>
        </Modal>
    );
};