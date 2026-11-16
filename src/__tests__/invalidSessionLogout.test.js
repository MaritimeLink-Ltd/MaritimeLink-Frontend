import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../utils/sessionManager', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        expireSessionAndRedirect: vi.fn(() => 'Your session has expired. Please sign in again.'),
    };
});
vi.mock('../utils/clientIp', () => ({ getClientIp: vi.fn(async () => null) }));

const { default: httpClient } = await import('../utils/httpClient');
const { expireSessionAndRedirect } = await import('../utils/sessionManager');

/** Unexpired token (exp one hour ahead) whose signature the server no longer accepts. */
const futureToken = () => {
    const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ id: 'x', exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
};

const respond = (status, body) =>
    vi.fn(async () => ({
        ok: status >= 200 && status < 300,
        status,
        headers: { get: () => 'application/json' },
        text: async () => JSON.stringify(body),
        json: async () => body,
    }));

describe('http client: server-rejected sessions', () => {
    beforeEach(() => {
        localStorage.setItem('authToken', futureToken());
        expireSessionAndRedirect.mockClear();
    });
    afterEach(() => {
        localStorage.clear();
        vi.unstubAllGlobals();
    });

    it('logs out when the API marks the session INVALID_SESSION (e.g. after a key rotation)', async () => {
        vi.stubGlobal('fetch', respond(401, { status: 'error', message: 'Your session is no longer valid. Please log in again.', code: 'INVALID_SESSION' }));
        await expect(httpClient.get('/api/professional/me')).rejects.toMatchObject({ status: 401 });
        expect(expireSessionAndRedirect).toHaveBeenCalledTimes(1);
    });

    it('keeps the session for a role-based 401 without that code (unchanged behaviour)', async () => {
        vi.stubGlobal('fetch', respond(401, { status: 'error', message: 'Not allowed for this role' }));
        await expect(httpClient.get('/api/admin/thing')).rejects.toMatchObject({ status: 401 });
        expect(expireSessionAndRedirect).not.toHaveBeenCalled();
    });

    it('logs a deactivated admin out straight away', async () => {
        vi.stubGlobal('fetch', respond(403, { status: 'error', message: 'This admin account has been deactivated.', code: 'ADMIN_ACCOUNT_DISABLED' }));
        await expect(httpClient.get('/api/admin/professionals')).rejects.toMatchObject({ status: 403 });
        expect(expireSessionAndRedirect).toHaveBeenCalledTimes(1);
    });

    it('keeps the session for an ordinary 403 (e.g. no access to money)', async () => {
        vi.stubGlobal('fetch', respond(403, { status: 'error', message: 'Your role does not have access to financial information.' }));
        await expect(httpClient.get('/api/admin/revenue')).rejects.toMatchObject({ status: 403 });
        expect(expireSessionAndRedirect).not.toHaveBeenCalled();
    });
});
