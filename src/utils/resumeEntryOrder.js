/**
 * Resume entries are listed newest first, the way a CV reads — a current
 * Third Engineer posting sits above a Trainee posting from ten years ago —
 * rather than in the order the user happened to type them in.
 *
 * Ordering is derived on display, so it stays correct no matter how entries
 * were added, edited, or loaded back from the API.
 */

const toTime = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
};

/**
 * Sort a list of resume entries newest first.
 *
 * Entries are ranked by `primaryKey` (when the entry starts — joining date,
 * date of issue, course start), falling back to `secondaryKey` when the
 * primary is blank. Entries with no usable date sink to the bottom, and ties
 * keep the order they were entered in.
 *
 * @param {Array<Object>} entries
 * @param {string} primaryKey
 * @param {string} [secondaryKey]
 * @returns {Array<Object>} a new, sorted array — the input is not mutated
 */
export const sortEntriesByDateDesc = (entries, primaryKey, secondaryKey) => {
    if (!Array.isArray(entries)) return [];

    const rank = (entry) => {
        const primary = toTime(entry?.[primaryKey]);
        if (primary !== null) return primary;
        return secondaryKey ? toTime(entry?.[secondaryKey]) : null;
    };

    return entries
        .map((entry, index) => ({ entry, index }))
        .sort((a, b) => {
            const aTime = rank(a.entry);
            const bTime = rank(b.entry);

            if (aTime === null && bTime === null) return a.index - b.index;
            if (aTime === null) return 1;
            if (bTime === null) return -1;
            if (aTime !== bTime) return bTime - aTime;
            return a.index - b.index;
        })
        .map(({ entry }) => entry);
};

/**
 * The date fields each resume list is ordered by, so the builder, the API
 * mapper and any future consumer all agree on what "newest" means.
 */
export const ENTRY_DATE_KEYS = {
    seaService: ['joiningDate', 'till'],
    license: ['dateOfIssue', 'validTill'],
    academic: ['startDate', 'endDate'],
    document: ['dateOfIssue', 'validTill'],
};

/** Convenience wrappers for the shapes the builder holds in state. */
export const sortSeaService = (entries) =>
    sortEntriesByDateDesc(entries, ...ENTRY_DATE_KEYS.seaService);
export const sortLicenses = (entries) =>
    sortEntriesByDateDesc(entries, ...ENTRY_DATE_KEYS.license);
export const sortAcademic = (entries) =>
    sortEntriesByDateDesc(entries, ...ENTRY_DATE_KEYS.academic);
export const sortDocuments = (entries) =>
    sortEntriesByDateDesc(entries, ...ENTRY_DATE_KEYS.document);
