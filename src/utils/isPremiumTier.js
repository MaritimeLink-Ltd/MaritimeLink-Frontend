import { PROFESSIONAL_SUBSCRIPTIONS_HIDDEN } from '../constants/professionalMembership';

export function isPremiumTier(value) {
    const tier = String(value || '').trim().toUpperCase();
    return tier === 'PRO' || tier === 'PREMIUM' || tier === 'SUBSCRIBED';
}


/**
 * Premium check for a professional's features. While professionals are free
 * (constants/professionalMembership.js) every feature is open, so this never
 * sends anyone to an upgrade prompt — even before their tier has loaded.
 */
export function isProfessionalPremium(value) {
    return PROFESSIONAL_SUBSCRIPTIONS_HIDDEN || isPremiumTier(value);
}
