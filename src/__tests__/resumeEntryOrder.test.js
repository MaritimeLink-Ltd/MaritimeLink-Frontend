import { describe, it, expect } from 'vitest';
import { sortSeaService, sortEntriesByDateDesc } from '../utils/resumeEntryOrder';
import { markPersisted, markEdited, getEdited, getUnpersisted, mergePendingDrafts } from '../utils/resumeStepSync';

/**
 * Entries read newest first, the way a CV does — the order they happened to be
 * typed in is not the order they belong in.
 */
describe('resume entry ordering', () => {
  it('puts a current posting above one from ten years ago, whatever the entry order', () => {
    const typedOldestLast = [
      { vesselName: 'Glen Sannox', role: 'Third Engineer', joiningDate: '2023-03-08', till: '2026-08-01' },
      { vesselName: 'Old Trader', role: 'Trainee', joiningDate: '2015-01-01', till: '2016-01-01' },
    ];
    const typedOldestFirst = [...typedOldestLast].reverse();

    expect(sortSeaService(typedOldestLast).map((e) => e.role)).toEqual(['Third Engineer', 'Trainee']);
    // Same result regardless of the order they were entered.
    expect(sortSeaService(typedOldestFirst).map((e) => e.role)).toEqual(['Third Engineer', 'Trainee']);
  });

  it('falls back to the end date when the start date is blank', () => {
    const sorted = sortEntriesByDateDesc(
      [
        { id: 'a', start: '', end: '2020-01-01' },
        { id: 'b', start: '2024-01-01', end: '' },
      ],
      'start',
      'end',
    );
    expect(sorted.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('sinks undated entries to the bottom, keeping their relative order', () => {
    const sorted = sortEntriesByDateDesc(
      [
        { id: 'no-date-1' },
        { id: 'dated', start: '2020-01-01' },
        { id: 'no-date-2' },
      ],
      'start',
    );
    expect(sorted.map((e) => e.id)).toEqual(['dated', 'no-date-1', 'no-date-2']);
  });

  it('does not mutate the list it is given', () => {
    const original = [
      { id: 'a', joiningDate: '2015-01-01' },
      { id: 'b', joiningDate: '2024-01-01' },
    ];
    sortSeaService(original);
    expect(original.map((e) => e.id)).toEqual(['a', 'b']);
  });
});

/**
 * A correction to an entry that already exists server-side has to be sent as an
 * update. Sending it as a new entry is precisely what would leave a duplicate
 * row behind — the failure the ordering work sits on top of.
 */
describe('editing existing entries', () => {
  it('marks only saved-and-edited entries for update, never new ones', () => {
    const list = [
      ...markPersisted([{ id: 'saved-untouched', name: 'A' }]),
      { id: 'brand-new', name: 'B' },
    ];
    const edited = markEdited(list[0]);
    const withEdit = [edited, list[1]];

    expect(getEdited(withEdit).map((e) => e.id)).toEqual(['saved-untouched']);
    // The new entry is still a create, not an update.
    expect(getUnpersisted(withEdit).map((e) => e.id)).toEqual(['brand-new']);
  });

  it('clears the edited flag once the entry has been saved', () => {
    const saved = markPersisted([markEdited({ id: 'x', _persisted: true, name: 'A' })]);
    expect(saved[0]._dirty).toBeUndefined();
    expect(getEdited(saved)).toEqual([]);
  });

  it('applies an in-flight correction in place rather than appending a copy', () => {
    const merged = mergePendingDrafts({
      seaServiceLog: {
        seaServiceEntries: [
          { id: 1, vesselName: 'Glen Sannox', role: 'Fourth Engineer' },
          { id: 2, vesselName: 'Old Trader', role: 'Trainee' },
        ],
        __edits: { seaServiceEntries: { id: 1, fields: { role: 'Third Engineer' } } },
      },
    });

    // Still two entries — the correction replaced, it did not duplicate.
    expect(merged.seaServiceLog.seaServiceEntries).toHaveLength(2);
    expect(merged.seaServiceLog.seaServiceEntries[0].role).toBe('Third Engineer');
    expect(merged.seaServiceLog.seaServiceEntries[1].role).toBe('Trainee');
    expect(merged.seaServiceLog.__edits).toBeUndefined();
  });

  it('applies an edit and appends a draft together without either clobbering the other', () => {
    const merged = mergePendingDrafts({
      seaServiceLog: {
        seaServiceEntries: [{ id: 1, role: 'Fourth Engineer' }],
        __edits: { seaServiceEntries: { id: 1, fields: { role: 'Third Engineer' } } },
        __drafts: { seaServiceEntries: { role: 'Second Engineer' } },
      },
    });

    expect(merged.seaServiceLog.seaServiceEntries.map((e) => e.role)).toEqual([
      'Third Engineer',
      'Second Engineer',
    ]);
  });
});
