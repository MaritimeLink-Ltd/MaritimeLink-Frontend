const AUTH_STORAGE_KEYS = [
    'authToken',
    'professionalId',
    'recruiterId',
    'trainingProviderId',
    'training_provider_id',
    'userProfile',
    'userRole',
    'userType',
    'adminUserType',
    'userEmail',
    'profileImage',
    'professionalVerificationStatus',
    'adminVerified',
    'recruiterStatus',
    'recruiterIsApproved',
    'recruiterKycStatus',
    'recruiterAdminVerified',
    'trainingProviderKycStatus',
    'trainingProviderAdminVerified',
];

const PUBLIC_PATH_PREFIXES = [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/otp-verification',
    '/admin/login',
    '/admin/forgot-password',
    '/agent/login',
    '/agent/signup',
    '/agent/forgot-password',
    '/agent/reset-password',
    '/training-provider/login',
    '/training-provider/forgot-password',
    '/training-provider/reset-password',
    '/recruiter/login',
];

export function parseJwtExpiryMs(token) {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const payload = JSON.parse(atob(padded));

        if (!payload || typeof payload.exp !== 'number') return null;
        return payload.exp * 1000;
    } catch {
        return null;
    }
}

export function isAuthTokenExpired(token) {
    const expiryMs = parseJwtExpiryMs(token);
    if (!expiryMs) return false;
    return Date.now() >= expiryMs;
}

export function clearAuthStorage() {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authTokenChanged'));
    }
}

export function getLoginRouteFromStorage(pathname = typeof window !== 'undefined' ? window.location.pathname : '') {
    const adminUserType = localStorage.getItem('adminUserType');
    const userType = localStorage.getItem('userType');

    if (adminUserType === 'admin' || userType === 'admin') return '/admin/login';
    if (adminUserType === 'training-provider' || userType === 'training-provider') return '/training-provider/login';
    if (adminUserType === 'recruiter' || userType === 'recruiter') return '/recruiter/login';

    // Fallback to route-based inference when role keys are missing/stale.
    if (pathname) {
        const recruiterPaths = [
            '/recruiter',
            '/agent',
            '/admin/search',
            '/admin/jobs',
            '/admin/chats',
            '/admin/settings',
            '/admin/upload-job',
            '/admin/job-created-success',
        ];
        const trainingProviderPaths = [
            '/training-provider',
            '/trainingprovider',
        ];

        if (recruiterPaths.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))) {
            return '/recruiter/login';
        }

        if (trainingProviderPaths.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))) {
            return '/training-provider/login';
        }

        if (pathname === '/admin/login' || pathname.startsWith('/admin-dashboard') || pathname.startsWith('/admin/marketplace') || pathname.startsWith('/admin/accounts') || pathname.startsWith('/admin/companies') || pathname.startsWith('/admin/compliance') || pathname.startsWith('/admin/operations') || pathname.startsWith('/admin/profile') || pathname.startsWith('/admin/notifications') || pathname.startsWith('/admin/transaction-history') || pathname.startsWith('/admin/platform-activity') || pathname.startsWith('/admin/flagged-accounts')) {
            return '/admin/login';
        }
    }

    return '/signin';
}

export function isPublicPath(pathname) {
    if (!pathname) return false;

    if (pathname === '/') return true;

    return PUBLIC_PATH_PREFIXES.some((prefix) =>
        prefix !== '/' && (pathname === prefix || pathname.startsWith(prefix + '/'))
    );
}

export function expireSessionAndRedirect(reason = 'Session expired. Please sign in again.') {
    const currentPath = window.location.pathname;
    const loginRoute = getLoginRouteFromStorage(currentPath);
    clearAuthStorage();

    if (!isPublicPath(currentPath) && currentPath !== loginRoute) {
        window.location.replace(loginRoute);
    }

    return reason;
}
