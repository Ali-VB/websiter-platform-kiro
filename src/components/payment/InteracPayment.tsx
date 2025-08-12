import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { StripePaymentService } from '../../services/stripe/payments';

interface InteracPaymentProps {
    amount: number;
    projectData: any;
    onSuccess: (result: any) => void;
    onError: (error: any) => void;
}

export const InteracPayment: React.FC<InteracPaymentProps> = ({
    amount,
    projectData,
    onSuccess,
    onError,
}) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');

    const handleInteracPayment = async () => {
        if (!email || !securityQuestion || !securityAnswer) {
            onError(new Error('Please fill in all required fields'));
            return;
        }

        setLoading(true);

        try {
            // TODO: Implement Interac e-Transfer processing
            // For now, simulate the process
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate successful submission
            const mockResult = {
                id: `interac_${Date.now()}`,
                status: 'pending_transfer',
                amount: amount,
                currency: 'CAD',
                payment_method: 'interac_etransfer',
                transfer_details: {
                    email,
                    securityQuestion,
                    reference: `WS-${projectData.id.slice(0, 8).toUpperCase()}`,
                },
            };

            onSuccess(mockResult);
        } catch (error) {
            onError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-medium text-secondary-900 mb-4">
                    Interac e-Transfer Payment
                </h4>

                <div className="p-6 border border-secondary-200 rounded-lg bg-gradient-to-br from-red-50 to-red-100">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="text-3xl">🇨🇦</div>
                        <div className="text-xl font-bold text-red-600">Interac e-Transfer</div>
                    </div>

                    <div className="text-center text-secondary-700 mb-6">
                        Send an Interac e-Transfer to complete your payment
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-red-200 mb-6">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-secondary-700">Amount:</span>
                                <span className="font-bold text-secondary-900">
                                    {StripePaymentService.formatAmount(amount, 'CAD')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-700">Send to:</span>
                                <span className="text-secondary-900 font-mono">payments@websiter.com</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-700">Reference:</span>
                                <span className="text-secondary-900 font-mono">
                                    WS-{projectData.id.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Your Email Address *
                    </label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                    />
                    <div className="text-xs text-secondary-500 mt-1">
                        We'll send payment confirmation to this email
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Security Question *
                    </label>
                    <Input
                        type="text"
                        value={securityQuestion}
                        onChange={(e) => setSecurityQuestion(e.target.value)}
                        placeholder="e.g., What is your favorite color?"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Security Answer *
                    </label>
                    <Input
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="Enter the answer to your security question"
                        required
                    />
                </div>
            </div>

            <Button
                onClick={handleInteracPayment}
                size="lg"
                loading={loading}
                disabled={!email || !securityQuestion || !securityAnswer}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
                {loading ? 'Processing...' : `Submit e-Transfer Details - ${StripePaymentService.formatAmount(amount, 'CAD')}`}
            </Button>

            <div className="text-center text-sm text-secondary-500">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-blue-700">
                        📧 After submitting, you'll receive instructions to send the e-Transfer
                    </div>
                </div>
            </div>
        </div>
    );
};