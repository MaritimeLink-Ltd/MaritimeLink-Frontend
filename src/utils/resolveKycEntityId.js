/**
 * Resolves the backend entity id for KYC uploads (professional / recruiter / training provider).
 * Tries localStorage keys, then userProfile JSON, then common JWT claims.
 */

function readJwtPayload() {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}

function firstId(...values) {
    for (const v of values) {
        if (v === undefined || v === null) continue;
        const s = typeof v === 'string' ? v.trim() : String(v).trim();
        if (s.length > 0) return s;
    }
    return null;
}

function readFromProfile(profile, keys) {
    if (!profile || typeof profile !== 'object') return null;
    const fromKeys = (obj) => firstId(...keys.map((k) => obj[k]));
    const direct = fromKeys(profile);
    if (direct) return direct;
    const nested = profile.recruiter || profile.trainingProvider || profile.user || profile.data;
    if (nested && typeof nested === 'object') return fromKeys(nested);
    return null;
}

const PROFESSIONAL_KEYS = ['professionalId', 'professional_id', 'userId', 'user_id', 'id'];
const RECRUITER_KEYS = ['recruiterId', 'recruiter_id', 'userId', 'user_id', 'id'];
const TRAINING_PROVIDER_KEYS = [
    'trainingProviderId',
    'training_provider_id',
    'trainerId',
    'trainer_id',
    'userId',
    'user_id',
    'id',
];

function resolveFromLocalStorageKeys(keys) {
    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) return value;
    }
    return null;
}

function parseUserProfile() {
    try {
        const raw = localStorage.getItem('userProfile');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/**
 * @param {'professional' | 'recruiter' | 'training-provider'} userType
 * @returns {string|null}
 */
export function resolveKycEntityId(userType) {
    const profile = parseUserProfile();
    const jwt = readJwtPayload();

    if (userType === 'recruiter') {
        return firstId(
            resolveFromLocalStorageKeys(RECRUITER_KEYS),
            readFromProfile(profile, ['id', 'recruiterId', '_id', 'userId']),
            jwt?.recruiterId,
            jwt?.recruiter_id,
            jwt?.sub,
            jwt?.userId,
            jwt?.id
        );
    }

    if (userType === 'training-provider') {
        return firstId(
            resolveFromLocalStorageKeys(TRAINING_PROVIDER_KEYS),
            localStorage.getItem('recruiterId'),
            readFromProfile(profile, [
                'trainingProviderId',
                'trainerId',
                'id',
                'recruiterId',
                '_id',
                'userId',
            ]),
            jwt?.trainingProviderId,
            jwt?.trainerId,
            jwt?.recruiterId,
            jwt?.sub,
            jwt?.userId,
            jwt?.id
        );
    }

    return firstId(
        resolveFromLocalStorageKeys(PROFESSIONAL_KEYS),
        readFromProfile(profile, ['professionalId', 'id', '_id', 'userId']),
        jwt?.professionalId,
        jwt?.sub,
        jwt?.userId,
        jwt?.id
    );
}

export default resolveKycEntityId;
