const STORAGE_KEY = 'recruiterNotificationPreferences';

export const DEFAULT_RECRUITER_NOTIFICATION_PREFERENCES = {
    securityAlerts: true,
    newApplications: true,
    candidateMessages: true,
    jobPostings: true,
    marketing: false,
    desktopSounds: true,
    urgentAlerts: true,
};

export function readRecruiterNotificationPreferences() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_RECRUITER_NOTIFICATION_PREFERENCES };
        const parsed = JSON.parse(raw);
        return {
            ...DEFAULT_RECRUITER_NOTIFICATION_PREFERENCES,
            ...(parsed && typeof parsed === 'object' ? parsed : {}),
        };
    } catch {
        return { ...DEFAULT_RECRUITER_NOTIFICATION_PREFERENCES };
    }
}

export function syncRecruiterNotificationPreferences(preferences) {
    const next = {
        ...DEFAULT_RECRUITER_NOTIFICATION_PREFERENCES,
        ...(preferences && typeof preferences === 'object' ? preferences : {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(
        new CustomEvent('recruiterNotificationPreferencesUpdated', { detail: next }),
    );
    return next;
}
