/**
 * Stripe Payment Component
 * Handles Stripe Elements payment confirmation flow
 * Used after checkout API returns a clientSecret
 */

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Loader2, ShieldCheck } from 'lucide-react';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Inner payment form component - must be inside <Elements>
 */
const PaymentForm = ({ amount, currency, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/personal/training',
                },
                redirect: 'if_required'
            });

            if (error) {
                setPaymentError(error.message);
                if (onError) onError(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                if (onSuccess) onSuccess(paymentIntent);
            } else if (paymentIntent) {
                // Handle other statuses like 'processing'
                if (onSuccess) onSuccess(paymentIntent);
            }
        } catch (err) {
            const message = err.message || 'An unexpected error occurred.';
            setPaymentError(message);
            if (onError) onError(message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Element */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                    }}
                />
            </div>

            {/* Error Display */}
            {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {paymentError}
                </div>
            )}

            {/* Amount Summary */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount to pay</span>
                <span className="text-lg font-bold text-gray-900">{currency} {amount}</span>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck size={14} />
                <span>Payments are securely processed by Stripe</span>
            </div>

            {/* Pay Button */}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className={`w-full py-3.5 rounded-full text-white font-semibold text-base transition-colors min-h-[48px] flex items-center justify-center gap-2 ${
                    !stripe || isProcessing
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-[#003971] hover:bg-[#002b54] active:bg-[#001e3d]'
                }`}
            >
                {isProcessing ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    `Pay ${currency} ${amount}`
                )}
            </button>
        </form>
    );
};

/**
 * Stripe Payment Wrapper
 * Wraps PaymentForm with Stripe Elements provider
 * 
 * @param {string} clientSecret - The client secret from checkout API
 * @param {number} amount - Amount to display
 * @param {string} currency - Currency code (e.g., 'GBP')
 * @param {function} onSuccess - Called when payment succeeds
 * @param {function} onError - Called when payment fails
 * @param {function} onBack - Called when user clicks back
 */
const StripePayment = ({ clientSecret, amount, currency, onSuccess, onError, onBack }) => {
    if (!clientSecret) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-[#003971]" />
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#003971',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
                colorDanger: '#ef4444',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '12px',
            },
            rules: {
                '.Input': {
                    border: '1px solid #e5e7eb',
                    padding: '12px',
                    fontSize: '14px',
                },
                '.Input:focus': {
                    border: '1px solid #003971',
                    boxShadow: '0 0 0 2px rgba(0, 57, 113, 0.15)',
                },
                '.Label': {
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px',
                },
                '.Tab': {
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                },
                '.Tab--selected': {
                    borderColor: '#003971',
                    backgroundColor: 'rgba(0, 57, 113, 0.05)',
                },
            },
        },
    };

    return (
        <div className="space-y-4">
            {/* Back link */}
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="text-sm text-[#003971] hover:text-[#002855] font-medium"
                >
                    ← Back to booking details
                </button>
            )}

            <h3 className="text-lg font-semibold text-gray-800 mb-1">Complete Payment</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your payment details below to complete the booking.</p>

            <Elements stripe={stripePromise} options={options}>
                <PaymentForm
                    amount={amount}
                    currency={currency}
                    onSuccess={onSuccess}
                    onError={onError}
                />
            </Elements>
        </div>
    );
};

export default StripePayment;
