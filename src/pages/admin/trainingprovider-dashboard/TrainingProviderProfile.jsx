import { useState } from 'react';
import {
    User,
    Shield,
    Bell,
    Camera,
    Save,
    MapPin,
    Building,
    Smartphone,
    Laptop,
    Monitor,
    CheckCircle,
    Plus,
    Copy,
    Trash2
} from 'lucide-react';
import { countryCodes } from '../../../utils/countryCodes';

const TrainingProviderProfile = () => {
    const [activeTab, setActiveTab] = useState('general');

    const [formData, setFormData] = useState({
        firstName: 'Kingsley',
        lastName: 'Osifo',
        email: 'kingsley@maritimelink.com',
        countryCode: '+44',
        phone: '7700900077',
        jobTitle: 'Training Manager',
        department: 'Operations',
        companyName: 'MaritimeLink Training',
        orgId: 'TP-778291',
        role: 'Training Provider Admin',
        region: 'United Kingdom'
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

    const [notifications, setNotifications] = useState({
        securityAlerts: true,
        bookingRequests: true,
        courseUpdates: true,
        marketing: false,
        desktopSounds: true,
        slaBreaches: true
    });

    const [hasChanges, setHasChanges] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [profileImage, setProfileImage] = useState('/images/login-image.png');

    // Handle form data change
    const handleFormChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        setHasChanges(true);
        setIsSaved(false);
    };

    // Handle save changes
    const handleSaveChanges = () => {
        setIsSaved(true);
        setHasChanges(false);
        // Reset saved state after 2 seconds
        setTimeout(() => {
            setIsSaved(false);
        }, 2000);
    };

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
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle profile image removal
    const handleImageRemove = () => {
        setProfileImage('https://placehold.co/128x128/e5e7eb/6b7280?text=User');
    };

    // Handle password update
    const handleUpdatePassword = () => {
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
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

        // Simulate API call
        setTimeout(() => {
            setPasswordSuccess('Password updated successfully!');
            setPasswords({
                current: '',
                new: '',
                confirm: ''
            });

            // Clear success message after 3 seconds
            setTimeout(() => setPasswordSuccess(''), 3000);
        }, 500);
    };

    // Handle 2FA toggle
    const handle2FAToggle = () => {
        setTwoFactorEnabled(!twoFactorEnabled);
    };

    const menuItems = [
        { id: 'general', label: 'General Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

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

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header - Sticky */}
            <div className="flex-shrink-0 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your personal information and security preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                {/* Left Sidebar Navigation - Sticky */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-0">
                        <div className="p-2 space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === item.id
                                        ? 'bg-[#003971] text-white'
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

                {/* Main Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {activeTab === 'general' && (
                        <>
                            {/* Personal Information Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h2>

                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Avatar Section */}
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-50"
                                            />
                                            <input
                                                type="file"
                                                id="profile-photo-upload"
                                                className="hidden"
                                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                                capture="user"
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="profile-photo-upload"
                                                className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                                            >
                                                <Camera className="h-4 w-4" />
                                            </label>
                                        </div>
                                        <button
                                            onClick={handleImageRemove}
                                            className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">First Name</label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => handleFormChange('firstName', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Last Name</label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => handleFormChange('lastName', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleFormChange('email', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Phone Number</label>
                                            <div className="flex gap-2">
                                                <select
                                                    name="countryCode"
                                                    value={formData.countryCode}
                                                    onChange={(e) => handleFormChange('countryCode', e.target.value)}
                                                    className="w-32 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                                >
                                                    {countryCodes.map((country) => (
                                                        <option key={country.code + country.country} value={country.code}>
                                                            {country.flag} {country.code}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Job Title</label>
                                            <input
                                                type="text"
                                                value={formData.jobTitle}
                                                onChange={(e) => handleFormChange('jobTitle', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Department</label>
                                            <input
                                                type="text"
                                                value={formData.department}
                                                onChange={(e) => handleFormChange('department', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
                                    {(hasChanges || isSaved) && (
                                        <button
                                            onClick={handleSaveChanges}
                                            disabled={isSaved}
                                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm ${isSaved
                                                ? 'bg-green-500 text-white cursor-default'
                                                : 'bg-[#003971] hover:bg-[#002455] text-white'
                                                }`}
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSaved ? 'Saved' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Organization Details Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Organization Details</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Company Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.companyName}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                            <Building className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Organization ID</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.orgId}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Role</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.role}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                            <Shield className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Region</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.region}
                                                readOnly
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none cursor-default"
                                            />
                                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'security' && (
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
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter New Password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Confirm New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
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

                            {/* 2FA Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h2>
                                        <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${twoFactorEnabled
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}>
                                        {twoFactorEnabled ? (
                                            <><CheckCircle className="h-3 w-3" /> Enabled</>
                                        ) : (
                                            'Disabled'
                                        )}
                                    </span>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200/60">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                            <Smartphone className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Authenticator App</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Google Authenticator, Authy, etc.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handle2FAToggle}
                                        className={`text-sm font-semibold transition-colors px-4 py-2 rounded-lg ${twoFactorEnabled
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-green-600 hover:bg-green-50 bg-green-50'
                                            }`}
                                    >
                                        {twoFactorEnabled ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Active Sessions</h2>

                                <div className="space-y-4">
                                    {/* Session 1 */}
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-blue-50 rounded-lg">
                                                <Laptop className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">MacBook Pro 16"</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">London, UK • 192.168.1.1</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-green-600">Current Session</span>
                                    </div>

                                    <div className="h-px bg-gray-50" />

                                    {/* Session 2 */}
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-gray-50 rounded-lg">
                                                <Smartphone className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">iPhone 13 Pro</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">London, UK • 192.168.1.45</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-green-600">Active 2h ago</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'notifications' && (
                        <>
                            {/* Email Notifications */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Email Notifications</h2>
                                <p className="text-sm text-gray-500 mb-6">Manage what emails you receive from us.</p>

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
                                            <h3 className="text-sm font-bold text-gray-900">New Booking Requests</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">When a new student books a course</p>
                                        </div>
                                        <Toggle
                                            checked={notifications.bookingRequests}
                                            onChange={(v) => setNotifications({ ...notifications, bookingRequests: v })}
                                        />
                                    </div>
                                    <div className="h-px bg-gray-50" />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Course Updates</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Changes to your course status or approvals</p>
                                        </div>
                                        <Toggle
                                            checked={notifications.courseUpdates}
                                            onChange={(v) => setNotifications({ ...notifications, courseUpdates: v })}
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
                                            <h3 className="text-sm font-bold text-gray-900">SLA Breaches</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Highlight imminent SLA breaches</p>
                                        </div>
                                        <Toggle
                                            checked={notifications.slaBreaches}
                                            onChange={(v) => setNotifications({ ...notifications, slaBreaches: v })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainingProviderProfile;
