import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { downloadInvoicePDF, previewInvoicePDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import {

    DocumentTextIcon,
    ArrowDownTrayIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';
import type { Project } from '../../types';

interface InvoiceModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
    project,
    isOpen,
    onClose
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: `INV-${Date.now()}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        notes: 'Thank you for your business!',
        taxRate: 0, // 0% tax by default
    });

    if (!project) return null;

    const handleInputChange = (field: string, value: string | number) => {
        setInvoiceData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateSubtotal = () => {
        const baseAmount = project.price || 0;
        const featuresTotal = project.features?.reduce((sum: number, feature: any) => sum + (feature.price || 0), 0) || 0;
        return baseAmount + featuresTotal;
    };

    const calculateTax = () => {
        return calculateSubtotal() * (invoiceData.taxRate / 100);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleGenerateInvoice = async () => {
        setIsGenerating(true);
        try {
            toast.loading('Generating PDF invoice...', { id: 'invoice-generation' });

            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate and download PDF
            downloadInvoicePDF(project, invoiceData);

            // TODO: In a full implementation, also:
            // 1. Save invoice to database
            // 2. Send email to client
            // 3. Update project status

            console.log('Invoice generated for project:', project.id);
            console.log('Invoice data:', invoiceData);

            toast.success('Invoice PDF generated and downloaded successfully!', { id: 'invoice-generation' });

            // Close modal after successful generation
            onClose();
        } catch (error) {
            console.error('Error generating invoice:', error);
            toast.error('Failed to generate invoice PDF. Please try again.', { id: 'invoice-generation' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePreview = () => {
        try {
            // Generate and preview PDF in new window
            previewInvoicePDF(project, invoiceData);
            toast.success('Invoice preview opened in new window');
        } catch (error) {
            console.error('Error previewing invoice:', error);
            toast.error('Failed to preview invoice. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={true}>
            <div className="space-y-6 -m-6">
                {/* Header */}
                <div className="bg-white p-6 border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Generate Invoice
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Create invoice for {project.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6">
                    <div className="space-y-6">
                        {/* Invoice Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Invoice Number
                                </label>
                                <Input
                                    type="text"
                                    value={invoiceData.invoiceNumber}
                                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                    placeholder="INV-001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Issue Date
                                </label>
                                <Input
                                    type="date"
                                    value={invoiceData.issueDate}
                                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Due Date
                                </label>
                                <Input
                                    type="date"
                                    value={invoiceData.dueDate}
                                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tax Rate (%)
                                </label>
                                <Input
                                    type="number"
                                    value={invoiceData.taxRate}
                                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>
                        </div>

                        {/* Project Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Project Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Client:</span>
                                    <span className="ml-2 font-medium">{project.clientName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Project:</span>
                                    <span className="ml-2 font-medium">{project.title}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Status:</span>
                                    <Badge
                                        color={project.status === 'completed' ? 'green' : 'blue'}
                                        size="xs"
                                        className="ml-2"
                                    >
                                        {project.status}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-gray-600">Website Type:</span>
                                    <span className="ml-2 font-medium capitalize">{project.websiteType}</span>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Invoice Items</h4>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {project.title}
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {project.description}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                ${project.price || 0}
                                            </td>
                                        </tr>

                                        {project.features && project.features.map((feature: any, index: number) => (
                                            feature.price > 0 && (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {feature.name}
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Additional feature
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                        ${feature.price}
                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Invoice Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                {invoiceData.taxRate > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax ({invoiceData.taxRate}%):</span>
                                        <span className="font-medium">${calculateTax().toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-2">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={invoiceData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Add any additional notes or payment terms..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t border-gray-200 sticky bottom-0 z-10">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>

                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                className="flex items-center space-x-2"
                            >
                                <PrinterIcon className="w-4 h-4" />
                                <span>Preview</span>
                            </Button>

                            <Button
                                variant="primary"
                                onClick={handleGenerateInvoice}
                                loading={isGenerating}
                                disabled={isGenerating}
                                className="flex items-center space-x-2"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                <span>{isGenerating ? 'Generating...' : 'Generate & Download'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};