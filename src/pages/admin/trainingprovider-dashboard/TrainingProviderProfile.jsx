import { useEffect, useMemo, useState } from 'react';
import {
    User,
    Shield,
    Bell,
    Camera,
    Save,
    Building,
    MapPin,
    Mail,
    Phone,
    CreditCard,
    CheckCircle2,
} from 'lucide-react';
import { countryCodes } from '../../../utils/countryCodes';
import trainerSettingsService from '../../../services/trainerSettingsService';

const defaultNotifications = {
    securityAlerts: true,
    newApplications: true,
    candidateMessages: true,
    jobPostings: true,
    marketing: false,
    desktopSounds: true,
    urgentAlerts: true,
};

const defaultBilling = {
    currentPlan: 'Free',
    amount: 0,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [],
    stripeOnboardingComplete: false,
};

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                checked ? 'bg-[#003971]' : 'bg-gray-200'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

const TrainingProviderProfile = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [profileImage, setProfileImage] = useState('/images/login-image.webp');
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+44',
        phoneNumber: '',
        role: '',
    });
    const [companyData, setCompanyData] = useState({
        name: '',
        website: '',
        linkedin: '',
        address: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
    });
    const [notifications, setNotifications] = useState(defaultNotifications);
    const [billing, setBilling] = useState(defaultBilling);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const menuItems = [
        { id: 'general', label: 'General Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const organizationSummary = useMemo(
        () => ({
            companyName: companyData.name || 'Not set yet',
            organizationId:
                JSON.parse(localStorage.getItem('userProfile') || '{}')?.id ||
                localStorage.getItem('recruiterId') ||
                'N/A',
            role: profileData.role || 'Training Provider',
            region: companyData.country || 'N/A',
        }),
        [companyData.name, companyData.country, profileData.role],
    );

    const syncStoredProfile = (profilePatch = {}) => {
        try {
            const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
            const nextProfile = {
                ...stored,
                firstName: profilePatch.firstName ?? stored.firstName,
                lastName: profilePatch.lastName ?? stored.lastName,
                email: profilePatch.email ?? stored.email,
                phoneCode: profilePatch.countryCode ?? stored.phoneCode,
                phoneNumber: profilePatch.phoneNumber ?? stored.phoneNumber,
                personalRole: profilePatch.role ?? stored.personalRole,
                companyName: companyData.name || stored.companyName,
                company: companyData.name || stored.company,
                country: companyData.country || stored.country,
                profilePhoto: profilePatch.profilePhotoUrl ?? stored.profilePhoto,
                profilePhotoUrl:
                    profilePatch.profilePhotoUrl ?? stored.profilePhotoUrl,
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
                        detail: { url: profilePatch.profilePhotoUrl || null },
                    }),
                );
            }
        } catch (error) {
            console.error('Failed to sync trainer profile cache:', error);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadSettings = async () => {
            setLoading(true);
            setFeedback({ type: '', message: '' });
            try {
                const [settingsResponse, billingResponse] = await Promise.all([
                    trainerSettingsService.getSettings(),
                    trainerSettingsService.getBilling(),
                ]);

                if (cancelled) return;

                const settings = settingsResponse?.data || {};
                const profile = settings.profile || {};
                const company = settings.company || {};
                const notificationsData = settings.notifications || {};
                const billingData =
                    billingResponse?.data?.billing || settings.billing || defaultBilling;

                setProfileData({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    email: profile.email || '',
                    countryCode: profile.countryCode || '+44',
                    phoneNumber: profile.phoneNumber || '',
                    role: profile.role || '',
                });
                setCompanyData({
                    name: company.name || '',
                    website: company.website || '',
                    linkedin: company.linkedin || '',
                    address: company.address || '',
                    city: company.city || '',
                    state: company.state || '',
                    postcode: company.postcode || '',
                    country: company.country || '',
                });
                setNotifications({
                    ...defaultNotifications,
                    ...notificationsData,
                });
                setBilling({
                    ...defaultBilling,
                    ...billingData,
                });
                setProfileImage(profile.profilePhotoUrl || '/images/login-image.webp');
                syncStoredProfile({
                    ...profile,
                    profilePhotoUrl: profile.profilePhotoUrl || null,
                });
            } catch (error) {
                if (!cancelled) {
                    setFeedback({
                        type: 'error',
                        message: error.message || 'Failed to load training provider settings.',
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadSettings();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleProfileChange = (field, value) => {
        setProfileData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setFeedback({ type: '', message: '' });
        try {
            const response = await trainerSettingsService.updateProfile(profileData);
            const updated = response?.data?.profile || {};
            setProfileData({
                firstName: updated.firstName || '',
                lastName: updated.lastName || '',
                email: updated.email || '',
                countryCode: updated.countryCode || '+44',
                phoneNumber: updated.phoneNumber || '',
                role: updated.role || '',
            });
            syncStoredProfile(updated);
            setFeedback({
                type: 'success',
                message: response?.message || 'Profile updated successfully.',
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.message || 'Failed to update profile.',
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleUpdatePassword = async () => {
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
            const response = await trainerSettingsService.updatePassword(
                passwords.current,
                passwords.new,
            );
            setPasswordSuccess(response?.message || 'Password updated successfully.');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            setPasswordError(error.message || 'Failed to update password.');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleSaveNotifications = async () => {
        setSavingNotifications(true);
        setFeedback({ type: '', message: '' });
        try {
            const response = await trainerSettingsService.updateNotifications(
                notifications,
            );
            setNotifications({
                ...defaultNotifications,
                ...(response?.data?.notifications || notifications),
            });
            setFeedback({
                type: 'success',
                message:
                    response?.message || 'Notification preferences updated successfully.',
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.message || 'Failed to update notifications.',
            });
        } finally {
            setSavingNotifications(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setFeedback({
                type: 'error',
                message: 'Please upload a valid image file (JPEG, PNG, or GIF).',
            });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setFeedback({
                type: 'error',
                message: 'File size must be less than 5MB.',
            });
            return;
        }

        setUploadingPhoto(true);
        setFeedback({ type: '', message: '' });
        try {
            const response = await trainerSettingsService.uploadProfilePhoto(file);
            const nextUrl =
                response?.data?.profilePhotoUrl ||
                response?.data?.photoUrl ||
                '/images/login-image.webp';
            setProfileImage(nextUrl);
            syncStoredProfile({ profilePhotoUrl: nextUrl });
            setFeedback({
                type: 'success',
                message: response?.message || 'Profile photo updated successfully.',
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.message || 'Failed to upload profile photo.',
            });
        } finally {
            setUploadingPhoto(false);
            event.target.value = '';
        }
    };

    const handleImageRemove = async () => {
        setUploadingPhoto(true);
        setFeedback({ type: '', message: '' });
        try {
            const response = await trainerSettingsService.removeProfilePhoto();
            setProfileImage('/images/login-image.webp');
            syncStoredProfile({ profilePhotoUrl: null });
            setFeedback({
                type: 'success',
                message: response?.message || 'Profile photo removed successfully.',
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.message || 'Failed to remove profile photo.',
            });
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-shrink-0 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your training provider account with live settings data.
                </p>
            </div>

            {feedback.message && (
                <div
                    className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                        feedback.type === 'error'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-green-200 bg-green-50 text-green-700'
                    }`}
                >
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
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                                        activeTab === item.id
                                            ? 'bg-[#003971] text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <item.icon
                                        className={`h-4 w-4 ${
                                            activeTab === item.id
                                                ? 'text-white'
                                                : 'text-gray-400'
                                        }`}
                                    />
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
                                <h2 className="text-lg font-bold text-gray-900 mb-6">
                                    Personal Information
                                </h2>

                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            {profileImage && profileImage !== '/images/login-image.webp' ? (
                                                <img
                                                    src={profileImage}
                                                    alt=""
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-50"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full border-4 border-gray-50 bg-gray-100 flex items-center justify-center">
                                                    <User className="h-10 w-10 text-gray-400" />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id="trainer-profile-photo-upload"
                                                className="hidden"
                                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="trainer-profile-photo-upload"
                                                className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                                            >
                                                <Camera className="h-4 w-4" />
                                            </label>
                                        </div>
                                        <button
                                            onClick={handleImageRemove}
                                            disabled={uploadingPhoto}
                                            className="mt-2 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                                        >
                                            {uploadingPhoto ? 'Working...' : 'Remove'}
                                        </button>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={(e) =>
                                                    handleProfileChange('firstName', e.target.value)
                                                }
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={(e) =>
                                                    handleProfileChange('lastName', e.target.value)
                                                }
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-xs font-semibold text-gray-500">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) =>
                                                        handleProfileChange('email', e.target.value)
                                                    }
                                                    className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                                />
                                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">
                                                Phone Number
                                            </label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={profileData.countryCode}
                                                    onChange={(e) =>
                                                        handleProfileChange('countryCode', e.target.value)
                                                    }
                                                    className="w-32 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                                >
                                                    {countryCodes.map((country) => (
                                                        <option
                                                            key={`${country.code}-${country.country}`}
                                                            value={country.code}
                                                        >
                                                            {country.flag} {country.code}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="tel"
                                                        value={profileData.phoneNumber}
                                                        onChange={(e) =>
                                                            handleProfileChange('phoneNumber', e.target.value)
                                                        }
                                                        className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                                    />
                                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">
                                                Role
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.role}
                                                onChange={(e) =>
                                                    handleProfileChange('role', e.target.value)
                                                }
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile || loading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#003971] hover:bg-[#002455] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60"
                                    >
                                        <Save className="h-4 w-4" />
                                        {savingProfile ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">
                                    Organization Details
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">
                                            Company Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={organizationSummary.companyName}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                            <Building className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">
                                            Organization ID
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={organizationSummary.organizationId}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={organizationSummary.role}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">
                                            Region
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={organizationSummary.region}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-start justify-between gap-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Billing & Payouts
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Your live billing plan and Stripe payout readiness.
                                        </p>
                                    </div>
                                    <div
                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                            billing.stripeOnboardingComplete
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        {billing.stripeOnboardingComplete
                                            ? 'Stripe Connected'
                                            : 'Stripe Setup Pending'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                            <CreditCard className="h-4 w-4" />
                                            Current Plan
                                        </div>
                                        <p className="mt-2 text-lg font-bold text-gray-900">
                                            {billing.currentPlan}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <div className="text-sm font-semibold text-gray-500">
                                            Billing Cycle
                                        </div>
                                        <p className="mt-2 text-lg font-bold text-gray-900 capitalize">
                                            {billing.billingCycle}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <div className="text-sm font-semibold text-gray-500">
                                            Amount
                                        </div>
                                        <p className="mt-2 text-lg font-bold text-gray-900">
                                            {billing.currency} {billing.amount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Password</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Update your training provider account password.
                            </p>

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
                                    <label className="text-xs font-semibold text-gray-500">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.current}
                                        onChange={(e) =>
                                            setPasswords((prev) => ({
                                                ...prev,
                                                current: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) =>
                                            setPasswords((prev) => ({
                                                ...prev,
                                                new: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) =>
                                            setPasswords((prev) => ({
                                                ...prev,
                                                confirm: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={savingPassword}
                                        className="px-6 py-2.5 bg-[#003971] hover:bg-[#002455] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60"
                                    >
                                        {savingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">
                                Notification Preferences
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Control which account and booking notifications reach you.
                            </p>

                            <div className="space-y-4">
                                {[
                                    ['securityAlerts', 'Security Alerts', 'Important security updates and suspicious activity.'],
                                    ['newApplications', 'New Applications', 'Booking and attendee request activity.'],
                                    ['candidateMessages', 'Messages', 'Chat and direct message notifications.'],
                                    ['jobPostings', 'Course Updates', 'Course publishing and schedule changes.'],
                                    ['marketing', 'Marketing', 'Product updates and optional announcements.'],
                                    ['desktopSounds', 'Desktop Sounds', 'Play sound cues for live alerts.'],
                                    ['urgentAlerts', 'Urgent Alerts', 'High-priority operational issues.'],
                                ].map(([key, label, description]) => (
                                    <div
                                        key={key}
                                        className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4"
                                    >
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                {label}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {description}
                                            </p>
                                        </div>
                                        <Toggle
                                            checked={Boolean(notifications[key])}
                                            onChange={(value) =>
                                                setNotifications((prev) => ({
                                                    ...prev,
                                                    [key]: value,
                                                }))
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
                                <button
                                    onClick={handleSaveNotifications}
                                    disabled={savingNotifications || loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#003971] hover:bg-[#002455] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60"
                                >
                                    <Save className="h-4 w-4" />
                                    {savingNotifications ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainingProviderProfile;
