/**
 * Resuming an abandoned signup.
 *
 * Login rejects accounts that never finished the wizard with
 * `code: 'SIGNUP_INCOMPLETE'` and the step they stopped at. These helpers turn
 * that step into the route that continues the flow, and restore the little bit
 * of local state each step page expects, so the user picks up where they left
 * off instead of landing on a dashboard for a half-built account.
 *
 * Keep the step numbers in step with `src/utils/signupProgress.ts` on the API.
 */

/**
 * Pulls the resume payload out of a thrown request error.
 *
 * The API error body is `{ status, message, code, data }`, and httpClient hangs
 * that whole body off `error.data` — so the fields we need sit one level deeper
 * at `error.data.data`.
 *
 * @returns {{code: string|null, payload: object}}
 */
export function readSignupError(error) {
    const body = error?.data || {};
    return {
        code: body.code || null,
        payload: body.data || {},
    };
}

/** Wizard step -> the page that completes it (Recruiter / Training Agent). */
const RECRUITER_STEP_ROUTES = {
    2: '/agent/profile-completion',   // personal info + phone number
    3: '/agent/phone-verification',   // phone OTP
    4: '/agent/company-details',
    5: '/agent/compliance-declaration',
};

/** Wizard step -> the page that completes it (Professional). */
const PROFESSIONAL_STEP_ROUTES = {
    2: '/select-profession',
    3: '/upload-profile-photo',
};

/** The API's JobCategory enum -> the category page and its sessionStorage key. */
const PROFESSION_CATEGORIES = {
    OFFICER: { route: '/officer-category', professionType: 'officer' },
    RATINGS_AND_CREW: { route: '/ratings-category', professionType: 'ratings' },
    CATERING_AND_MEDICAL: { route: '/catering-medical-category', professionType: 'catering' },
};

/**
 * @param {object} data - the `data` block from the SIGNUP_INCOMPLETE error
 * @returns {string} route to continue the recruiter / training agent signup
 */
export function resumeRecruiterSignup(data = {}) {
    // The step pages read the account id from storage, and vary their copy by
    // whether this is a recruiter or a training provider.
    if (data.recruiterId) {
        localStorage.setItem('recruiterId', data.recruiterId);
    }
    if (data.role) {
        const userType = data.role === 'TRAINING_AGENT' ? 'training-provider' : 'recruiter';
        localStorage.setItem('userType', userType);
        localStorage.setItem('adminUserType', userType);
    }

    return RECRUITER_STEP_ROUTES[data.registrationStep] || RECRUITER_STEP_ROUTES[2];
}

/**
 * @param {object} data - the `data` block from the SIGNUP_INCOMPLETE error
 * @returns {string} route to continue the professional signup
 */
export function resumeProfessionalSignup(data = {}) {
    if (data.professionalId) {
        localStorage.setItem('professionalId', data.professionalId);
    }

    const category = PROFESSION_CATEGORIES[data.profession];
    if (category) {
        // Steps after profession selection read this from sessionStorage, which
        // is empty when the user returns in a new browser session.
        sessionStorage.setItem('professionType', category.professionType);
    }

    // Step 4 = photo uploaded, so what is left is picking a role, and that page
    // is specific to the profession chosen back at step 3.
    if (data.registrationStep >= 4) {
        return category?.route || PROFESSIONAL_STEP_ROUTES[2];
    }

    // Step 3 sends them to the photo upload, but only once a profession exists
    // to key it off — without one that page bounces straight back anyway.
    if (data.registrationStep === 3 && !category) {
        return PROFESSIONAL_STEP_ROUTES[2];
    }

    return PROFESSIONAL_STEP_ROUTES[data.registrationStep] || PROFESSIONAL_STEP_ROUTES[2];
}
