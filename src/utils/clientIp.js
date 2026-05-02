const STORAGE_KEY = 'maritime_client_ip';

let cachedIp = null;
let pendingIpPromise = null;

const isValidIp = (value) => {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    return Boolean(trimmed) && trimmed !== '::1' && trimmed !== '127.0.0.1' && trimmed !== 'localhost';
};

export const getClientIp = async () => {
    if (typeof window === 'undefined') return '';

    if (cachedIp && isValidIp(cachedIp)) {
        return cachedIp;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidIp(stored)) {
        cachedIp = stored.trim();
        return cachedIp;
    }

    if (!pendingIpPromise) {
        pendingIpPromise = (async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                const response = await fetch('https://api.ipify.org?format=json', {
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) return '';
                const data = await response.json();
                const ip = data?.ip?.trim?.() || '';
                if (isValidIp(ip)) {
                    cachedIp = ip;
                    localStorage.setItem(STORAGE_KEY, ip);
                    return ip;
                }
                return '';
            } catch {
                return '';
            } finally {
                pendingIpPromise = null;
            }
        })();
    }

    return pendingIpPromise;
};
