function normalizeUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export function normalizeDomain(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    try {
        const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        return new URL(withProtocol).hostname.replace(/^www\./, '');
    } catch {
        return raw
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0]
            .split('?')[0];
    }
}

export function faviconUrl(website) {
    const domain = normalizeDomain(website);
    return domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : '';
}

/**
 * Resolve logo URL from API (may be relative or a broken hotlink). Always returns a usable URL.
 */
export function resolveCompanyLogoUrl(logo, website) {
    const fallback = faviconUrl(website);
    const raw = String(logo || '').trim();
    if (!raw) return fallback;

    if (/^https?:\/\//i.test(raw)) {
        return raw;
    }

    const base = normalizeUrl(website);
    if (!base) return fallback;

    try {
        const path = raw.startsWith('/') ? raw : `/${raw}`;
        return new URL(path, base).href;
    } catch {
        return fallback;
    }
}
