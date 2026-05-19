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

/** Mirrors backend isRecruiterInAppNotificationEnabled for client-side filtering. */
export function isRecruiterInAppNotificationEnabled(notification, preferences) {
    const prefs = preferences || readRecruiterNotificationPreferences();
    const id = String(notification?.id || '');
    const severity = String(notification?.severity || notification?.type || '').toLowerCase();

    if (id === 'new-applications' || id === 'pending-bookings') {
        if (!prefs.newApplications) return false;
    } else if (
        id === 'zero-applicant-jobs' ||
        id === 'draft-jobs' ||
        id === 'courses-no-sessions' ||
        id.startsWith('expiring-') ||
        id.startsWith('capacity-')
    ) {
        if (!prefs.jobPostings) return false;
    } else if (id === 'recruiter-announcement' || id === 'trainer-announcement') {
        if (!prefs.marketing) return false;
    } else if (notification?.title === 'Recent Course Booking') {
        if (!prefs.newApplications) return false;
    } else if (id.includes('security') || notification?.type === 'security') {
        if (!prefs.securityAlerts) return false;
    } else if (
        id.includes('message') ||
        id.includes('chat') ||
        notification?.type === 'message' ||
        notification?.type === 'chat'
    ) {
        if (!prefs.candidateMessages) return false;
    }

    if (!prefs.urgentAlerts && (severity === 'warning' || severity === 'error')) {
        return false;
    }

    return true;
}

export function filterRecruiterInAppNotifications(notifications, preferences) {
    const list = Array.isArray(notifications) ? notifications : [];
    return list.filter((item) => isRecruiterInAppNotificationEnabled(item, preferences));
}

export function shouldNotifyCandidateMessages(preferences) {
    const prefs = preferences || readRecruiterNotificationPreferences();
    return prefs.candidateMessages !== false;
}

export function shouldPlayRecruiterDesktopSound(preferences) {
    const prefs = preferences || readRecruiterNotificationPreferences();
    return prefs.desktopSounds !== false;
}

let audioContext;

export function playRecruiterDesktopSound() {
    if (!shouldPlayRecruiterDesktopSound()) return;

    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        if (!audioContext) {
            audioContext = new AudioCtx();
        }
        if (audioContext.state === 'suspended') {
            void audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.36);
    } catch {
        /* ignore — autoplay may be blocked until user gesture */
    }
}
