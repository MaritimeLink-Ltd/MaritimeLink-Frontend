import { useState } from 'react';
import {
    User,
    Shield,
    Bell,
    Key,
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

const TrainingProviderProfile = () => {
    const [activeTab, setActiveTab] = useState('general');

    const [formData, setFormData] = useState({
        firstName: 'Kingsley',
        lastName: 'Osifo',
        email: 'kingsley@maritimelink.com',
        phone: '+44 7700 900077',
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

    const [notifications, setNotifications] = useState({
        securityAlerts: true,
        bookingRequests: true,
        courseUpdates: true,
        marketing: false,
        desktopSounds: true,
        slaBreaches: true
    });

    const [apiKeys, setApiKeys] = useState([
        { id: 1, name: 'LMS Integration', hint: 'pk_live...92x', created: 'Oct 24, 2024', lastUsed: '2 mins ago' }
    ]);

    const menuItems = [
        { id: 'general', label: 'General Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'api', label: 'API Keys', icon: Key }
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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your personal information and security preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
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

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
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
                                                src="/images/login-image.png"
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-50"
                                            />
                                            <button className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:text-gray-900">
                                                <Camera className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">First Name</label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Last Name</label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Phone Number</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Job Title</label>
                                            <input
                                                type="text"
                                                value={formData.jobTitle}
                                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Department</label>
                                            <input
                                                type="text"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
                                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#003971] hover:bg-[#002455] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </button>
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
                                            placeholder="Confirm Current Password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button className="px-6 py-2.5 bg-[#003971] hover:bg-[#002455] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
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
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                        <CheckCircle className="h-3 w-3" />
                                        Enabled
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
                                    <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                        Disable
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

                    {activeTab === 'api' && (
                        /* API Keys Section */
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">API Keys</h2>
                                    <p className="text-sm text-gray-500 mt-1">Manage API keys for external integrations.</p>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#003971] hover:bg-[#002455] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                                    <Plus className="h-4 w-4" />
                                    Create New Key
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="text-left text-xs font-semibold text-gray-500 pb-3 pl-2">Name</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 pb-3">Key Hint</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 pb-3">Created</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 pb-3">Last Used</th>
                                            <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {apiKeys.map((key) => (
                                            <tr key={key.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 pl-2">
                                                    <span className="text-sm font-bold text-gray-900">{key.name}</span>
                                                </td>
                                                <td className="py-4">
                                                    <code className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">{key.hint}</code>
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-sm text-gray-500">{key.created}</span>
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-sm text-gray-500">{key.lastUsed}</span>
                                                </td>
                                                <td className="py-4 pr-2 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all">
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainingProviderProfile;
