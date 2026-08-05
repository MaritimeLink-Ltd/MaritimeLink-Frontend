/**
 * The resume wizard's step-by-step "add" endpoints (sea service, licenses,
 * education, STCW, medical/travel docs, next of kin, referees) always create
 * a new row — there is no upsert. Section components hold their *entire*
 * list locally and hand the whole thing back on "Next", so without this
 * guard, revisiting an already-saved step and continuing would re-POST
 * every existing entry and duplicate it in the database.
 *
 * Entries are tagged `_persisted: true` once they've been saved (either
 * loaded from an existing resume, or successfully POSTed this session), and
 * only untagged entries are sent to the backend on subsequent saves.
 */

export const markPersisted = (list) =>
    Array.isArray(list)
        // Saving settles any pending edit, so the dirty flag is cleared here
        // rather than left to accumulate and re-PUT on the next step.
        ? list.map(({ _dirty, ...item }) => ({ ...item, _persisted: true }))
        : [];

export const getUnpersisted = (list) =>
    Array.isArray(list) ? list.filter((item) => !item._persisted) : [];

/**
 * An entry that already exists server-side and has since been edited. These
 * need a PUT rather than a POST — sending them as new is what would turn a
 * correction into a duplicate row.
 */
export const markEdited = (entry) => ({ ...entry, _dirty: true });

export const getEdited = (list) =>
    Array.isArray(list) ? list.filter((item) => item._persisted && item._dirty) : [];

/**
 * The "add" endpoints return the real database id of the row they just
 * created. `submittedEntries` is the exact subset of `fullList` that was
 * just POSTed (in the same order), and `results` is the resolved response
 * for each of those POSTs — this stitches the real id back onto the
 * matching entry (matched by object reference) so it can later be deleted.
 * Entries not in `submittedEntries` (already-persisted ones) pass through
 * untouched.
 */
export const withCreatedIds = (fullList, submittedEntries, results) => {
    const idByEntry = new Map();
    submittedEntries.forEach((entry, index) => {
        const createdId = results[index]?.data?.id;
        if (createdId) idByEntry.set(entry, createdId);
    });

    return (Array.isArray(fullList) ? fullList : []).map((entry) =>
        idByEntry.has(entry) ? { ...entry, id: idByEntry.get(entry) } : entry
    );
};

/** Bookkeeping keys sections use to report uncommitted form state upwards. */
export const DRAFTS_KEY = '__drafts';
export const EDITS_KEY = '__edits';

/**
 * A section's form holds a typed-but-not-yet-added entry separately from its
 * committed list — "Next" folds that trailing entry in, but "Save & Continue
 * Later" serializes the dashboard's state directly and would otherwise drop
 * whatever the user had typed without pressing the section's Save button.
 *
 * Sections report such an entry (only once it validates) under `__drafts`,
 * keyed by the list it belongs to. An in-progress correction to an existing
 * entry is reported under `__edits` instead, as `{ id, fields }`, so it
 * replaces that entry rather than appending a second copy of it.
 *
 * This returns a copy of the builder's aggregate state with drafts appended,
 * edits applied, and both bookkeeping keys stripped back out.
 */
export const mergePendingDrafts = (allData) => {
    const merged = {};

    Object.entries(allData || {}).forEach(([sectionKey, section]) => {
        if (!section || typeof section !== 'object' || Array.isArray(section)) {
            merged[sectionKey] = section;
            return;
        }

        const { [DRAFTS_KEY]: drafts, [EDITS_KEY]: edits, ...rest } = section;

        Object.entries(edits || {}).forEach(([listKey, edit]) => {
            if (!edit || !Array.isArray(rest[listKey])) return;
            rest[listKey] = rest[listKey].map((item) =>
                item.id === edit.id ? { ...item, ...edit.fields } : item
            );
        });

        Object.entries(drafts || {}).forEach(([listKey, draft]) => {
            if (draft) rest[listKey] = [...(rest[listKey] || []), draft];
        });

        merged[sectionKey] = rest;
    });

    return merged;
};
