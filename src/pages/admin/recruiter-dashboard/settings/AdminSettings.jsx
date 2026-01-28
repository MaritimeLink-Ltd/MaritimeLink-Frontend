import { useState } from 'react';
import {
    User,
    Building2,
    Shield,
    Bell,
    CreditCard,
    Camera,
    Mail,
    Phone,
    Save,
    Globe,
    Linkedin,
    MapPin,
    Check,
    Download
} from 'lucide-react';

function AdminSettings() {
    const [activeSection, setActiveSection] = useState('my-profile');

    const accountSections = [
        { id: 'my-profile', label: 'My Profile', icon: User },
        { id: 'company-profile', label: 'Company Profile', icon: Building2 },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    const preferenceSections = [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard }
    ];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your account settings and preferences</p>
            </div>

            {/* Settings Container */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">
                        {/* Account Section */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Account</h3>
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
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Preferences</h3>
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

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        {/* Personal Information Section */}
                        {activeSection === 'my-profile' && (
                            <div>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Update your photo and personal details here.</p>
                                    </div>
                                    <button className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#002855] transition-colors flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </button>
                                </div>

                                {/* Profile Photo */}
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <div className="flex items-start gap-6">
                                        <div className="relative">
                                            <img
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover"
                                            />
                                            <button className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors">
                                                <Camera className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">Profile Photo</h3>
                                            <p className="text-sm text-gray-500 mb-3">This will be displayed on your profile.</p>
                                            <div className="flex items-center gap-3">
                                                <button className="text-sm font-medium text-gray-700 hover:text-gray-900">Update</button>
                                                <button className="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-5">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                defaultValue="James"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                defaultValue="Anderson"
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
                                                defaultValue="james.anderson@maritimelink.com"
                                                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Phone and Role Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    defaultValue="+44 20 7123 4567"
                                                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                                />
                                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                            <input
                                                type="text"
                                                defaultValue="HR Manager"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Company Profile Section */}
                        {activeSection === 'company-profile' && (
                            <div>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Company Details</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Manage your recruitment agency information.</p>
                                    </div>
                                    <button className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#002855] transition-colors flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        Update Company
                                    </button>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-5">
                                    {/* Company Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Ocean Crewing Services Ltd"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                        />
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                defaultValue="https://oceancrewing.com"
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
                                                defaultValue="https://linkedin.com/company/ocean-crewing"
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
                                                defaultValue="12 Maritime Way"
                                                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* City and County/State */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                defaultValue="London"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">County/State</label>
                                            <input
                                                type="text"
                                                defaultValue="Greater London"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>

                                    {/* Postcode/Zip and Country */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Postcode/Zip</label>
                                            <input
                                                type="text"
                                                defaultValue="EC3R 8AD"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                            <input
                                                type="text"
                                                defaultValue="United Kingdom"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing & Plans Section */}
                        {activeSection === 'billing' && (
                            <div>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Current Plan</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Manage your subscription and billing details</p>
                                    </div>
                                    <button className="text-[#003971] font-bold text-sm hover:underline">
                                        Professional Plan
                                    </button>
                                </div>

                                {/* Plan Card */}
                                <div className="border border-gray-200 rounded-2xl p-6">
                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-gray-900">$299</span>
                                            <span className="text-gray-500">/month</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">Unlimited Job Postings</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">Advanced Candidate Search</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">Priority Support</span>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex items-center gap-3">
                                        <button className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#002855] transition-colors">
                                            Upgrade Plan
                                        </button>
                                        <button className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            Download Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Placeholder for other sections */}
                        {activeSection !== 'my-profile' && activeSection !== 'company-profile' && activeSection !== 'billing' && (
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
