const DISPLAY_OPTS = { day: 'numeric', month: 'short', year: 'numeric' };

/**
 * Formats API / ISO date strings for display (date only, no time).
 * e.g. "2026-11-09T00:00:00.000Z" → "9 Nov 2026"
 */
export function formatDisplayDate(value) {
  if (value == null || value === '') return '';

  const str = String(value).trim();
  if (!str) return '';

  const datePart = str.includes('T') ? str.split('T')[0] : str;
  const parsed = new Date(datePart.length === 10 ? `${datePart}T00:00:00` : datePart);

  if (Number.isNaN(parsed.getTime())) {
    return str;
  }

  return parsed.toLocaleDateString('en-GB', DISPLAY_OPTS);
}

/**
 * Formats a start/end date range for resume sections.
 */
export function formatDateRange(start, end) {
  if (!start && !end) return '';

  const s = formatDisplayDate(start);
  const e = end ? formatDisplayDate(end) : 'Till Date';

  return `${s}${s && e ? ' To ' : ''}${e}`.trim();
}
