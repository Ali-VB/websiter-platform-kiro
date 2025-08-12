import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { previewInvoicePDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import {
    DocumentTextIcon,
    EyeIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import type { Database } from '../../types/database';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface ClientInvoiceModalProps {
    project: ProjectRow | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ClientInvoiceModal: React.FC<ClientInvoiceModalProps> = ({
    project,
    isOpen,
    onClose
}) => {
    if (!project) return null;

    // Mock invoice data - in a real app, this would come from the database
    const invoiceData = {
        invoiceNumber: `INV-${project.id.slice(-6).toUpperCase()}`,
        issueDate: new Date(project.created_at).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Thank you for choosing Websiter for your website development needs!',
        taxRate: 0,
    };

    // Transform project to match the expected Project type for PDF generation
    const projectForPDF = {
        id: project.id,
        title: project.title,
        description: project.description,
        clientName: 'You', // Will be replaced with actual client name in real implementation
        websiteType: 'business', // Default type
        features: [], // Will be populated from project data
        quote: {
            totalAmount: 1500, // Mock amount - would come from actual project data
        },
        status: project.status,
        priority: project.priority,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
    } as any;

    const handlePreviewInvoice = () => {
        try {
            previewInvoicePDF(projectForPDF, invoiceData);
            toast.success('Invoice preview opened in new window');
        } catch (error) {
            console.error('Error previewing invoice:', error);
            toast.error('Failed to preview invoice. Please contact support.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'blue';
            case 'in_progress':
                return 'yellow';
            case 'completed':
                return 'green';
            default:
                return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new':
                return 'New Project';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={true}>
            <div className="space-y-6 -m-6">
                {/* Header */}
                <div className="bg-white p-6 border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Project Invoice
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Invoice for {project.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6">
                    <div className="space-y-6">
                        {/* Invoice Summary */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-blue-900">Invoice #{invoiceData.invoiceNumber}</h3>
                                    <p className="text-sm text-blue-700">Generated for your project</p>
                                </div>
                                <Badge color={getStatusColor(project.status)} size="sm">
                                    {getStatusLabel(project.status)}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-700">Issue Date:</span>
                                    <div className="font-medium text-blue-900">{invoiceData.issueDate}</div>
                                </div>
                                <div>
                                    <span className="text-blue-700">Due Date:</span>
                                    <div className="font-medium text-blue-900">{invoiceData.dueDate}</div>
                                </div>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Project Details</h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Project:</span>
                                    <span className="ml-2 font-medium text-gray-900">{project.title}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Description:</span>
                                    <span className="ml-2 text-gray-900">{project.description}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Priority:</span>
                                    <span className="ml-2 font-medium text-gray-900 capitalize">{project.priority}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Created:</span>
                                    <span className="ml-2 text-gray-900">{new Date(project.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Amount */}
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-green-900">Total Amount</h4>
                                    <p className="text-sm text-green-700">Project development cost</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">
                                        ${projectForPDF.quote.totalAmount}
                                    </div>
                                    <div className="text-sm text-green-700">CAD</div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" />
                                <div>
                                    <h4 className="font-medium text-yellow-900">Payment Status</h4>
                                    <p className="text-sm text-yellow-700">
                                        {project.status === 'completed'
                                            ? 'Payment completed - Thank you!'
                                            : 'Payment will be processed upon project completion'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                            <div className="text-sm text-gray-700 space-y-1">
                                {project.status === 'new' && (
                                    <p>• Our team will begin working on your project shortly</p>
                                )}
                                {project.status === 'in_progress' && (
                                    <p>• Your project is currently in development</p>
                                )}
                                {project.status === 'completed' && (
                                    <p>• Your project has been completed and delivered</p>
                                )}
                                <p>• You can preview and download your invoice using the button below</p>
                                <p>• Contact support if you have any questions about your invoice</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t border-gray-200 sticky bottom-0 z-10">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>

                        <div className="flex items-center space-x-3">
                            <Button
                                variant="primary"
                                onClick={handlePreviewInvoice}
                                className="flex items-center space-x-2"
                            >
                                <EyeIcon className="w-4 h-4" />
                                <span>Preview Invoice</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};