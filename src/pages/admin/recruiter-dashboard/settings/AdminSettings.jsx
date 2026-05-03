import { useEffect, useState } from 'react';
import {
    User,
    Building2,
    Shield,
    Bell,
    Camera,
    Mail,
    Phone,
    Save,
    Globe,
    Linkedin,
    MapPin
} from 'lucide-react';
import { countryCodes } from '../../../../utils/countryCodes';
import recruiterSettingsService from '../../../../services/recruiterSettingsService';
import authService from '../../../../services/authService';

function AdminSettings() {
    const [activeSection, setActiveSection] = useState('my-profile');
    const [profileImage, setProfileImage] = useState('/images/login-image.webp');
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+44',
        phoneNumber: '',
        role: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingCompany, setSavingCompany] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState('success');
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isCompanySaved, setIsCompanySaved] = useState(false);
    const [companyData, setCompanyData] = useState({
        name: '',
        website: '',
        linkedin: '',
        address: '',
        city: '',
        state: '',
        postcode: '',
        country: ''
    });
    const [notifications, setNotifications] = useState({
        securityAlerts: true,
        newApplications: true,
        candidateMessages: true,
        jobPostings: true,
        marketing: false,
        desktopSounds: true,
        urgentAlerts: true
    });

    const syncStoredRecruiterProfile = (profilePatch = {}) => {
        try {
            const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
            const nextProfile = {
                ...stored,
                firstName: profilePatch.firstName ?? stored.firstName,
                lastName: profilePatch.lastName ?? stored.lastName,
                email: profilePatch.email ?? stored.email,
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
                window.dispatchEvent(new CustomEvent('profileImageUpdated', { detail: { url: profilePatch.profilePhotoUrl || '/images/login-image.webp' } }));
            }
        } catch (error) {
            console.error('Failed to sync recruiter profile cache:', error);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadSettings = async () => {
            setProfileLoading(true);
            setFeedbackMessage('');
            try {
                const settingsResponse = await recruiterSettingsService.getSettings();

                if (cancelled) return;

                const settingsData = settingsResponse?.data || {};
                const profile = settingsData.profile || {};
                const company = settingsData.company || {};
                const notificationsData = settingsData.notifications || {};

                setProfileData({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    email: profile.email || '',
                    countryCode: profile.countryCode || '+44',
                    phoneNumber: profile.phoneNumber || '',
                    role: profile.role || '',
                });
                setProfileImage(profile.profilePhotoUrl || '/images/login-image.webp');
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
                    securityAlerts: notificationsData.securityAlerts ?? true,
                    newApplications: notificationsData.newApplications ?? true,
                    candidateMessages: notificationsData.candidateMessages ?? true,
                    jobPostings: notificationsData.jobPostings ?? true,
                    marketing: notificationsData.marketing ?? false,
                    desktopSounds: notificationsData.desktopSounds ?? true,
                    urgentAlerts: notificationsData.urgentAlerts ?? true,
                });
            } catch (error) {
                if (!cancelled) {
                    setFeedbackType('error');
                    setFeedbackMessage(error.message || 'Failed to load recruiter settings.');
                }
            } finally {
                if (!cancelled) {
                    setProfileLoading(false);
                }
            }
        };

        loadSettings();

        return () => {
            cancelled = true;
        };
    }, []);

    // Handle profile data change
    const handleProfileChange = (field, value) => {
        setProfileData({ ...profileData, [field]: value });
        setHasChanges(true);
        setIsSaved(false);
    };

    // Handle save changes
    const handleSaveChanges = async () => {
        setSavingProfile(true);
        setFeedbackMessage('');
        try {
            const response = await recruiterSettingsService.updateProfile(profileData);
            const updatedProfile = response?.data?.profile || profileData;
            setProfileData({
                firstName: updatedProfile.firstName || '',
                lastName: updatedProfile.lastName || '',
                email: updatedProfile.email || '',
                countryCode: updatedProfile.countryCode || '+44',
                phoneNumber: updatedProfile.phoneNumber || '',
                role: updatedProfile.role || '',
            });
            syncStoredRecruiterProfile(updatedProfile);
            setIsSaved(true);
            setHasChanges(false);
            setFeedbackType('success');
            setFeedbackMessage(response?.message || 'Profile updated successfully.');
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            setFeedbackType('error');
            setFeedbackMessage(error.message || 'Failed to update profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    // Handle company data change
    const handleCompanyChange = (field, value) => {
        setCompanyData({ ...companyData, [field]: value });
        setIsCompanySaved(false);
    };

    // Handle company save
    const handleCompanyUpdate = async () => {
        setSavingCompany(true);
        setFeedbackMessage('');
        try {
            const response = await recruiterSettingsService.updateCompany(companyData);
            const updatedCompany = response?.data?.company || companyData;
            setCompanyData({
                name: updatedCompany.name || '',
                website: updatedCompany.website || '',
                linkedin: updatedCompany.linkedin || '',
                address: updatedCompany.address || '',
                city: updatedCompany.city || '',
                state: updatedCompany.state || '',
                postcode: updatedCompany.postcode || '',
                country: updatedCompany.country || '',
            });
            setIsCompanySaved(true);
            setFeedbackType('success');
            setFeedbackMessage(response?.message || 'Company profile updated successfully.');
            setTimeout(() => setIsCompanySaved(false), 2000);
        } catch (error) {
            setFeedbackType('error');
            setFeedbackMessage(error.message || 'Failed to update company profile.');
        } finally {
            setSavingCompany(false);
        }
    };

    // Handle password update
    const handleUpdatePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        try {
            const response = await authService.updateRecruiterPassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );
            setPasswordSuccess(response?.message || 'Password updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (error) {
            setPasswordError(error.message || 'Failed to update password.');
        }
    };

    // Toggle component
    const Toggle = ({ checked, onChange }) => (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#003971]' : 'bg-gray-200'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    // Handle profile image upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a valid image file (JPEG, PNG, or GIF)');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            // Create preview URL
            setUploadingPhoto(true);
            setFeedbackMessage('');
            recruiterSettingsService.uploadProfilePhoto(file)
                .then((response) => {
                    const nextUrl = response?.data?.profilePhotoUrl || response?.data?.url || '/images/login-image.webp';
                    setProfileImage(nextUrl);
                    syncStoredRecruiterProfile({ profilePhotoUrl: nextUrl });
                    setFeedbackType('success');
                    setFeedbackMessage(response?.message || 'Profile photo updated successfully.');
                })
                .catch((error) => {
                    setFeedbackType('error');
                    setFeedbackMessage(error.message || 'Failed to upload profile photo.');
                })
                .finally(() => {
                    setUploadingPhoto(false);
                });
        }
    };

    // Handle profile image removal
    const handleImageRemove = async () => {
        setUploadingPhoto(true);
        setFeedbackMessage('');
        try {
            const response = await recruiterSettingsService.removeProfilePhoto();
            setProfileImage('/images/login-image.webp');
            syncStoredRecruiterProfile({ profilePhotoUrl: null });
            setFeedbackType('success');
            setFeedbackMessage(response?.message || 'Profile photo removed successfully.');
        } catch (error) {
            setFeedbackType('error');
            setFeedbackMessage(error.message || 'Failed to remove profile photo.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleNotificationsSave = async () => {
        setSavingNotifications(true);
        setFeedbackMessage('');
        try {
            const response = await recruiterSettingsService.updateNotifications(notifications);
            setNotifications(response?.data?.notifications || notifications);
            setFeedbackType('success');
            setFeedbackMessage(response?.message || 'Notification preferences updated successfully.');
        } catch (error) {
            setFeedbackType('error');
            setFeedbackMessage(error.message || 'Failed to update notification preferences.');
        } finally {
            setSavingNotifications(false);
        }
    };

    const accountSections = [
        { id: 'my-profile', label: 'My Profile', icon: User },
        { id: 'company-profile', label: 'Company Profile', icon: Building2 },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    const preferenceSections = [
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header - Sticky */}
            <div className="flex-shrink-0 pb-3">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your account settings and preferences</p>
            </div>

            {feedbackMessage && (
                <div className={`mb-3 rounded-xl border px-4 py-3 text-sm ${feedbackType === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-green-200 bg-green-50 text-green-700'
                    }`}>
                    {feedbackMessage}
                </div>
            )}

            {/* Settings Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 overflow-hidden">
                {/* Sidebar - Sticky */}
                <div className="lg:col-span-1 overflow-y-auto">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 sticky top-0">
                        {/* Account Section */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Account</h3>
                            <div className="space-y-1">
                                {accountSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeSection === section.id
                                            ? 'bg-blue-50 text-[#003971]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preferences Section */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Preferences</h3>
                            <div className="space-y-1">
                                {preferenceSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeSection === section.id
                                            ? 'bg-blue-50 text-[#003971]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Scrollable */}
                <div className="lg:col-span-3 overflow-y-auto">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        {/* Personal Information Section */}
                        {activeSection === 'my-profile' && (
                            <div>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Update your photo and personal details here.</p>
                                    </div>
                                    {(hasChanges || isSaved) && (
                                        <button
                                            onClick={handleSaveChanges}
                                            disabled={isSaved || savingProfile || profileLoading}
                                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${isSaved
                                                ? 'bg-green-500 text-white cursor-default'
                                                : 'bg-[#003971] text-white hover:bg-[#002855] disabled:opacity-60'
                                                }`}
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSaved ? 'Saved' : savingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>

                                {/* Profile Photo */}
                                <div className="mb-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-start gap-6">
                                        <div className="relative">
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover"
                                            />
                                            <input
                                                type="file"
                                                id="profile-photo-upload"
                                                className="hidden"
                                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="profile-photo-upload"
                                                className={`absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors ${uploadingPhoto ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
                                            >
                                                <Camera className="h-4 w-4 text-gray-600" />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">Profile Photo</h3>
                                            <p className="text-sm text-gray-500 mb-3">This will be displayed on your profile.</p>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={handleImageRemove}
                                                    disabled={uploadingPhoto}
                                                    className="text-sm font-medium text-red-600 hover:text-red-700"
                                                >
                                                    {uploadingPhoto ? 'Working...' : 'Remove'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-3">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Phone and Role Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={profileData.countryCode}
                                                    onChange={(e) => handleProfileChange('countryCode', e.target.value)}
                                                    className="w-32 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                                >
                                                    {countryCodes.map((country) => (
                                                        <option key={country.code + country.country} value={country.code}>
                                                            {country.flag} {country.code}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="tel"
                                                        value={profileData.phoneNumber}
                                                        onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                                                        className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                                        placeholder="Enter phone number"
                                                    />
                                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                            <input
                                                type="text"
                                                value={profileData.role}
                                                onChange={(e) => handleProfileChange('role', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Company Profile Section */}
                        {activeSection === 'company-profile' && (
                            <div className="pb-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Company Details</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Manage your recruitment agency information.</p>
                                    </div>
                                    <button
                                        onClick={handleCompanyUpdate}
                                        disabled={isCompanySaved || savingCompany || profileLoading}
                                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${isCompanySaved
                                            ? 'bg-green-500 text-white cursor-default'
                                            : 'bg-[#003971] text-white hover:bg-[#002855] disabled:opacity-60'
                                            }`}
                                    >
                                        {isCompanySaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                                        {isCompanySaved ? 'Updated' : savingCompany ? 'Updating...' : 'Update Company'}
                                    </button>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-3">
                                    {/* Company Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                        <input
                                            type="text"
                                            value={companyData.name}
                                            onChange={(e) => handleCompanyChange('name', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                        />
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                value={companyData.website}
                                                onChange={(e) => handleCompanyChange('website', e.target.value)}
                                                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                            <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* LinkedIn Page */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Page</label>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                value={companyData.linkedin}
                                                onChange={(e) => handleCompanyChange('linkedin', e.target.value)}
                                                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                            <Linkedin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Headquarters Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters Address</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={companyData.address}
                                                onChange={(e) => handleCompanyChange('address', e.target.value)}
                                                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* City and County/State */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                value={companyData.city}
                                                onChange={(e) => handleCompanyChange('city', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">County/State</label>
                                            <input
                                                type="text"
                                                value={companyData.state}
                                                onChange={(e) => handleCompanyChange('state', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>

                                    {/* Postcode/Zip and Country */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Postcode/Zip</label>
                                            <input
                                                type="text"
                                                value={companyData.postcode}
                                                onChange={(e) => handleCompanyChange('postcode', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                            <input
                                                type="text"
                                                value={companyData.country}
                                                onChange={(e) => handleCompanyChange('country', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Section */}
                        {activeSection === 'security' && (
                            <>
                                {/* Password Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-1">Password</h2>
                                    <p className="text-sm text-gray-500 mb-6">Update your password associated with your account.</p>

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
                                                placeholder="Enter Current Password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter New Password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Confirm New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Confirm New Password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                onClick={handleUpdatePassword}
                                                className="px-6 py-2.5 bg-[#003971] hover:bg-[#002455] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Notifications Section */}
                        {activeSection === 'notifications' && (
                            <>
                                {/* Email Notifications */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="mb-6 flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 mb-1">Email Notifications</h2>
                                            <p className="text-sm text-gray-500">Manage what emails you receive from us.</p>
                                        </div>
                                        <button
                                            onClick={handleNotificationsSave}
                                            disabled={savingNotifications}
                                            className="rounded-xl bg-[#003971] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#002855] disabled:opacity-60"
                                        >
                                            {savingNotifications ? 'Saving...' : 'Save Preferences'}
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Security Alerts</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">Get notified about suspicious login attempts</p>
                                            </div>
                                            <Toggle
                                                checked={notifications.securityAlerts}
                                                onChange={(v) => setNotifications({ ...notifications, securityAlerts: v })}
                                            />
                                        </div>
                                        <div className="h-px bg-gray-50" />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">New Applications</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">When candidates apply to your job postings</p>
                                            </div>
                                            <Toggle
                                                checked={notifications.newApplications}
                                                onChange={(v) => setNotifications({ ...notifications, newApplications: v })}
                                            />
                                        </div>
                                        <div className="h-px bg-gray-50" />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Candidate Messages</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">New messages from candidates or seafarers</p>
                                            </div>
                                            <Toggle
                                                checked={notifications.candidateMessages}
                                                onChange={(v) => setNotifications({ ...notifications, candidateMessages: v })}
                                            />
                                        </div>
                                        <div className="h-px bg-gray-50" />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Job Posting Updates</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">Changes to your job status or approvals</p>
                                            </div>
                                            <Toggle
                                                checked={notifications.jobPostings}
                                                onChange={(v) => setNotifications({ ...notifications, jobPostings: v })}
                                            />
                                        </div>
                                        <div className="h-px bg-gray-50" />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Marketing & Newsletter</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">Product updates and industry news</p>
                                            </div>
                                            <Toggle
                                                checked={notifications.marketing}
                                                onChange={(v) => setNotifications({ ...notifications, marketing: v })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* System Notifications */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-1">System Notifications</h2>
                                    <p className="text-sm text-gray-500 mb-6">Manage in-app alerts and banners.</p>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Desktop Sounds</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">Play a sound for critical alerts</p>
                                            </div>
                                            <Toggle
                                                checked={notifications.desktopSounds}
                                                onChange={(v) => setNotifications({ ...notifications, desktopSounds: v })}
                                            />
                                        </div>
                                        <div className="h-px bg-gray-50" />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Urgent Alerts</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">Highlight time-sensitive notifications</p>
                                            </div>
                                            <Toggle
                                                checked={notifications.urgentAlerts}
                                                onChange={(v) => setNotifications({ ...notifications, urgentAlerts: v })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Placeholder for other sections */}
                        {activeSection !== 'my-profile' && activeSection !== 'company-profile' && activeSection !== 'security' && activeSection !== 'notifications' && (
                            <div className="text-center py-12">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">
                                    {accountSections.find(s => s.id === activeSection)?.label ||
                                        preferenceSections.find(s => s.id === activeSection)?.label}
                                </h2>
                                <p className="text-sm text-gray-500">This section is under development.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSettings;
