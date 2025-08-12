import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, Modal } from '../common';
import { InvoiceService } from '../../services/supabase/invoices';
import type { Invoice } from '../../types/invoice';
import { fadeInUp } from '../../utils/motion';
import toast from 'react-hot-toast';

interface InvoiceGeneratorProps {
    projectId: string;
    websiteRequest: any;
    onInvoiceGenerated: (invoice: Invoice) => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
    projectId,
    websiteRequest,
    onInvoiceGenerated
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleGeneratePreview = async () => {
        try {
            setIsGenerating(true);
            const invoiceData = await InvoiceService.generateInvoiceFromProject(projectId, websiteRequest);
            setPreviewInvoice(invoiceData);
            setShowPreview(true);
        } catch (error) {
            console.error('Error generating invoice preview:', error);
            toast.error('Failed to generate invoice preview');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreateInvoice = async () => {
        if (!previewInvoice) return;

        try {
            setIsGenerating(true);
            const invoice = await InvoiceService.createInvoice(previewInvoice);
            toast.success('Invoice created successfully!');
            onInvoiceGenerated(invoice);
            setShowPreview(false);
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error('Failed to create invoice');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    };

    return (
        <>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Invoice Generation</h3>
                    <Button
                        onClick={handleGeneratePreview}
                        disabled={isGenerating}
                        className="flex items-center space-x-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <span>📄</span>
                                <span>Generate Invoice</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Client:</span>
                        <span className="font-medium">{websiteRequest.users?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-medium">{websiteRequest.users?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Website Type:</span>
                        <span className="font-medium capitalize">{websiteRequest.website_type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Features:</span>
                        <span className="font-medium">{websiteRequest.features?.length || 0} selected</span>
                    </div>
                </div>
            </Card>

            {/* Invoice Preview Modal */}
            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Invoice Preview"
                size="lg"
            >
                {previewInvoice && (
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        className="space-y-6"
                    >
                        {/* Invoice Header */}
                        <div className="border-b border-gray-200 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                                    <p className="text-gray-600">#{previewInvoice.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-blue-600">websiter.click</div>
                                    <div className="text-sm text-gray-600">Professional Website Development</div>
                                </div>
                            </div>
                        </div>

                        {/* Client & Invoice Info */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                                <div className="text-gray-600">
                                    <div className="font-medium">{previewInvoice.clientName}</div>
                                    <div>{previewInvoice.clientEmail}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="space-y-1 text-sm">
                                    <div><span className="font-medium">Issue Date:</span> {previewInvoice.issueDate.toLocaleDateString()}</div>
                                    <div><span className="font-medium">Due Date:</span> {previewInvoice.dueDate.toLocaleDateString()}</div>
                                    <div><span className="font-medium">Status:</span> <span className="capitalize">{previewInvoice.status}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Qty</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Unit Price</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {previewInvoice.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Invoice Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(previewInvoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>HST ({(previewInvoice.taxRate * 100).toFixed(1)}%):</span>
                                    <span>{formatCurrency(previewInvoice.taxAmount)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                    <span>Total:</span>
                                    <span>{formatCurrency(previewInvoice.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Payment Options</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                {previewInvoice.paymentOptions.fullPayment && (
                                    <div>✓ Full payment: {formatCurrency(previewInvoice.total)}</div>
                                )}
                                {previewInvoice.paymentOptions.partialPayment && previewInvoice.paymentOptions.minimumPayment && (
                                    <div>✓ Partial payment (minimum {formatCurrency(previewInvoice.paymentOptions.minimumPayment)})</div>
                                )}
                            </div>
                        </div>

                        {/* Terms & Notes */}
                        {previewInvoice.terms && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                                <p className="text-sm text-gray-600">{previewInvoice.terms}</p>
                            </div>
                        )}

                        {previewInvoice.notes && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                                <p className="text-sm text-gray-600">{previewInvoice.notes}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={() => setShowPreview(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateInvoice}
                                disabled={isGenerating}
                                className="flex items-center space-x-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✓</span>
                                        <span>Create Invoice</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </Modal>
        </>
    );
};