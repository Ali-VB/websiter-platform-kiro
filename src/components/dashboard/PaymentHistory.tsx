import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../common';
import { PaymentModal } from './PaymentModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { fadeInUp, staggerContainer } from '../../utils/motion';
import type { Database } from '../../types/database';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface Payment {
    id: string;
    project_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'canceled';
    payment_type: 'initial' | 'final' | 'maintenance';
    payment_method: string;
    created_at: string;
    processed_at: string | null;
}

interface PaymentHistoryProps {
    projects: ProjectRow[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ projects }) => {
    const { user } = useAuth();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<(ProjectRow & { paymentType?: 'partial' | 'full' }) | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();

        const handleTabVisible = () => {
            console.log('PaymentHistory visible, refreshing data...');
            loadPayments();
        };

        window.addEventListener('tab-visible', handleTabVisible);
        return () => window.removeEventListener('tab-visible', handleTabVisible);
    }, [user]);

    const loadPayments = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('client_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number, currency: string = 'CAD') => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency,
        }).format(amount);
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'succeeded':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 border border-success-200">
                        ✅ Paid
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">
                        ⏳ Pending
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800 border border-error-200">
                        ❌ Failed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 border border-secondary-200">
                        ❓ Unknown
                    </span>
                );
        }
    };

    const getPaymentTypeBadge = (type: string) => {
        switch (type) {
            case 'initial':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        Initial Payment
                    </span>
                );
            case 'final':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                        Final Payment
                    </span>
                );
            case 'maintenance':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        Maintenance
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {type}
                    </span>
                );
        }
    };

    const totalPaid = payments
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);



    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
        >
            {/* Payment Summary */}
            <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-success-600">
                            {formatCurrency(totalPaid)}
                        </div>
                        <div className="text-sm text-secondary-600">Total Paid</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-warning-600">
                            {formatCurrency(pendingAmount)}
                        </div>
                        <div className="text-sm text-secondary-600">Pending</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary-600">
                            {payments.length}
                        </div>
                        <div className="text-sm text-secondary-600">Total Transactions</div>
                    </Card>
                </div>
            </motion.div>

            {/* Payment History */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-secondary-900">
                            💳 Payment History
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">⏳</div>
                            <div className="text-secondary-600">Loading payment history...</div>
                        </div>
                    ) : payments.length > 0 ? (
                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="border border-secondary-200 rounded-xl p-4 hover:shadow-soft transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">
                                                {payment.payment_type === 'initial' ? '🚀' :
                                                    payment.payment_type === 'final' ? '🎯' : '🔧'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-secondary-900">
                                                    {formatCurrency(payment.amount / 100, payment.currency)}
                                                </div>
                                                <div className="text-sm text-secondary-600">
                                                    Project Payment
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {getPaymentStatusBadge(payment.status)}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {getPaymentTypeBadge(payment.payment_type)}
                                            {payment.payment_method && (
                                                <span className="text-sm text-secondary-600">
                                                    • {payment.payment_method}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-secondary-600">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {payment.status === 'pending' && (
                                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mt-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-warning-800">
                                                    ⏱️ Payment pending - complete your payment to continue
                                                </div>
                                                <Button size="sm" className="bg-warning-600 hover:bg-warning-700">
                                                    Pay Now
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {payment.status === 'failed' && (
                                        <div className="bg-error-50 border border-error-200 rounded-lg p-3 mt-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-error-800">
                                                    ❌ Payment failed - please try again or contact support
                                                </div>
                                                <Button size="sm" className="bg-error-600 hover:bg-error-700">
                                                    Retry Payment
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">💳</div>
                            <div className="text-secondary-600">No payment history yet</div>
                            <div className="text-sm text-secondary-500 mt-1">
                                Your payment history will appear here once you make payments
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Project Cost Breakdown */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                        💰 Project Cost Breakdown
                    </h2>

                    {projects.filter(p => ['confirmed', 'in_progress', 'in_design', 'review'].includes(p.status)).length > 0 ? (
                        <div className="space-y-4">
                            {projects
                                .filter(p => ['confirmed', 'in_progress', 'in_design', 'review'].includes(p.status))
                                .map((project) => {
                                    const baseAmount = project.price || 0;
                                    const gst = baseAmount * 0.05; // 5% GST
                                    const qst = baseAmount * 0.09975; // 9.975% QST
                                    const totalWithTax = baseAmount + gst + qst;

                                    return (
                                        <div
                                            key={project.id}
                                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                        >
                                            <div className="font-medium text-secondary-900 mb-3">
                                                {project.title}
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-secondary-600">Base Amount:</span>
                                                    <span className="font-medium">{formatCurrency(baseAmount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-secondary-600">GST (5%):</span>
                                                    <span className="font-medium">{formatCurrency(gst)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-secondary-600">QST (9.975%):</span>
                                                    <span className="font-medium">{formatCurrency(qst)}</span>
                                                </div>
                                                <hr className="border-gray-300" />
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span className="text-secondary-900">Total Amount:</span>
                                                    <span className="text-blue-600">{formatCurrency(totalWithTax)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">📊</div>
                            <div className="text-secondary-600">
                                No active projects to display costs for
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Project Payments */}
            <motion.div variants={fadeInUp}>
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                        💳 Project Payments
                    </h2>

                    {(() => {
                        const activeProjects = projects.filter(p => {
                            // Include projects that are not completed
                            if (!['confirmed', 'in_progress', 'in_design', 'review'].includes(p.status)) {
                                return false;
                            }

                            // Check if final payment is already made
                            const hasFinalPayment = payments.some(payment =>
                                payment.project_id === p.id &&
                                payment.payment_type === 'final' &&
                                payment.status === 'succeeded'
                            );

                            // Only show projects that haven't completed final payment
                            return !hasFinalPayment;
                        });

                        return activeProjects.length > 0 ? (
                            <div className="space-y-4">
                                {activeProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="font-medium text-secondary-900">
                                                    {project.title}
                                                </div>
                                                <div className="text-sm text-secondary-600">
                                                    {(() => {
                                                        const hasInitialPayment = payments.some(p =>
                                                            p.project_id === project.id &&
                                                            p.payment_type === 'initial' &&
                                                            p.status === 'succeeded'
                                                        );
                                                        const hasFinalPayment = payments.some(p =>
                                                            p.project_id === project.id &&
                                                            p.payment_type === 'final' &&
                                                            p.status === 'succeeded'
                                                        );

                                                        if (hasFinalPayment) {
                                                            return 'All payments complete ✅';
                                                        } else if (hasInitialPayment) {
                                                            return 'Initial payment complete - Final payment pending';
                                                        } else {
                                                            return 'Project confirmed - Ready for payment';
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-blue-700">
                                                    {(() => {
                                                        const baseAmount = project.price || 0;
                                                        const gst = baseAmount * 0.05;
                                                        const qst = baseAmount * 0.09975;
                                                        const totalWithTax = baseAmount + gst + qst;
                                                        return formatCurrency(totalWithTax);
                                                    })()}
                                                </div>
                                                <div className="text-sm text-blue-600">
                                                    Total Amount
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            {(() => {
                                                const baseAmount = project.price || 0;
                                                const gst = baseAmount * 0.05;
                                                const qst = baseAmount * 0.09975;
                                                const totalWithTax = baseAmount + gst + qst;
                                                const partialAmount = Math.round(totalWithTax * 0.3 * 100); // Convert to cents
                                                const remainingAmount = Math.round(totalWithTax * 0.7 * 100); // Convert to cents
                                                const fullAmount = Math.round(totalWithTax * 100); // Convert to cents

                                                // Check if initial payment has been made
                                                const hasInitialPayment = payments.some(p =>
                                                    p.project_id === project.id &&
                                                    p.payment_type === 'initial' &&
                                                    p.status === 'succeeded'
                                                );

                                                const hasFinalPayment = payments.some(p =>
                                                    p.project_id === project.id &&
                                                    p.payment_type === 'final' &&
                                                    p.status === 'succeeded'
                                                );

                                                // Debug logging
                                                console.log(`Project ${project.id} payment status:`, {
                                                    hasInitialPayment,
                                                    hasFinalPayment,
                                                    projectStatus: project.status,
                                                    payments: payments.filter(p => p.project_id === project.id),
                                                    amounts: { partialAmount, remainingAmount, fullAmount }
                                                });

                                                if (hasFinalPayment) {
                                                    return (
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                                            <span className="text-green-800 font-medium">✅ Payment Complete</span>
                                                        </div>
                                                    );
                                                }

                                                if (hasInitialPayment) {
                                                    // Show remaining payment button only
                                                    return (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    console.log('Remaining Payment button clicked for project:', project.title);
                                                                    setSelectedProject({ ...project, paymentType: 'full' });
                                                                    setShowPaymentModal(true);
                                                                }}
                                                                className="bg-purple-600 hover:bg-purple-700 flex-1"
                                                            >
                                                                Pay Remaining 70% ({formatCurrency(remainingAmount / 100)})
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                disabled
                                                                className="bg-gray-300 text-gray-500 flex-1 cursor-not-allowed"
                                                            >
                                                                Initial Payment Complete ✅
                                                            </Button>
                                                        </>
                                                    );
                                                } else {
                                                    // Show both initial and full payment options
                                                    return (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    console.log('30% Payment button clicked for project:', project.title);
                                                                    setSelectedProject({ ...project, paymentType: 'partial' });
                                                                    setShowPaymentModal(true);
                                                                    console.log('Modal state set to true');
                                                                }}
                                                                className="bg-blue-600 hover:bg-blue-700 flex-1"
                                                            >
                                                                Pay 30% Now ({formatCurrency(partialAmount / 100)})
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    console.log('Full Payment button clicked for project:', project.title);
                                                                    setSelectedProject({ ...project, paymentType: 'full' });
                                                                    setShowPaymentModal(true);
                                                                    console.log('Modal state set to true');
                                                                }}
                                                                className="bg-green-600 hover:bg-green-700 flex-1"
                                                            >
                                                                Pay Full Amount ({formatCurrency(fullAmount / 100)})
                                                            </Button>
                                                        </>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-2">💳</div>
                                <div className="text-secondary-600">
                                    No active projects requiring payment
                                </div>
                                <div className="text-sm text-secondary-500 mt-1">
                                    Payments will appear here for confirmed projects that need payment
                                </div>
                            </div>
                        );
                    })()}
                </Card>
            </motion.div>



            {/* Payment Modal */}
            <PaymentModal
                project={selectedProject}
                isOpen={showPaymentModal}
                paymentAmount={(() => {
                    if (!selectedProject) return 0;
                    const baseAmount = selectedProject.price || 0;
                    const gst = baseAmount * 0.05;
                    const qst = baseAmount * 0.09975;
                    const totalWithTax = baseAmount + gst + qst;

                    // Check if initial payment was already made
                    const hasInitialPayment = payments.some(p =>
                        p.project_id === selectedProject.id &&
                        p.payment_type === 'initial' &&
                        p.status === 'succeeded'
                    );

                    if (selectedProject.paymentType === 'partial') {
                        // 30% initial payment
                        return Math.round(totalWithTax * 0.3 * 100); // Convert to cents
                    } else if (hasInitialPayment) {
                        // 70% remaining payment
                        return Math.round(totalWithTax * 0.7 * 100); // Convert to cents
                    } else {
                        // Full payment
                        return Math.round(totalWithTax * 100); // Convert to cents
                    }
                })()}
                paymentType={(() => {
                    if (!selectedProject) return 'final';

                    // Check if initial payment was already made
                    const hasInitialPayment = payments.some(p =>
                        p.project_id === selectedProject.id &&
                        p.payment_type === 'initial' &&
                        p.status === 'succeeded'
                    );

                    if (selectedProject.paymentType === 'partial') {
                        return 'initial'; // 30% payment
                    } else if (hasInitialPayment) {
                        return 'final'; // Remaining 70% payment
                    } else {
                        return 'final'; // Full payment
                    }
                })()}
                onClose={() => {
                    setShowPaymentModal(false);
                    setSelectedProject(null);
                }}
            />
        </motion.div>
    );
};