/**
 * Single contact mailbox for the whole platform.
 *
 * Consolidated from the previously separate compliance@/privacy@/legal@/security@
 * addresses so members, and the outbound emails the API sends, all point at one inbox.
 */
export const SUPPORT_EMAIL = 'admin@maritimelink.co';

export const SUPPORT_EMAIL_HREF = `mailto:${SUPPORT_EMAIL}`;
