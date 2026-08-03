/**
 * Resume completion and submission state for professionals.
 *
 * The API has no "resume submitted" flag, and the percentage on its dashboard
 * overview is a different heuristic to the one the resume builder shows. So
 * completion is derived here, from the resume data itself, and shared by the
 * builder sidebar and the dashboard welcome screen — the two can never disagree.
 *
 * Submission is recorded per professional in localStorage, since nothing on the
 * server records that the user pressed Submit on the review step. A resume that
 * reaches 100% counts as submitted regardless, so clearing storage (or signing in
 * on another device) cannot push a finished profile back to the "keep building"
 * screen.
 */

const PROGRESS_STORAGE_KEY = 'resumeProgress';
const SUBMITTED_STORAGE_KEY = 'resumeSubmitted';

/** Profession -> the builder that owns that resume. */
const RESUME_BUILDER_PATHS = {
    officer: '/officer-dashboard',
    ratings: '/ratings-dashboard',
    catering: '/catering-medical-dashboard',
};

/** The API's JobCategory enum -> profession type used across the resume flow. */
const PROFESSION_TYPE_BY_JOB_CATEGORY = {
    OFFICER: 'officer',
    RATINGS_AND_CREW: 'ratings',
    CATERING_AND_MEDICAL: 'catering',
};

/** Aliases used by the resume preview (`userType`) for the same three professions. */
const PROFESSION_TYPE_ALIASES = {
    officer: 'officer',
    ratings: 'ratings',
    rating: 'ratings',
    catering: 'catering',
    medical: 'catering',
};

/**
 * Sections each builder walks the user through, in order. These mirror the
 * `sections` arrays in OfficerDashboard / RatingsDashboard / CateringMedicalDashboard
 * and key into their `allData` state — keep the three in step.
 */
export const RESUME_SECTIONS = {
    officer: [
        'personalInfo',
        'professionalSummary',
        'skills',
        'licensesEndorsements',
        'seaServiceLog',
        'academicQualifications',
        'medicalTravelDocs',
        'biometricsNextOfKin',
    ],
    ratings: [
        'personalInfo',
        'professionalSummary',
        'skills',
        'seaServiceLog',
        'academicQualifications',
        'medicalTravelDocs',
        'biometricsNextOfKin',
    ],
    catering: [
        'personalInfo',
        'professionalSummary',
        'skills',
        'professionalLicensesCertificates',
        'seaServiceLog',
        'academicQualifications',
        'medicalTravelDocs',
        'biometricsNextOfKin',
    ],
};

const hasEntries = (...lists) =>
    lists.some((list) => Array.isArray(list) && list.length > 0);

const hasText = (value) => Boolean(String(value ?? '').trim());

/**
 * Gender is excluded — the API mapper defaults it to 'Male', so it is filled in
 * even for a resume the user has never opened.
 */
const hasBiometrics = (biometricData = {}) =>
    [
        biometricData.height,
        biometricData.weight,
        biometricData.bmi,
        biometricData.eyeColor,
        biometricData.overallSize,
        biometricData.shoeSize,
    ].some(hasText);

/**
 * A section counts once it holds data the user actually entered. Each predicate
 * accepts both the builder's local shape and the shape `resumeService` maps API
 * responses into.
 */
const SECTION_HAS_DATA = {
    // Names alone are not enough: the API mapper backfills them from the signup
    // profile, so every resume would look part-complete before it is opened.
    personalInfo: (section = {}) =>
        hasText(section.firstName) && hasText(section.lastName) && hasText(section.dateOfBirth),
    professionalSummary: (section = {}) =>
        hasText(section.professionalSummary || section.summary),
    skills: (section = {}) => hasEntries(section.skills),
    licensesEndorsements: (section = {}) => hasEntries(section.licenses, section.endorsements),
    professionalLicensesCertificates: (section = {}) =>
        hasEntries(section.licenses, section.certificates),
    seaServiceLog: (section = {}) => hasEntries(section.seaServiceEntries, section.seaServiceLog),
    academicQualifications: (section = {}) =>
        hasEntries(
            section.academicQualifications,
            section.academic,
            section.stcwCertificates,
            section.stcw,
        ),
    medicalTravelDocs: (section = {}) =>
        hasEntries(section.medicalDocuments, section.medical, section.travelDocuments, section.travel),
    biometricsNextOfKin: (section = {}) =>
        hasBiometrics(section.biometricData) || hasEntries(section.nextOfKinList, section.refereesList),
};

/**
 * Normalise the many spellings of a profession into 'officer' | 'ratings' | 'catering'.
 * @param {string} value
 * @returns {string}
 */
export function normalizeProfessionType(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    return (
        PROFESSION_TYPE_BY_JOB_CATEGORY[raw.toUpperCase()] ||
        PROFESSION_TYPE_ALIASES[raw.toLowerCase()] ||
        ''
    );
}

/**
 * Which builder the signed-in professional belongs to. The category pages keep
 * `professionType` in sessionStorage; the stored profile is the fallback for a
 * fresh browser session.
 * @param {Object} [profile] - stored user profile
 * @returns {string} 'officer' | 'ratings' | 'catering'
 */
export function resolveProfessionType(profile = {}) {
    const fromSession =
        typeof window !== 'undefined' ? sessionStorage.getItem('professionType') : '';

    return (
        normalizeProfessionType(fromSession) ||
        normalizeProfessionType(profile?.profession) ||
        normalizeProfessionType(profile?.jobCategory) ||
        'officer'
    );
}

/**
 * @param {string} professionType
 * @returns {string} route of the resume builder for that profession
 */
export function getResumeBuilderPath(professionType) {
    return RESUME_BUILDER_PATHS[normalizeProfessionType(professionType)] || RESUME_BUILDER_PATHS.officer;
}

/**
 * Percentage of resume sections that hold data, rounded to a whole number.
 * @param {Object} allData - the builder's aggregated section state
 * @param {string} [professionType]
 * @returns {number} 0-100
 */
export function calculateResumeCompletion(allData = {}, professionType = 'officer') {
    const sections =
        RESUME_SECTIONS[normalizeProfessionType(professionType)] || RESUME_SECTIONS.officer;

    const completed = sections.filter((key) => {
        const hasData = SECTION_HAS_DATA[key];
        return typeof hasData === 'function' && hasData(allData?.[key] || {});
    }).length;

    return Math.min(100, Math.round((completed / sections.length) * 100));
}

/** Storage is scoped per professional so a shared browser never mixes two accounts. */
function scopedKey(base) {
    const id = typeof window !== 'undefined' ? localStorage.getItem('professionalId') : '';
    return id ? `${base}:${id}` : base;
}

/**
 * Progress last written by the resume builder — used to render the dashboard
 * welcome immediately, before the resume has been fetched back.
 * @returns {{percent: number|null, submitted: boolean}}
 */
export function readStoredResumeProgress() {
    if (typeof window === 'undefined') return { percent: null, submitted: false };

    const stored = localStorage.getItem(scopedKey(PROGRESS_STORAGE_KEY));
    const percent = stored === null ? null : Number(stored);

    return {
        percent: Number.isFinite(percent) ? percent : null,
        submitted: localStorage.getItem(scopedKey(SUBMITTED_STORAGE_KEY)) === 'true',
    };
}

/**
 * @param {number} percent
 * @param {{submitted?: boolean}} [options] - `submitted` is only ever set, never cleared:
 *   editing a submitted resume does not withdraw it from review.
 */
export function saveResumeProgress(percent, { submitted = false } = {}) {
    if (typeof window === 'undefined') return;

    if (Number.isFinite(percent)) {
        localStorage.setItem(scopedKey(PROGRESS_STORAGE_KEY), String(Math.round(percent)));
    }
    if (submitted) {
        localStorage.setItem(scopedKey(SUBMITTED_STORAGE_KEY), 'true');
    }
}

/**
 * Whether the dashboard should show "under review" rather than "keep building".
 * @param {{percent: number|null, submitted: boolean}} progress
 * @returns {boolean}
 */
export function isResumeSubmitted({ percent = null, submitted = false } = {}) {
    return Boolean(submitted) || (Number.isFinite(percent) && percent >= 100);
}
