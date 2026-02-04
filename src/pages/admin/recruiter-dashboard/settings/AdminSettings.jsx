import { useState } from 'react';
import { jsPDF } from 'jspdf';
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
    Download,
    Smartphone,
    Monitor
} from 'lucide-react';

function AdminSettings() {
    const [activeSection, setActiveSection] = useState('my-profile');
    const [profileImage, setProfileImage] = useState('/images/login-image.png');

    // Handle invoice download
    const handleDownloadInvoice = () => {
        const doc = new jsPDF();
        
        // Add content to PDF
        doc.setFontSize(20);
        doc.text('INVOICE', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('MaritimeLink', 20, 40);
        doc.text('Invoice #: INV-2026-001', 20, 50);
        doc.text('Date: February 4, 2026', 20, 60);
        doc.text('Due Date: March 4, 2026', 20, 70);
        
        doc.setFontSize(14);
        doc.text('Bill To:', 20, 90);
        doc.setFontSize(11);
        doc.text('Company Name: Musharof Recruiting Agency', 20, 100);
        doc.text('Email: recruiter@example.com', 20, 110);
        
        doc.setFontSize(14);
        doc.text('Invoice Details:', 20, 130);
        
        // Table header
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Description', 20, 145);
        doc.text('Amount', 160, 145);
        
        // Table content
        doc.setFont(undefined, 'normal');
        doc.text('Professional Plan - Monthly', 20, 155);
        doc.text('$99.00', 160, 155);
        
        doc.text('Priority Support', 20, 165);
        doc.text('$29.00', 160, 165);
        
        // Total
        doc.line(20, 175, 190, 175);
        doc.setFont(undefined, 'bold');
        doc.text('Total:', 20, 185);
        doc.text('$128.00', 160, 185);
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text('Thank you for your business!', 105, 250, { align: 'center' });
        doc.text('For questions, contact support@maritimelink.com', 105, 260, { align: 'center' });
        
        // Save PDF
        doc.save(`invoice_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Notification states
    const [notifications, setNotifications] = useState({
        securityAlerts: true,
        newApplications: true,
        candidateMessages: true,
        jobPostings: true,
        marketing: false,
        desktopSounds: true,
        urgentAlerts: true
    });

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
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle profile image removal
    const handleImageRemove = () => {
        setProfileImage('/images/login-image.png');
    };

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
        <div className="space-y-3">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your account settings and preferences</p>
            </div>

            {/* Settings Container */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
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

                {/* Main Content */}
                <div className="lg:col-span-3">
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
                                    <button className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#002855] transition-colors flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </button>
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
                                                className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                <Camera className="h-4 w-4 text-gray-600" />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">Profile Photo</h3>
                                            <p className="text-sm text-gray-500 mb-3">This will be displayed on your profile.</p>
                                            <div className="flex items-center gap-3">
                                                <label
                                                    htmlFor="profile-photo-upload"
                                                    className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                                                >
                                                    Update
                                                </label>
                                                <button
                                                    onClick={handleImageRemove}
                                                    className="text-sm font-medium text-red-600 hover:text-red-700"
                                                >
                                                    Remove
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                <div className="flex items-center justify-between mb-4">
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
                                <div className="space-y-3">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Current Plan</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Manage your subscription and billing details</p>
                                    </div>
                                    <button className="text-[#003971] font-bold text-sm hover:underline">
                                        Professional Plan
                                    </button>
                                </div>

                                {/* Plan Card */}
                                <div className="border border-gray-200 rounded-2xl p-4">
                                    {/* Price */}
                                    <div className="mb-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-gray-900">$299</span>
                                            <span className="text-gray-500">/month</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 mb-4">
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
                                        <button 
                                            onClick={handleDownloadInvoice}
                                            className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Invoice
                                        </button>
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
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Current Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter Current Password"
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter New Password"
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Confirm New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Confirm Current Password"
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
                                            <Check className="h-3 w-3" />
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
                                                    <Monitor className="h-5 w-5 text-blue-600" />
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

                        {/* Notifications Section */}
                        {activeSection === 'notifications' && (
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
                        {activeSection !== 'my-profile' && activeSection !== 'company-profile' && activeSection !== 'billing' && activeSection !== 'security' && activeSection !== 'notifications' && (
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
