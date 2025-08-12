import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Modal } from '../common';
import type { Invoice } from '../../types/invoice';
import { fadeInUp } from '../../utils/motion';
import toast from 'react-hot-toast';

interface EmailTemplateProps {
    invoice: Invoice;
    dashboardUrl: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ invoice, dashboardUrl }) => {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailContent, setEmailContent] = useState('');

    const generateEmailContent = () => {
        const content = `Subject: Invoice ${invoice.invoiceNumber} - Your Website Project Quote

Dear ${invoice.clientName},

Thank you for choosing Websiter for your website development project! We're excited to work with you.

Please find attached your project invoice with the following details:

📋 PROJECT DETAILS:
• Invoice Number: ${invoice.invoiceNumber}
• Issue Date: ${invoice.issueDate.toLocaleDateString()}
• Due Date: ${invoice.dueDate.toLocaleDateString()}
• Total Amount: ${formatCurrency(invoice.total)}

💳 PAYMENT OPTIONS:
${invoice.paymentOptions.fullPayment ? `• Full Payment: ${formatCurrency(invoice.total)}` : ''}
${invoice.paymentOptions.partialPayment && invoice.paymentOptions.minimumPayment ?
                `• Partial Payment: Minimum ${formatCurrency(invoice.paymentOptions.minimumPayment)}` : ''}

🔗 NEXT STEPS:
1. Review your invoice and project details
2. Access your client dashboard: ${dashboardUrl}
3. Make your payment using your preferred method
4. We'll begin work immediately after payment confirmation

📞 QUESTIONS?
If you have any questions about your invoice or project, please don't hesitate to reach out:
• Email: support@websiter.click
• Dashboard: ${dashboardUrl}

We look forward to creating an amazing website for you!

Best regards,
The Websiter Team
websiter.click

---
${invoice.terms}`;

        setEmailContent(content);
        setShowEmailModal(true);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(emailContent);
            toast.success('Email content copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy to clipboard');
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
            <Button
                onClick={generateEmailContent}
                variant="outline"
                className="flex items-center space-x-2"
            >
                <span>📧</span>
                <span>Generate Email</span>
            </Button>

            <Modal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                title="Email Template"
                size="lg"
            >
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="space-y-4"
                >
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <span className="text-yellow-600">⚠️</span>
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium">Manual Email Instructions:</p>
                                <ol className="mt-2 list-decimal list-inside space-y-1">
                                    <li>Copy the email content below</li>
                                    <li>Open your email client (Gmail, Outlook, etc.)</li>
                                    <li>Create a new email to: <strong>{invoice.clientEmail}</strong></li>
                                    <li>Paste the content and send</li>
                                    <li>Mark invoice as "Sent" in the admin dashboard</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Content (Ready to Copy & Paste)
                        </label>
                        <textarea
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                            className="w-full h-96 p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Email content will appear here..."
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Client Information:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Name:</strong> {invoice.clientName}</div>
                            <div><strong>Email:</strong> {invoice.clientEmail}</div>
                            <div><strong>Dashboard URL:</strong> {dashboardUrl}</div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={() => setShowEmailModal(false)}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={copyToClipboard}
                            className="flex items-center space-x-2"
                        >
                            <span>📋</span>
                            <span>Copy to Clipboard</span>
                        </Button>
                    </div>
                </motion.div>
            </Modal>
        </>
    );
};