export const PLACEHOLDER_PROFILE_IMAGE = '/images/login-image.webp';

export function isPlaceholderProfilePhoto(url) {
    const value = String(url || '').trim();
    if (!value) return true;
    return (
        value === PLACEHOLDER_PROFILE_IMAGE
        || value.endsWith('/login-image.webp')
        || value.includes('images.unsplash.com')
        || value.includes('placehold.co')
    );
}

export function resolveProfilePhotoUrl({ profile = {}, savedPhoto = '' } = {}) {
    const candidates = [
        profile.profilePhotoUrl,
        profile.profilePhoto,
        profile.photo,
        savedPhoto,
    ];

    for (const candidate of candidates) {
        const url = String(candidate || '').trim();
        if (url && !isPlaceholderProfilePhoto(url)) {
            return url;
        }
    }

    return null;
}

/**
 * Display name for recruiter / training-provider header and welcome text.
 */
export function resolveRecruiterDisplayName(profile = {}, fallback = 'Recruiter') {
    const firstName = String(profile.firstName || '').trim();
    const lastName = String(profile.lastName || '').trim();
    const combined = [firstName, lastName].filter(Boolean).join(' ').trim();
    if (combined) return combined;

    const fullName = String(
        profile.fullName || profile.fullname || profile.name || '',
    ).trim();
    if (fullName) return fullName;

    const email = String(profile.email || '').trim();
    if (email) {
        const localPart = email.split('@')[0] || '';
        return localPart
            .replace(/[._-]+/g, ' ')
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }

    return fallback;
}

export function initialsFromName(name) {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return '?';
}

export function persistProfilePhotoCache(profilePhotoUrl) {
    if (typeof window === 'undefined') return null;

    const resolved = resolveProfilePhotoUrl({ profile: { profilePhotoUrl } });

    try {
        const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const nextProfile = {
            ...stored,
            profilePhotoUrl: resolved,
            profilePhoto: resolved,
            photo: resolved,
        };
        localStorage.setItem('userProfile', JSON.stringify(nextProfile));

        if (resolved) {
            localStorage.setItem('profileImage', resolved);
        } else {
            localStorage.removeItem('profileImage');
        }
    } catch (error) {
        console.error('Failed to persist profile photo cache:', error);
    }

    window.dispatchEvent(
        new CustomEvent('profileImageUpdated', { detail: { url: resolved } }),
    );

    return resolved;
}
