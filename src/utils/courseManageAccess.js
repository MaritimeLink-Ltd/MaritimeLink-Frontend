/**
 * Who may edit / delete / publish / unpublish / pause / add or remove sessions for a course.
 * - Training provider app: only the owning provider (when API exposes owner ids).
 * - Admin marketplace oversight (trainer listings): read-only for platform admins.
 * - Admin marketplace internal (MaritimeLink admin listings): only the admin who created the course.
 */

import { parseJwtPayload } from './sessionManager';
import resolveKycEntityId from './resolveKycEntityId';

function norm(v) {
    if (v == null) return '';
    return String(v).trim();
}

function idsEqual(a, b) {
    return norm(a) !== '' && norm(b) !== '' && norm(a) === norm(b);
}

export function extractCourseOwnership(course) {
    if (!course || typeof course !== 'object') {
        return { adminId: null, trainingProviderId: null, adminEmailNorm: null };
    }
    const tp =
        course.trainingProviderId ??
        course.trainingProvider?.id ??
        course.providerId ??
        course.recruiterId ??
        course.recruiter?.id ??
        null;
    const adminId = course.adminId ?? course.admin?.id;
    const adminEmail =
        course.admin?.email || course.createdByEmail || course.adminEmail || null;
    return {
        adminId: adminId != null && norm(adminId) !== '' ? norm(adminId) : null,
        trainingProviderId: tp != null && norm(tp) !== '' ? norm(tp) : null,
        adminEmailNorm:
            adminEmail && typeof adminEmail === 'string' ? adminEmail.trim().toLowerCase() : null,
    };
}

function currentAdminIdFromSession() {
    if (typeof window === 'undefined') return null;
    const jwt = parseJwtPayload(localStorage.getItem('authToken'));
    if (!jwt || typeof jwt !== 'object') return null;
    const id = jwt.adminId ?? jwt.admin_id ?? jwt.id ?? jwt.userId ?? jwt.sub;
    const s = norm(id);
    return s || null;
}

function isPlatformAdminSession() {
    if (typeof window === 'undefined') return false;
    return (
        localStorage.getItem('userType') === 'admin' ||
        localStorage.getItem('adminUserType') === 'admin'
    );
}

function isTrainingProviderSession() {
    if (typeof window === 'undefined') return false;
    return (
        localStorage.getItem('userType') === 'training-provider' ||
        localStorage.getItem('adminUserType') === 'training-provider'
    );
}

/**
 * @param {{ pathname: string, course: object|null|undefined }} args
 * @returns {boolean}
 */
export function canCurrentUserManageCourse({ pathname, course }) {
    const path = pathname || '';
    const isAdminMarketplace = path.includes('/admin/marketplace');
    const isTrainingProviderRoute = path.includes('/trainingprovider/courses');

    if (isTrainingProviderRoute) {
        if (!isTrainingProviderSession()) return false;
        const mine = norm(resolveKycEntityId('training-provider'));
        if (!mine) return true;
        const { trainingProviderId } = extractCourseOwnership(course);
        if (!trainingProviderId) return true;
        return idsEqual(mine, trainingProviderId);
    }

    if (!isAdminMarketplace) {
        return true;
    }

    const isOversight = path.includes('/admin/marketplace/oversight/courses/');
    const isInternal = path.includes('/admin/marketplace/internal/courses/');

    if (isOversight) {
        return false;
    }

    if (isInternal) {
        if (!isPlatformAdminSession()) return false;
        const { adminId, adminEmailNorm } = extractCourseOwnership(course);
        const jwtAdmin = currentAdminIdFromSession();
        if (adminId && jwtAdmin && idsEqual(adminId, jwtAdmin)) return true;
        const email = (localStorage.getItem('userEmail') || '').trim().toLowerCase();
        if (adminEmailNorm && email && adminEmailNorm === email) return true;
        return false;
    }

    return false;
}
