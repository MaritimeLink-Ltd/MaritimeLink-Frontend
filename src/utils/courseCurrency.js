/** Default currency for maritime training courses across create, edit, booking, and detail flows. */
export const DEFAULT_COURSE_CURRENCY = 'GBP';

export const COURSE_PRICE_FIELD_LABEL = 'Course Price | GBP';

export function normalizeCourseCurrency(currency) {
    const value = String(currency || '').trim().toUpperCase();
    if (value === 'GBP' || value === 'USD' || value === 'EUR') return value;
    return DEFAULT_COURSE_CURRENCY;
}

export function getCourseCurrencySymbol(currency = DEFAULT_COURSE_CURRENCY) {
    const code = normalizeCourseCurrency(currency);
    if (code === 'GBP') return '£';
    if (code === 'USD') return '$';
    if (code === 'EUR') return '€';
    return '£';
}

/** e.g. £750 */
export function formatCoursePrice(amount, currency = DEFAULT_COURSE_CURRENCY) {
    const symbol = getCourseCurrencySymbol(currency);
    if (amount == null || amount === '') return `${symbol}—`;
    const num = Number(amount);
    if (Number.isNaN(num)) return `${symbol}${amount}`;
    return `${symbol}${num.toLocaleString('en-GB')}`;
}

/** e.g. GBP 750 — used in professional browse/booking lists */
export function formatCoursePriceWithCode(amount, currency = DEFAULT_COURSE_CURRENCY) {
    const code = normalizeCourseCurrency(currency);
    if (amount == null || amount === '') return `${code} —`;
    return `${code} ${amount}`;
}
