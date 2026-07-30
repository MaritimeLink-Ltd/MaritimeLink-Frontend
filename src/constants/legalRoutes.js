/**
 * The platform's legal policy pages.
 *
 * Single source of truth for the landing-page footer strip, the route guard that
 * keeps these pages members-only, and the post-login `returnTo` allow-list.
 *
 * `loginRoute` sends a signed-out visitor to the login screen that matches the
 * policy they asked for — someone opening "Recruiter Terms" belongs on the
 * recruiter login, not the professional one. Entries without it fall back to the
 * login route inferred from the current session (see getLoginRouteFromStorage).
 */
export const LEGAL_ROUTES = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
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

/** Whether a pathname is one of the legal policy pages. */
export function isLegalPath(pathname) {
    return LEGAL_PATHS.has(pathname);
}

/** The login screen a signed-out visitor should see for a given legal page. */
export function loginRouteForLegalPath(pathname) {
    return LEGAL_ROUTES.find((route) => route.to === pathname)?.loginRoute || null;
}
