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
    Array.isArray(list) ? list.map((item) => ({ ...item, _persisted: true })) : [];

export const getUnpersisted = (list) =>
    Array.isArray(list) ? list.filter((item) => !item._persisted) : [];

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
