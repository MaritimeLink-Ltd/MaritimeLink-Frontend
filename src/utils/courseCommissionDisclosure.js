import { getTermsUserKey } from './termsAcceptance';

const STORAGE_KEY = 'ml_courseCommissionAcknowledged';

function readStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

export function hasAcknowledgedCourseCommission() {
    const store = readStore();
    return store[getTermsUserKey()] === true;
}

export function markCourseCommissionAcknowledged() {
    const store = readStore();
    store[getTermsUserKey()] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
