import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Modal } from '../common';
import { InvoiceGenerator } from './InvoiceGenerator';
import { EmailTemplate } from './EmailTemplate';
import { InvoiceService } from '../../services/supabase/invoices';
import type { Invoice } from '../../types/invoice';
import { fadeInUp } from '../../utils/motion';
import toast from 'react-hot-toast';
import {
    DocumentTextIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ProjectInvoiceCardProps {
    project: any; // Project with website request data
    websiteRequest: any;
}

export const ProjectInvoiceCard: React.FC<ProjectInvoiceCardProps> = ({
    project,
    websiteRequest
}) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const dashboardUrl = `${window.location.origin}/dashboard`;

    useEffect(() => {
        loadInvoices();
    }, [project.id]);

    const loadInvoices = async () => {
        try {
            const projectInvoices = await InvoiceService.getInvoicesByProject(project.id);
            setInvoices(projectInvoices);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvoiceGenerated = (invoice: Invoice) => {
        setInvoices([invoice, ...invoices]);
        setShowInvoiceModal(false);
        toast.success('Invoice created successfully!');
    };

    const handleMarkAsSent = async (invoiceId: string) => {
        try {
            await InvoiceService.updateInvoiceStatus(invoiceId, 'sent');
            await loadInvoices();
            toast.success('Invoice marked as sent!');
        } catch (error) {
            console.error('Error updating invoice status:', error);
            toast.error('Failed to update invoice status');
        }
    };

    const handleMarkAsPaid = async (invoiceId: string) => {
        try {
            await InvoiceService.updateInvoiceStatus(invoiceId, 'paid');
            await loadInvoices();
            toast.success('Invoice marked as paid!');
        } catch (error) {
            console.error('Error updating invoice status:', error);
            toast.error('Failed to update invoice status');
        }
    };

    const getStatusIcon = (status: Invoice['status']) => {
        switch (status) {
            case 'draft':
                return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
            case 'sent':
                return <EnvelopeIcon className="w-4 h-4 text-blue-500" />;
            case 'paid':
                return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            case 'overdue':
                return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
            default:
                return <ClockIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: Invoice['status']) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'sent':
                return 'bg-blue-100 text-blue-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    };

    const latestInvoice = invoices[0];
    const hasInvoice = invoices.length > 0;

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Invoice Management</h3>
                {!hasInvoice && (
                    <Button
                        onClick={() => setShowInvoiceModal(true)}
                        size="sm"
                        className="flex items-center space-x-2"
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>Generate Invoice</span>
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : hasInvoice ? (
                <div className="space-y-4">
                    {/* Latest Invoice Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(latestInvoice.status)}
                                <span className="font-medium text-gray-900">
                                    Invoice #{latestInvoice.invoiceNumber}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(latestInvoice.status)}`}>
                                    {latestInvoice.status}
                                </span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                                {formatCurrency(latestInvoice.total)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Issue Date:</span>
                                <div>{latestInvoice.issueDate.toLocaleDateString()}</div>
                            </div>
                            <div>
                                <span className="font-medium">Due Date:</span>
                                <div>{latestInvoice.dueDate.toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Actions */}
                    <div className="flex flex-wrap gap-2">
                        {latestInvoice.status === 'draft' && (
                            <>
                                <EmailTemplate
                                    invoice={latestInvoice}
                                    dashboardUrl={dashboardUrl}
                                />
                                <Button
                                    onClick={() => handleMarkAsSent(latestInvoice.id)}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center space-x-2"
                                >
                                    <EnvelopeIcon className="w-4 h-4" />
                                    <span>Mark as Sent</span>
                                </Button>
                            </>
                        )}

                        {latestInvoice.status === 'sent' && (
                            <Button
                                onClick={() => handleMarkAsPaid(latestInvoice.id)}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>Mark as Paid</span>
                            </Button>
                        )}

                        {latestInvoice.status === 'paid' && (
                            <div className="flex items-center space-x-2 text-green-600 text-sm">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>Payment Received</span>
                                {latestInvoice.paidAt && (
                                    <span className="text-gray-500">
                                        on {latestInvoice.paidAt.toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* All Invoices List */}
                    {invoices.length > 1 && (
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">All Invoices</h4>
                            <div className="space-y-2">
                                {invoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(invoice.status)}
                                            <span>#{invoice.invoiceNumber}</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </div>
                                        <div className="font-medium">
                                            {formatCurrency(invoice.total)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No invoice generated yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Generate an invoice to send to the client
                    </p>
                </div>
            )}

            {/* Invoice Generation Modal */}
            <Modal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                title="Generate Invoice"
                size="lg"
            >
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                >
                    <InvoiceGenerator
                        projectId={project.id}
                        websiteRequest={websiteRequest}
                        onInvoiceGenerated={handleInvoiceGenerated}
                    />
                </motion.div>
            </Modal>
        </Card>
    );
};