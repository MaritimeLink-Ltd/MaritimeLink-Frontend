import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

const TRIAL_DAYS = 90;

/**
 * Floating card on the subscription pages, two states:
 *  - Not yet subscribed: a promo nudge advertising the 90-day free trial
 *    (checkout is created with `trial_period_days: 90`, so this is a real
 *    claim about what happens if they upgrade, not just marketing copy).
 *  - Already subscribed and still inside the trial window: a countdown to
 *    when the card is actually charged. Renders nothing once the trial has
 *    lapsed — Stripe's own billing/dunning takes over from there.
 */
const TrialCountdownCard = ({ isTrialTier, subscriptionStartedAt, showPromoWhenFree }) => {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;

    let title;
    let subtitle;

    if (isTrialTier && subscriptionStartedAt) {
        const startedAt = new Date(subscriptionStartedAt);
        if (Number.isNaN(startedAt.getTime())) return null;

        const trialEndsAt = new Date(startedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
        const daysLeft = Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        if (daysLeft <= 0) return null;

        title = `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial`;
        subtitle = `No charge until ${trialEndsAt.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })}.`;
    } else if (showPromoWhenFree) {
        title = 'First 90 days free';
        subtitle = 'Upgrade below — you won\'t be charged until the trial ends.';
    } else {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-sm rounded-2xl border border-blue-100 bg-white shadow-xl p-4">
            <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
                <X size={16} />
            </button>
            <div className="flex items-start gap-3 pr-4">
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <Sparkles size={18} className="text-blue-600" />
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-900">{title}</div>
                    <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
                </div>
            </div>
        </div>
    );
};

export default TrialCountdownCard;
