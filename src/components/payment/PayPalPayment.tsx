import React, { useState } from 'react';
import { Button } from '../common/Button';
import { StripePaymentService } from '../../services/stripe/payments';

interface PayPalPaymentProps {
    amount: number;
    currency: string;
    onSuccess: (result: any) => void;
    onError: (error: any) => void;
}

export const PayPalPayment: React.FC<PayPalPaymentProps> = ({
    amount,
    currency,
    onSuccess,
    onError,
}) => {
    const [loading, setLoading] = useState(false);

    const handlePayPalPayment = async () => {
        setLoading(true);

        try {
            // TODO: Implement PayPal SDK integration
            // For now, simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulate successful payment
            const mockResult = {
                id: `paypal_${Date.now()}`,
                status: 'completed',
                amount: amount,
                currency: currency,
                payment_method: 'paypal',
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
                    PayPal Payment
                </h4>

                <div className="p-6 border border-secondary-200 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="text-3xl">🅿️</div>
                        <div className="text-xl font-bold text-blue-600">PayPal</div>
                    </div>

                    <div className="text-center text-secondary-700 mb-6">
                        You'll be redirected to PayPal to complete your payment securely
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-secondary-700">Amount:</span>
                            <span className="font-bold text-secondary-900">
                                {StripePaymentService.formatAmount(amount, currency)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-700">Payment Method:</span>
                            <span className="text-secondary-900">PayPal</span>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                onClick={handlePayPalPayment}
                size="lg"
                loading={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
                {loading ? 'Redirecting to PayPal...' : `Pay with PayPal - ${StripePaymentService.formatAmount(amount, currency)}`}
            </Button>

            <div className="text-center text-sm text-secondary-500">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-yellow-700">
                        ⚠️ PayPal integration is coming soon. Please use Credit Card payment for now.
                    </div>
                </div>
            </div>
        </div>
    );
};