import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '../common/Button';
import { StripePaymentService } from '../../services/stripe/payments';

interface StripePaymentElementProps {
    onSuccess: (result: any) => void;
    onError: (error: any) => void;
    amount: number;
}

export const StripePaymentElement: React.FC<StripePaymentElementProps> = ({
    onSuccess,
    onError,
    amount,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string>('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/success`,
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error('Payment error:', error);
                setMessage(error.message || 'An unexpected error occurred.');
                onError(error);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('Payment succeeded:', paymentIntent);
                onSuccess(paymentIntent);
            } else {
                console.log('Payment status:', paymentIntent?.status);
                setMessage('Payment processing...');
            }
        } catch (error) {
            console.error('Payment submission error:', error);
            setMessage('Payment failed. Please try again.');
            onError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h4 className="text-lg font-medium text-secondary-900 mb-4">
                    Payment Details
                </h4>

                <div className="p-4 border border-secondary-200 rounded-lg bg-white">
                    <PaymentElement
                        options={{
                            layout: 'tabs',
                            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
                        }}
                    />
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('error') || message.includes('failed')
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                    {message}
                </div>
            )}

            <div className="flex flex-col space-y-4">
                <Button
                    type="submit"
                    size="lg"
                    loading={loading}
                    disabled={!stripe || loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                    {loading ? 'Processing...' : `Pay ${StripePaymentService.formatAmount(amount)}`}
                </Button>

                <div className="text-center text-sm text-secondary-500">
                    <div className="flex items-center justify-center space-x-4">
                        <span>🔒 SSL Encrypted</span>
                        <span>•</span>
                        <span>💳 All major cards accepted</span>
                        <span>•</span>
                        <span>🛡️ PCI Compliant</span>
                    </div>
                </div>
            </div>
        </form>
    );
};