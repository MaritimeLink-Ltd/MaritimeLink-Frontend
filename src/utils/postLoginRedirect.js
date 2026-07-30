import { isLegalPath } from '../constants/legalRoutes';

export const RETURN_TO_PARAM = 'returnTo';

/**
 * Builds `<loginRoute>?returnTo=<path>` so a login screen can send the user back to
 * the page that turned them away instead of dropping them on their dashboard.
 */
export function withReturnTo(loginRoute, returnToPath) {
    if (!returnToPath) return loginRoute;
    return `${loginRoute}?${RETURN_TO_PARAM}=${encodeURIComponent(returnToPath)}`;
}

/**
 * Reads a validated `returnTo` destination from a login screen's query string.
 *
 * Only the legal policy pages are accepted. They are the only pages that hand out a
 * `returnTo`, and restricting the allow-list means a crafted link cannot use the login
 * screen to bounce someone to an arbitrary path (or off-site). Returns null when there
 * is nothing safe to return to, so callers fall back to their normal destination.
 *
 * @param {string} search - `location.search`
 * @returns {string|null}
 */
export function readReturnTo(search) {
    const raw = new URLSearchParams(search).get(RETURN_TO_PARAM);
    if (!raw) return null;

    // Reject anything that is not a plain in-app path ("//host" is protocol-relative).
    if (!raw.startsWith('/') || raw.startsWith('//')) return null;

    return isLegalPath(raw) ? raw : null;
}
