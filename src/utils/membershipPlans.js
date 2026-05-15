/** Default feature bullets when Stripe product has no description. */
const PLAN_HIGHLIGHTS = {
  FREE: [
    'Apply to jobs',
    'Basic profile visibility',
    'Email support',
  ],
  BASIC: [
    'Apply to jobs',
    'Basic profile visibility',
    'Email support',
  ],
  PRO: [
    'Everything in Basic',
    'Priority profile visibility',
    'Featured in searches',
    'Priority support',
  ],
  PREMIUM: [
    'Everything in Professional',
    'Top profile ranking',
    'Exclusive job opportunities',
    'Dedicated account manager',
    '24/7 priority support',
  ],
};

export function formatMembershipPrice(plan) {
  if (!plan || plan.price <= 0) return 'Free';
  const symbol =
    plan.currency === 'GBP' ? '£' : plan.currency === 'USD' ? '$' : plan.currency === 'EUR' ? '€' : '';
  return `${symbol}${Number(plan.price).toFixed(2)}`;
}

export function getPlanHighlights(plan) {
  if (plan?.description) {
    return plan.description
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return PLAN_HIGHLIGHTS[plan?.planCode] || PLAN_HIGHLIGHTS.PRO;
}

export function isMembershipPlanCurrent(plan, activeTier) {
  if (!plan) return false;
  if (plan.planCode === 'FREE' || plan.id === 'FREE') {
    return activeTier === 'FREE';
  }
  return activeTier === 'PRO';
}
