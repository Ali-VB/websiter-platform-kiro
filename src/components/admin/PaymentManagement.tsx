import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../common';
import { supabase } from '../../lib/supabase';
import { StripePaymentService } from '../../services/stripe/payments';
import { updateProjectStatusBasedOnPayments } from '../../utils/paymentHelpers';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import toast from 'react-hot-toast';
import {
    CreditCardIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface Payment {
    id: string;
    project_id: string;
    client_id: string;
    stripe_payment_intent_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'canceled';
    payment_type: 'initial' | 'final' | 'maintenance';
    payment_method: string;
    created_at: string;
    processed_at: string | null;
    projects?: {
        title: string;
        status: string;
    };
    users?: {
        name: string;
        email: string;
    };
}

export const PaymentManagement: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'succeeded' | 'failed'>('all');

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('payments')
                .select(`
          *,
          projects(title, status),
          users(name, email)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (error) {
            console.error('Error loading payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const createFinalPayment = async (payment: Payment) => {
        if (!payment.projects?.title) {
            toast.error('Project information not available');
            return;
        }

        try {
            // Calculate final payment amount (assuming 50% split)
            const finalAmount = payment.amount; // Same as initial for 50/50 split

            const response = await StripePaymentService.createPaymentIntent({
                amount: finalAmount,
                currency: payment.currency,
                projectId: payment.project_id,
                clientId: payment.client_id,
                paymentType: 'final',
                metadata: {
                    projectTitle: payment.projects.title,
                    initialPaymentId: payment.id,
                },
            });

            // Create a payment link for the client
            const paymentUrl = `${window.location.origin}/payment?client_secret=${response.clientSecret}`;

            toast.success('Final payment created! Send this link to the client.');

            // You could also send an email to the client here
            console.log('Payment URL for client:', paymentUrl);

            // Copy to clipboard
            navigator.clipboard.writeText(paymentUrl);
            toast.success('Payment link copied to clipboard!');

        } catch (error) {
            console.error('Error creating final payment:', error);
            toast.error('Failed to create final payment');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded':
                return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case 'failed':
                return <XCircleIcon className="w-5 h-5 text-red-600" />;
            case 'pending':
                return <ClockIcon className="w-5 h-5 text-yellow-600" />;
            case 'canceled':
                return <XCircleIcon className="w-5 h-5 text-gray-600" />;
            default:
                return <CreditCardIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium";

        switch (status) {
            case 'succeeded':
                return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
            case 'failed':
                return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
            case 'canceled':
                return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
        }
    };

    const getPaymentTypeBadge = (type: string) => {
        const baseClasses = "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium";

        switch (type) {
            case 'initial':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'final':
                return `${baseClasses} bg-purple-100 text-purple-800`;
            case 'maintenance':
                return `${baseClasses} bg-orange-100 text-orange-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const filteredPayments = payments.filter(payment => {
        if (filter === 'all') return true;
        return payment.status === filter;
    });

    const totalRevenue = payments
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="text-4xl mb-2">💳</div>
                    <div className="text-gray-600">Loading payments...</div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            💳 Payment Management
                        </h2>
                        <p className="text-gray-600">
                            Monitor and manage all payments
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={async () => {
                                if (!confirm('This will update all pending payments to succeeded. Continue?')) return;
                                try {
                                    await StripePaymentService.fixPendingPayments();
                                    toast.success('Pending payments synchronized successfully!');
                                    loadPayments();
                                } catch (error) {
                                    toast.error('Failed to synchronize pending payments');
                                }
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            size="sm"
                        >
                            🔄 Sync Payments
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!confirm('This will update all project statuses based on payment data. Continue?')) return;
                                try {
                                    const { data: projects } = await supabase.from('projects').select('id');
                                    if (projects) {
                                        for (const project of projects) {
                                            await updateProjectStatusBasedOnPayments(project.id);
                                        }
                                    }
                                    toast.success('Project statuses synchronized successfully!');
                                    loadPayments();
                                } catch (error) {
                                    toast.error('Failed to synchronize project statuses');
                                }
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            size="sm"
                        >
                            🔄 Sync Statuses
                        </Button>
                        <Button
                            onClick={async () => {
                                try {
                                    // Debug specific client payment issues
                                    const clientId = prompt('Enter client ID to debug (or leave empty for all):');
                                    if (clientId) {
                                        await StripePaymentService.debugPaymentStatus(clientId);
                                        toast.success('Check console for debug information');
                                    } else {
                                        // Show all clients with payment issues
                                        const { data: clientsWithIssues } = await supabase
                                            .from('payments')
                                            .select(`
                                                client_id,
                                                status,
                                                users(name, email)
                                            `)
                                            .in('status', ['pending', 'failed']);

                                        console.log('Clients with payment issues:', clientsWithIssues);
                                        toast.success('Check console for clients with payment issues');
                                    }
                                } catch (error) {
                                    toast.error('Debug failed');
                                }
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            size="sm"
                        >
                            🔍 Debug Client Issues
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {StripePaymentService.formatAmount(totalRevenue)}
                        </div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {StripePaymentService.formatAmount(pendingAmount)}
                        </div>
                        <div className="text-sm text-gray-600">Pending</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {payments.filter(p => p.status === 'succeeded').length}
                        </div>
                        <div className="text-sm text-gray-600">Successful</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {payments.filter(p => p.status === 'failed').length}
                        </div>
                        <div className="text-sm text-gray-600">Failed</div>
                    </Card>
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div variants={fadeInUp}>
                <Card className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'all', label: 'All Payments', count: payments.length },
                            { key: 'succeeded', label: 'Successful', count: payments.filter(p => p.status === 'succeeded').length },
                            { key: 'pending', label: 'Pending', count: payments.filter(p => p.status === 'pending').length },
                            { key: 'failed', label: 'Failed', count: payments.filter(p => p.status === 'failed').length },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* Payments List */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Payment History
                    </h3>

                    {filteredPayments.length > 0 ? (
                        <div className="space-y-4">
                            {filteredPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {getStatusIcon(payment.status)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {payment.projects?.title || 'Unknown Project'}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Client: {payment.users?.name || 'Unknown'} ({payment.users?.email})
                                                </p>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={getStatusBadge(payment.status)}>
                                                        {getStatusIcon(payment.status)}
                                                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                    </span>
                                                    <span className={getPaymentTypeBadge(payment.payment_type)}>
                                                        {payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)}
                                                    </span>
                                                    {payment.payment_method && (
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {payment.payment_method}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">
                                                {StripePaymentService.formatAmount(payment.amount)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {payment.currency.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                Created: {new Date(payment.created_at).toLocaleDateString()}
                                            </div>
                                            {payment.processed_at && (
                                                <div>
                                                    Processed: {new Date(payment.processed_at).toLocaleDateString()}
                                                </div>
                                            )}
                                            {payment.stripe_payment_intent_id && (
                                                <div className="font-mono text-xs">
                                                    {payment.stripe_payment_intent_id}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {payment.payment_type === 'initial' &&
                                                payment.status === 'succeeded' &&
                                                payment.projects?.status === 'completed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => createFinalPayment(payment)}
                                                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                                                    >
                                                        <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                                        Request Final Payment
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">💳</div>
                            <div className="text-gray-600">
                                No {filter === 'all' ? '' : filter} payments found
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>
        </motion.div>
    );
};