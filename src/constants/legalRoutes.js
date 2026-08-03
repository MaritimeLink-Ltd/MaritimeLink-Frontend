/**
 * The platform's legal policy pages.
 *
 * Single source of truth for the landing-page footer strip, the route guard that
 * keeps most of these pages members-only, and the post-login `returnTo` allow-list.
 *
 * `isPublic` marks the two policies anyone may read without an account — Terms &
 * Conditions and Privacy Policy. Visitors have to be able to read what they are
 * agreeing to before they sign up, so these are not gated. Everything else stays
 * members-only.
 *
 * `loginRoute` sends a signed-out visitor to the login screen that matches the
 * policy they asked for — someone opening "Recruiter Terms" belongs on the
 * recruiter login, not the professional one. Entries without it fall back to the
 * login route inferred from the current session (see getLoginRouteFromStorage).
 */
export const LEGAL_ROUTES = [
    { label: 'Privacy Policy', to: '/privacy', isPublic: true },
    { label: 'Terms & Conditions', to: '/terms', isPublic: true },
    { label: 'Cookie Policy', to: '/cookie-policy' },
    { label: 'Acceptable Use Policy', to: '/acceptable-use-policy' },
    { label: 'Recruiter Terms', to: '/recruiter-terms-of-service', loginRoute: '/recruiter/login' },
    {
        label: 'Training Provider Terms',
        to: '/training-provider-terms-of-service',
        loginRoute: '/training-provider/login',
    },
    { label: 'Professional User Terms', to: '/professional-user-terms-of-service', loginRoute: '/signin' },
    { label: 'Data Retention & Deletion', to: '/data-retention-secure-deletion-policy' },
    {
        label: 'Security & Vulnerability Disclosure',
        to: '/information-security-vulnerability-disclosure-policy',
    },
];

const LEGAL_PATHS = new Set(LEGAL_ROUTES.map((route) => route.to));

const PUBLIC_LEGAL_PATHS = new Set(
    LEGAL_ROUTES.filter((route) => route.isPublic).map((route) => route.to),
);

/** Whether a pathname is one of the legal policy pages. */
export function isLegalPath(pathname) {
    return LEGAL_PATHS.has(pathname);
}

/** Whether a legal page is readable without signing in. */
export function isPublicLegalPath(pathname) {
    return PUBLIC_LEGAL_PATHS.has(pathname);
}

/** The login screen a signed-out visitor should see for a given legal page. */
export function loginRouteForLegalPath(pathname) {
    return LEGAL_ROUTES.find((route) => route.to === pathname)?.loginRoute || null;
}
