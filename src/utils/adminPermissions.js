import { useEffect, useState } from 'react';
import { parseJwtPayload } from './sessionManager';

/**
 * Platform admin role + what it allows, for showing/hiding admin UI.
 *
 * The API enforces the same rules on every request (and reads the role from
 * the database, so a role change applies immediately); this only keeps the
 * UI from offering things the person can't use.
 *
 * - SUPER_ADMIN: everything, including the Team page.
 * - OPERATIONS_MANAGER: everything except money (revenue, commission,
 *   payouts, transactions) and the Team page.
 * - ADMIN / MODERATOR (older accounts): unchanged — everything except Team.
 */

export const ADMIN_ROLE_STORAGE_KEY = 'adminRole';
const ROLE_EVENT = 'adminRoleChanged';

export const ADMIN_ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MODERATOR: 'Moderator',
    OPERATIONS_MANAGER: 'Team Member',
};

export const adminRoleLabel = (role) => ADMIN_ROLE_LABELS[role] || 'Admin';

export function getAdminRole() {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(ADMIN_ROLE_STORAGE_KEY);
        if (stored) return stored;
        // Sessions that started before roles were stored: the role is in the token.
        const payload = parseJwtPayload(localStorage.getItem('authToken'));
        return typeof payload?.role === 'string' ? payload.role : null;
    } catch {
        return null;
    }
}

export function setAdminRole(role) {
    if (typeof window === 'undefined') return;
    try {
        if (role) localStorage.setItem(ADMIN_ROLE_STORAGE_KEY, role);
        else localStorage.removeItem(ADMIN_ROLE_STORAGE_KEY);
    } catch {
        /* storage unavailable — UI falls back to the token's role */
    }
    window.dispatchEvent(new Event(ROLE_EVENT));
}

export const canManageAdminTeam = (role = getAdminRole()) => role === 'SUPER_ADMIN';

export const canViewFinancials = (role = getAdminRole()) => role !== 'OPERATIONS_MANAGER';

/** React hook: current admin role and permissions, kept in sync across tabs. */
export function useAdminPermissions() {
    const [role, setRole] = useState(getAdminRole);

    useEffect(() => {
        const update = () => setRole(getAdminRole());
        window.addEventListener(ROLE_EVENT, update);
        window.addEventListener('storage', update);
        window.addEventListener('authTokenChanged', update);
        return () => {
            window.removeEventListener(ROLE_EVENT, update);
            window.removeEventListener('storage', update);
            window.removeEventListener('authTokenChanged', update);
        };
    }, []);

    return {
        role,
        roleLabel: adminRoleLabel(role),
        canManageTeam: canManageAdminTeam(role),
        canViewFinancials: canViewFinancials(role),
    };
}
