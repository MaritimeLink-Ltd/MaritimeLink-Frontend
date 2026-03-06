const STORAGE_KEY = 'trainingProviderCourseSessions';

const COURSE_ID_ALIASES = {
    'STCW-BST-001': '1',
    '000001': '1',
    '000002': '2',
    '000003': '3'
};

const COURSE_TITLE_TO_ID = {
    'stcw basic safety': '1',
    'stcw basic safety training': '1',
    'advanced firefighting': '2',
    'medical first aid': '3',
    'bridge resource management': '4',
    'stcw refresher course': '5'
};

const DEFAULT_SESSION_MAP = {
    '1': [
        {
            id: 'sess-1',
            eventDate: '15 May 2024 - 17 May 2024',
            startTime: '09:00',
            endTime: '17:00',
            location: 'London, United Kingdom',
            instructor: 'Capt. Robert Fox',
            totalSeats: 20,
            bookedSeats: 14
        }
    ],
    '2': [
        {
            id: 'sess-2',
            eventDate: '22 May 2024 - 24 May 2024',
            startTime: '09:00',
            endTime: '17:00',
            location: 'Southampton, United Kingdom',
            instructor: 'Capt. Jane Cooper',
            totalSeats: 16,
            bookedSeats: 10
        }
    ]
};

function readMap() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SESSION_MAP));
            return DEFAULT_SESSION_MAP;
        }

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SESSION_MAP));
            return DEFAULT_SESSION_MAP;
        }

        return parsed;
    } catch {
        return DEFAULT_SESSION_MAP;
    }
}

function writeMap(sessionMap) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionMap));
}

export function resolveCourseKey(courseId, courseTitle = '') {
    const rawId = String(courseId || '').trim();
    if (rawId && COURSE_ID_ALIASES[rawId]) {
        return COURSE_ID_ALIASES[rawId];
    }

    if (/^\d+$/.test(rawId)) {
        return rawId;
    }

    const titleKey = String(courseTitle || '').trim().toLowerCase();
    if (titleKey && COURSE_TITLE_TO_ID[titleKey]) {
        return COURSE_TITLE_TO_ID[titleKey];
    }

    return rawId || '1';
}

export function getSessionsForCourse(courseId, courseTitle = '') {
    const sessionMap = readMap();
    const key = resolveCourseKey(courseId, courseTitle);
    return sessionMap[key] || [];
}

export function saveOrUpdateSession(courseId, sessionPayload, options = {}) {
    const { courseTitle = '', sessionId = null } = options;
    const sessionMap = readMap();
    const key = resolveCourseKey(courseId, courseTitle);
    const existing = sessionMap[key] || [];

    const payload = {
        id: sessionId || `sess-${Date.now()}`,
        eventDate: sessionPayload.eventDate || '',
        startTime: sessionPayload.startTime || '',
        endTime: sessionPayload.endTime || '',
        location: sessionPayload.location || '',
        instructor: sessionPayload.instructor || '',
        totalSeats: Number(sessionPayload.totalSeats) || 0,
        bookedSeats: Number(sessionPayload.bookedSeats) || 0
    };

    const updated = sessionId
        ? existing.map((item) => (item.id === sessionId ? { ...item, ...payload } : item))
        : [...existing, payload];

    sessionMap[key] = updated;
    writeMap(sessionMap);

    return updated;
}

export function getAvailableSpaces(session) {
    const totalSeats = Number(session.totalSeats) || 0;
    const bookedSeats = Number(session.bookedSeats) || 0;
    return Math.max(totalSeats - bookedSeats, 0);
}
