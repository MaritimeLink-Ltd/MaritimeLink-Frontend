/**
 * Feature bullets shown per plan. Kept in sync with what is actually gated in
 * code (not Stripe product descriptions, which are free-text and easy to drift
 * from real behavior). Every paid planCode (BASIC/PRO/PREMIUM) unlocks the same
 * access today — `activateMembershipFromSession` always sets tier to `PRO`
 * regardless of which priced product was purchased — so they share one list.
 */
const FREE_HIGHLIGHTS = [
  'Personal dashboard',
  'Resume builder',
  'Document wallet — upload & manage maritime documents',
  'Apply to jobs (up to 10 active applications)',
  'Email support',
];

const PREMIUM_HIGHLIGHTS = [
  'Everything in Free, plus:',
  'Unlimited job applications',
  'Download your resume as a PDF',
  'Share your resume via a secure link',
  'Export your full document pack',
  'Secure document share links',
  'Priority visibility in recruiter search results',
  'Priority customer support',
];

const PLAN_HIGHLIGHTS = {
  FREE: FREE_HIGHLIGHTS,
  BASIC: PREMIUM_HIGHLIGHTS,
  PRO: PREMIUM_HIGHLIGHTS,
  PREMIUM: PREMIUM_HIGHLIGHTS,
};

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
