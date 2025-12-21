import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
    amount,
    onSuccess,
    onCancel
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setError('Card element not found');
            setProcessing(false);
            return;
        }

        try {
            // Create payment method
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (stripeError) {
                setError(stripeError.message || 'Payment failed');
                setProcessing(false);
                return;
            }

            // In test mode, we'll simulate success
            // In production, you'd send paymentMethod.id to your backend
            console.log('Payment Method Created:', paymentMethod?.id);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call success callback
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Payment processing failed');
            setProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#212529',
                '::placeholder': {
                    color: '#6c757d',
                },
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            },
            invalid: {
                color: '#dc3545',
                iconColor: '#dc3545'
            }
        },
        hidePostalCode: false
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>
                💳 Pay Deposit
            </h3>
            <p style={{ margin: '0 0 24px', color: '#6c757d', fontSize: 14 }}>
                Complete your rental application by paying the deposit
            </p>

            {/* Amount Display */}
            <div style={{
                padding: 16,
                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
                border: '3px solid #d4af37',
                borderRadius: 12,
                marginBottom: 24,
                textAlign: 'center'
            }}>
                <div style={{ fontSize: 13, color: '#856404', marginBottom: 4, fontWeight: 600 }}>
                    Deposit Amount
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#212529' }}>
                    RM {amount.toFixed(2)}
                </div>
            </div>

            {/* Card Input */}
            <div style={{ marginBottom: 20 }}>
                <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: '#212529'
                }}>
                    Card Details
                </label>
                <div style={{
                    padding: 14,
                    border: '2px solid #dee2e6',
                    borderRadius: 8,
                    background: 'white'
                }}>
                    <CardElement options={cardElementOptions} />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: 12,
                    background: '#f8d7da',
                    border: '2px solid #dc3545',
                    borderRadius: 8,
                    color: '#721c24',
                    fontSize: 14,
                    marginBottom: 20
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    style={{
                        flex: 1,
                        padding: 14,
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: processing ? 'not-allowed' : 'pointer',
                        opacity: processing ? 0.6 : 1
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    style={{
                        flex: 2,
                        padding: 14,
                        background: processing
                            ? '#6c757d'
                            : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        color: 'white',
                        border: '3px solid #212529',
                        borderRadius: 8,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: !stripe || processing ? 'not-allowed' : 'pointer',
                        opacity: !stripe || processing ? 0.6 : 1
                    }}
                >
                    {processing ? '⏳ Processing...' : `💰 Pay RM ${amount.toFixed(2)}`}
                </button>
            </div>

            {/* Fine Print */}
            <p style={{
                marginTop: 16,
                fontSize: 12,
                color: '#6c757d',
                textAlign: 'center',
                lineHeight: 1.5
            }}>
                Your payment is secure and encrypted. This deposit will be held until move-in.
            </p>
        </form>
    );
};
