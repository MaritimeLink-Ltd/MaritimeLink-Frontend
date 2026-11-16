import { describe, it, expect, afterEach } from 'vitest';
import {
    getAdminRole,
    setAdminRole,
    canManageAdminTeam,
    canViewFinancials,
    adminRoleLabel,
} from '../utils/adminPermissions';

const tokenWithRole = (role) => {
    const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ id: 'a', role })}.sig`;
};

describe('admin permissions', () => {
    afterEach(() => localStorage.clear());

    it('reads the stored role, falling back to the role inside the session token', () => {
        localStorage.setItem('authToken', tokenWithRole('OPERATIONS_MANAGER'));
        expect(getAdminRole()).toBe('OPERATIONS_MANAGER');
        setAdminRole('SUPER_ADMIN');
        expect(getAdminRole()).toBe('SUPER_ADMIN');
    });

    it('only super admins manage the team; only Operations Managers are kept from money', () => {
        expect(canManageAdminTeam('SUPER_ADMIN')).toBe(true);
        expect(canManageAdminTeam('OPERATIONS_MANAGER')).toBe(false);
        expect(canManageAdminTeam('ADMIN')).toBe(false);

        expect(canViewFinancials('SUPER_ADMIN')).toBe(true);
        expect(canViewFinancials('ADMIN')).toBe(true); // older accounts unchanged
        expect(canViewFinancials('MODERATOR')).toBe(true);
        expect(canViewFinancials('OPERATIONS_MANAGER')).toBe(false);
    });

    it('labels roles for display', () => {
        expect(adminRoleLabel('OPERATIONS_MANAGER')).toBe('Operations Manager');
        expect(adminRoleLabel('SUPER_ADMIN')).toBe('Super Admin');
        expect(adminRoleLabel(undefined)).toBe('Admin');
    });
});
