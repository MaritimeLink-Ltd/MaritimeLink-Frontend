export function isPremiumTier(value) {
    const tier = String(value || '').trim().toUpperCase();
    return tier === 'PRO' || tier === 'PREMIUM' || tier === 'SUBSCRIBED';
}

