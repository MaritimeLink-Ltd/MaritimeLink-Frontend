/**
 * Admin team management (super admins) and invitation acceptance.
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';
import { setAdminRole } from '../utils/adminPermissions';
import { clearAuthStorage } from '../utils/sessionManager';

const emitAuthTokenChanged = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authTokenChanged'));
    }
};

class AdminTeamService {
    /** GET /api/admin/team → { members, invitations, invitableRoles } */
    async getTeam() {
        const response = await httpClient.get(API_ENDPOINTS.ADMIN.TEAM);
        return response?.data || { members: [], invitations: [], invitableRoles: [] };
    }

    async invite({ email, role, title }) {
        return httpClient.post(API_ENDPOINTS.ADMIN.TEAM_INVITATIONS, {
            email,
            role,
            ...(title ? { title } : {}),
        });
    }

    async resendInvitation(id) {
        return httpClient.post(API_ENDPOINTS.ADMIN.TEAM_INVITATION_RESEND(id), {});
    }

    async revokeInvitation(id) {
        return httpClient.delete(API_ENDPOINTS.ADMIN.TEAM_INVITATION(id));
    }

    async changeRole(id, role) {
        return httpClient.patch(API_ENDPOINTS.ADMIN.TEAM_MEMBER(id), { role });
    }

    /** An empty title removes it. */
    async updateTitle(id, title) {
        return httpClient.patch(API_ENDPOINTS.ADMIN.TEAM_MEMBER(id), { title });
    }

    async deactivate(id) {
        return httpClient.post(API_ENDPOINTS.ADMIN.TEAM_MEMBER_DEACTIVATE(id), {});
    }

    async reactivate(id) {
        return httpClient.post(API_ENDPOINTS.ADMIN.TEAM_MEMBER_REACTIVATE(id), {});
    }

    /** Public: invitation details for the accept page. */
    async getInvitation(token) {
        const response = await httpClient.get(API_ENDPOINTS.ADMIN.INVITATION(token), {
            skipAuth: true,
        });
        return response?.data?.invitation || null;
    }

    /**
     * Public: accept the invitation and sign in as the new admin. Replaces any
     * session that was open in this browser.
     */
    async acceptInvitation(token, { password, name }) {
        const response = await httpClient.post(
            API_ENDPOINTS.ADMIN.INVITATION_ACCEPT(token),
            { password, ...(name ? { name } : {}) },
            { skipAuth: true },
        );
        const authToken = response?.token;
        if (authToken) {
            clearAuthStorage();
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('adminUserType', 'admin');
            localStorage.setItem('userType', 'admin');
            const user = response?.data?.user;
            if (user?.email) localStorage.setItem('userEmail', user.email);
            // Lets the header greet them by name before they open Profile Settings.
            if (user?.name) {
                localStorage.setItem(
                    'userProfile',
                    JSON.stringify({ displayName: user.name, email: user.email }),
                );
            }
            setAdminRole(user?.role || null);
            emitAuthTokenChanged();
        }
        return response;
    }
}

const adminTeamService = new AdminTeamService();
export default adminTeamService;
