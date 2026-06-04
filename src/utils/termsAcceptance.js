const TERMS_STORAGE_KEY = 'ml_termsAcceptedByUser';

export function resolveActiveUserType() {
    const adminUserType = localStorage.getItem('adminUserType');
    if (adminUserType === 'training-provider') return 'training-provider';
    if (adminUserType === 'recruiter') return 'recruiter';

    const userType = localStorage.getItem('userType');
    if (userType === 'recruiter' || userType === 'training-provider') return userType;

    return 'professional';
}

export function getTermsUserKey() {
    const userType = resolveActiveUserType();
    let profile = null;

    try {
        const raw = localStorage.getItem('userProfile');
        if (raw) profile = JSON.parse(raw);
    } catch {
        profile = null;
    }

    const id =
        profile?.id ||
        profile?.professionalId ||
        profile?.recruiterId ||
        profile?._id ||
        localStorage.getItem('professionalId') ||
        localStorage.getItem('recruiterId') ||
        localStorage.getItem('trainingProviderId');

    const email = profile?.email || localStorage.getItem('userEmail');
    return `${userType}:${id || email || 'anonymous'}`;
}

function readTermsStore() {
    try {
        const raw = localStorage.getItem(TERMS_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

export function hasAcceptedTermsLocally() {
    const store = readTermsStore();
    return store[getTermsUserKey()] === true;
}

export function markTermsAcceptedLocally() {
    const store = readTermsStore();
    store[getTermsUserKey()] = true;
    localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(store));
}

export function profileIndicatesTermsAccepted(profile) {
    if (!profile || typeof profile !== 'object') return false;
    return profile.agreedToTerms === true || profile.termsAccepted === true;
}

export function syncTermsAcceptedFromProfile(profile) {
    if (profileIndicatesTermsAccepted(profile)) {
        markTermsAcceptedLocally();
        return true;
    }
    return false;
}
