/**
 * Professionals use MaritimeLink free of charge for now — a client decision
 * (Oct 2026) for marketing, planned for one to two years. Recruiters and
 * training providers are unaffected.
 *
 * The backend creates every professional on the PRO tier (see the API's
 * config/professionalMembership.ts). Here, the professional side hides
 * everything that suggests a subscription: plans and prices, "Upgrade to
 * Premium" prompts, the Manage Subscription page and the premium crown
 * badges. Settings shows the list of features instead.
 *
 * The subscription code is all still in place: set this to false to bring
 * it back exactly as it was.
 */
export const PROFESSIONAL_SUBSCRIPTIONS_HIDDEN = true;
