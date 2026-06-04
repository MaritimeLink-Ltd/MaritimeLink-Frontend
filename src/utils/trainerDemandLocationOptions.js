import { COUNTRY_NAMES } from './countries';

/** All countries from countires.json for demand / expiring-certificate location filters. */
export function buildCountryLocationFilterOptions() {
    return [
        { value: 'all', label: 'All Locations' },
        ...COUNTRY_NAMES.map((name) => ({ value: name, label: name })),
    ];
}

/** @deprecated Prefer buildCountryLocationFilterOptions — kept for API-driven lists. */
export function buildLocationFilterOptions(regions = []) {
    const values = new Set();
    (Array.isArray(regions) ? regions : []).forEach((r) => {
        const v = String(r || '').trim();
        if (v) values.add(v);
    });
    if (values.size === 0) {
        return buildCountryLocationFilterOptions();
    }
    return [
        { value: 'all', label: 'All Locations' },
        ...[...values].sort((a, b) => a.localeCompare(b)).map((name) => ({
            value: name,
            label: name,
        })),
    ];
}

export function deriveLocationsFromRenewalRows(rows = []) {
    const values = new Set();
    (Array.isArray(rows) ? rows : []).forEach((row) => {
        const raw = row?.locations ?? row?.location ?? '';
        String(raw)
            .split(/[,;|/]/)
            .map((part) => part.trim())
            .filter(Boolean)
            .forEach((part) => values.add(part));
    });
    return [...values];
}

export function filterRenewalRowsByLocation(rows = [], location = 'all') {
    if (!location || location === 'all') {
        return Array.isArray(rows) ? rows : [];
    }
    const needle = String(location).trim().toLowerCase();
    return (Array.isArray(rows) ? rows : []).filter((row) => {
        const haystack = String(row?.locations ?? row?.location ?? '').toLowerCase();
        return haystack.includes(needle);
    });
}
