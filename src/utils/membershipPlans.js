/**
 * Feature bullets shown per plan. Kept in sync with what is actually gated in
 * code (not Stripe product descriptions, which are free-text and easy to drift
 * from real behavior). Every paid planCode (BASIC/PRO/PREMIUM) unlocks the same
 * access today — `activateMembershipFromSession` always sets tier to `PRO`
 * regardless of which priced product was purchased — so they share one list.
 */
export const FREE_PLAN_HIGHLIGHTS = [
  'Personal Dashboard',
  'Professional Profile (Public)',
  'Resume Builder',
  'Document Wallet',
  'Upload and manage maritime documents',
  'Apply for unlimited jobs',
  'Browse and book training courses',
  'Receive and reply to recruiter messages',
  'Application tracking',
  'Certificate expiry reminders',
];

export const PREMIUM_PLAN_HIGHLIGHTS = [
  'Everything in Free Professional, plus:',
  'Share Secure Professional Profile Link',
  'Share resume via secure Link',
  'Download Resume (PDF)',
  'Share Secure Document Wallet Link',
  'Download document Pack',
  'Priority visibility in recruiter search results',
  'Priority Smart Candidate Matching',
  'Priority Customer Support',
];

const PLAN_HIGHLIGHTS = {
  FREE: FREE_PLAN_HIGHLIGHTS,
  BASIC: PREMIUM_PLAN_HIGHLIGHTS,
  PRO: PREMIUM_PLAN_HIGHLIGHTS,
  PREMIUM: PREMIUM_PLAN_HIGHLIGHTS,
};

export function isFreePlan(plan) {
  if (!plan) return false;
  return plan.planCode === 'FREE' || plan.id === 'FREE' || !(plan.price > 0);
}

/**
 * Card/header label for a plan. Stripe names the zero-price product "Free",
 * which reads as a duplicate next to the "Free" price, so free plans get a
 * single "Free Plan" label instead. Paid products are named "Maritime …" in
 * Stripe; the "Maritime" prefix is redundant inside the app, so it is dropped.
 */
export function formatMembershipPlanName(plan) {
  if (isFreePlan(plan)) return 'Free Plan';
  return (plan?.name || '').replace(/^Maritime\s+/i, '');
}

export function formatMembershipPrice(plan) {
  if (!plan || plan.price <= 0) return 'Free';
  const symbol =
    plan.currency === 'GBP' ? '£' : plan.currency === 'USD' ? '$' : plan.currency === 'EUR' ? '€' : '';
  return `${symbol}${Number(plan.price).toFixed(2)}`;
}

export function getPlanHighlights(plan) {
  return PLAN_HIGHLIGHTS[plan?.planCode] || PLAN_HIGHLIGHTS.PRO;
}

export function isMembershipPlanCurrent(plan, activeTier) {
  if (!plan) return false;
  if (plan.planCode === 'FREE' || plan.id === 'FREE') {
    return activeTier === 'FREE';
  }
  return activeTier === 'PRO';
}
