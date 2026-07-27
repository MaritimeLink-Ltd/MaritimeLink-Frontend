import { BadgeCheck } from 'lucide-react';

/**
 * Identity verification badge.
 *
 * Awarded only once a professional clears final-stage KYC review. This is deliberately
 * separate from Document Wallet compliance (certificate expiry tracking), which keeps
 * its own "Fully Compliant" indicator inside the Document Wallet section.
 *
 * Rendered as an icon rather than an image asset so it stays crisp at every size and
 * inherits colour from the surrounding theme.
 */
const SIZES = {
    sm: { wrap: 'px-2.5 py-1 text-xs gap-1.5', icon: 'h-3.5 w-3.5' },
    md: { wrap: 'px-4 py-2 text-sm gap-2', icon: 'h-4 w-4' },
};

export default function VerificationBadge({
    verified = false,
    size = 'md',
    label = 'Verified',
    showWhenUnverified = false,
    className = '',
}) {
    if (!verified && !showWhenUnverified) return null;

    const dims = SIZES[size] || SIZES.md;

    if (!verified) {
        return (
            <span
                title="This professional has not completed identity verification."
                className={`inline-flex items-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-bold ${dims.wrap} ${className}`.trim()}
            >
                <BadgeCheck className={dims.icon} />
                Not verified
            </span>
        );
    }

    return (
        <span
            title="Identity verified by MaritimeLink after KYC review."
            className={`inline-flex items-center rounded-full bg-[#1d9bf0] text-white font-bold whitespace-nowrap ${dims.wrap} ${className}`.trim()}
        >
            <BadgeCheck className={dims.icon} />
            {label}
        </span>
    );
}
