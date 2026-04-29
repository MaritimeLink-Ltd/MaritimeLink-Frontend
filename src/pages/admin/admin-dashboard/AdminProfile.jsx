import React, { useEffect, useMemo, useState } from 'react';
import {
    User,
    Shield,
    Bell,
    Mail,
    Save,
    Camera,
    Building,
    MapPin,
    Calendar,
} from 'lucide-react';
import adminSettingsService from '../../../services/adminSettingsService';
import adminDashboardService from '../../../services/adminDashboardService';

const defaultAdminAvatar = '/images/login-image.webp';

const AdminProfile = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [profileImage, setProfileImage] = useState(() => {
        try {
            return localStorage.getItem('profileImage') || defaultAdminAvatar;
        } catch {
            return defaultAdminAvatar;
        }
    });
    const [profile, setProfile] = useState({
        displayName: 'Admin User',
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        adminId: '',
        companyName: 'MaritimeLink Global',
        department: 'Platform Operations',
        region: 'Global',
        createdAt: '',
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [notifications, setNotifications] = useState([]);

    const menuItems = [
        { id: 'general', label: 'General Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const initials = useMemo(() => {
        const base = profile.displayName || profile.email || 'A';
        return base
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'A';
    }, [profile.displayName, profile.email]);

    const syncStoredAdminProfile = (profilePatch = {}) => {
        try {
            const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
            const nextProfile = {
                ...stored,
                firstName: profilePatch.firstName ?? stored.firstName,
                lastName: profilePatch.lastName ?? stored.lastName,
                fullName: profilePatch.displayName ?? stored.fullName,
                email: profilePatch.email ?? stored.email,
                role: profilePatch.role ?? stored.role,
                profilePhoto: profilePatch.profilePhotoUrl ?? stored.profilePhoto,
                photo: profilePatch.profilePhotoUrl ?? stored.photo,
            };
            localStorage.setItem('userProfile', JSON.stringify(nextProfile));
            if (nextProfile.email) localStorage.setItem('userEmail', nextProfile.email);
            if (profilePatch.profilePhotoUrl !== undefined) {
                if (profilePatch.profilePhotoUrl) {
                    localStorage.setItem('profileImage', profilePatch.profilePhotoUrl);
                } else {
                    localStorage.removeItem('profileImage');
                }
                window.dispatchEvent(
                    new CustomEvent('profileImageUpdated', {
                        detail: { url: profilePatch.profilePhotoUrl || defaultAdminAvatar },
                    }),
                );
            }
        } catch (error) {
            console.error('Failed to sync admin profile cache:', error);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadSettings = async () => {
            setLoading(true);
            try {
                const response = await adminSettingsService.getSettings();
                if (cancelled) return;
                const nextProfile = response?.data?.profile || {};
                setProfile((prev) => ({
                    ...prev,
                    ...nextProfile,
                    createdAt: nextProfile.createdAt || '',
                }));
                const nextStoredProfile = {
                    firstName: nextProfile.firstName || '',
                    lastName: nextProfile.lastName || '',
                    fullName: nextProfile.displayName || 'Admin User',
                    email: nextProfile.email || '',
                    role: nextProfile.role || '',
                };
                localStorage.setItem('userProfile', JSON.stringify(nextStoredProfile));
                if (nextProfile.email) localStorage.setItem('userEmail', nextProfile.email);
                const cachedImage = localStorage.getItem('profileImage');
                setProfileImage(cachedImage || defaultAdminAvatar);
            } catch (error) {
                if (!cancelled) {
                    setFeedback({ type: 'error', message: error.message || 'Failed to load admin settings.' });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        const loadNotifications = async () => {
            setNotificationsLoading(true);
            try {
                const response = await adminDashboardService.getNotifications();
                if (cancelled) return;
                setNotifications(response?.data?.notifications || []);
            } catch (error) {
                if (!cancelled) {
                    setNotifications([]);
                }
            } finally {
                if (!cancelled) setNotificationsLoading(false);
            }
        };

        loadSettings();
        loadNotifications();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleEmailSave = async () => {
        setSavingProfile(true);
        setFeedback({ type: '', message: '' });
        try {
            const response = await adminSettingsService.updateProfile({ email: profile.email });
            const nextProfile = response?.data?.profile || profile;
            setProfile((prev) => ({ ...prev, ...nextProfile }));
            syncStoredAdminProfile(nextProfile);
            setFeedback({ type: 'success', message: response?.message || 'Admin profile updated successfully.' });
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Failed to update admin profile.' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSave = async () => {
        setPasswordError('');
        setPasswordSuccess('');
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setPasswordError('All fields are required');
            return;
        }
        if (passwords.new.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setPasswordError('New passwords do not match');
            return;
        }
        setSavingPassword(true);
        try {
            const response = await adminSettingsService.updatePassword(passwords.current, passwords.new);
            setPasswordSuccess(response?.message || 'Password updated successfully.');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            setPasswordError(error.message || 'Failed to update password.');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setFeedback({
                type: 'error',
                message: 'Please upload a valid image file (JPEG, PNG, GIF, or WEBP).',
            });
            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setFeedback({
                type: 'error',
                message: 'File size must be less than 5MB.',
            });
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const nextUrl = typeof reader.result === 'string' ? reader.result : defaultAdminAvatar;
            setProfileImage(nextUrl);
            syncStoredAdminProfile({ profilePhotoUrl: nextUrl });
            setFeedback({
                type: 'success',
                message: 'Admin profile photo updated successfully.',
            });
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleRemoveImage = () => {
        setProfileImage(defaultAdminAvatar);
        syncStoredAdminProfile({ profilePhotoUrl: null });
        setFeedback({
            type: 'success',
            message: 'Admin profile photo removed successfully.',
        });
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-shrink-0 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your admin account and platform notifications.</p>
            </div>

            {feedback.message && (
                <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedback.type === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-green-200 bg-green-50 text-green-700'
                    }`}>
                    {feedback.message}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-0">
                        <div className="p-2 space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === item.id
                                        ? 'bg-[#0f385c] text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {activeTab === 'general' && (
                        <>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Account Overview</h2>

                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            {profileImage && profileImage !== defaultAdminAvatar ? (
                                                <img
                                                    src={profileImage}
                                                    alt=""
                                                    className="w-24 h-24 rounded-full border-4 border-gray-50 object-cover"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full border-4 border-gray-50 bg-[#0f385c] text-white flex items-center justify-center text-2xl font-bold">
                                                    {initials}
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id="admin-profile-photo-upload"
                                                className="hidden"
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="admin-profile-photo-upload"
                                                className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                                            >
                                                <Camera className="h-4 w-4" />
                                            </label>
                                        </div>
                                        <button
                                            onClick={handleRemoveImage}
                                            className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Display Name</label>
                                            <input
                                                type="text"
                                                value={profile.displayName}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Admin Role</label>
                                            <input
                                                type="text"
                                                value={profile.role}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-xs font-semibold text-gray-500">Email Address</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                                                    className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                                />
                                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
                                    <button
                                        onClick={handleEmailSave}
                                        disabled={savingProfile || loading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0f385c] hover:bg-[#0a2742] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60"
                                    >
                                        <Save className="h-4 w-4" />
                                        {savingProfile ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Platform Context</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Company Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={profile.companyName}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                            <Building className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Admin ID</label>
                                        <input
                                            type="text"
                                            value={profile.adminId}
                                            readOnly
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Department</label>
                                        <input
                                            type="text"
                                            value={profile.department}
                                            readOnly
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Region</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={profile.region}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Created At</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={profile.createdAt ? new Date(profile.createdAt).toLocaleString() : ''}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Password</h2>
                            <p className="text-sm text-gray-500 mb-6">Update the password associated with your admin account.</p>

                            <div className="space-y-6 max-w-2xl">
                                {passwordError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                                        {passwordError}
                                    </div>
                                )}
                                {passwordSuccess && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 font-medium">
                                        {passwordSuccess}
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500">New Password</label>
                                    <input
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handlePasswordSave}
                                        disabled={savingPassword}
                                        className="px-6 py-2.5 bg-[#0f385c] hover:bg-[#0a2742] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60"
                                    >
                                        {savingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Platform Notifications</h2>
                            <p className="text-sm text-gray-500 mb-6">These are live operational alerts from the admin dashboard.</p>

                            {notificationsLoading ? (
                                <div className="text-sm text-gray-500">Loading notifications...</div>
                            ) : notifications.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                                    No admin notifications right now.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((item) => (
                                        <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                                                    <div className="mt-1 text-sm text-gray-600">{item.message}</div>
                                                </div>
                                                <div className="text-xs text-gray-400 whitespace-nowrap">
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
