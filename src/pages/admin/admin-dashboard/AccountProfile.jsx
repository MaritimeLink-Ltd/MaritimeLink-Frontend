import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Users, CheckCircle, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';

function AccountProfile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');
    const [timeFilter, setTimeFilter] = useState('Today');

    const tabs = ['Overview', 'Submitted Details', 'Documents (0)', 'KYC', 'Activity Log', 'Admin Notes'];
    const timeFilters = ['Today', '7 Days', '30 Days'];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Accounts
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        {/* Profile Picture */}
                        <div className="relative">
                            <img
                                src="https://via.placeholder.com/80"
                                alt="David Turner"
                                className="w-20 h-20 rounded-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">David Turner</h1>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                                    RECRUITER
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                                Recruiter at <span className="text-[#1e5a8f] font-semibold">Oceanhire Agency</span>
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Applied: Oct 24, 2023
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    IP: 192.168.1.1 (London, UK)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Time Filter */}
                    <div className="bg-gray-50 p-1 rounded-xl inline-flex border border-gray-100">
                        {timeFilters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${timeFilter === filter
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200 mt-6 -mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab
                                ? 'text-[#1e5a8f]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Active Jobs */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-sm font-semibold text-gray-600">Active Jobs</div>
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Briefcase className="h-5 w-5 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
                                    <div className="text-xs font-semibold text-green-600">+2 this week</div>
                                </div>

                                {/* Candidates Hired */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-sm font-semibold text-gray-600">Candidates Hired</div>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Users className="h-5 w-5 text-green-500" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">8</div>
                                </div>
                            </div>

                            {/* Account Status Overview */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-4">Account Status Overview</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Stage 1 */}
                                    <div className="bg-blue-50 rounded-xl p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#1e5a8f] rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">01</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Stage 1: Approval</div>
                                                    <div className="text-xs text-gray-600">Basic Account Setup</div>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                COMPLETED
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-700">Email Verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-700">Phone Verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-700">Company Details Submitted</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stage 2 */}
                                    <div className="bg-orange-50 rounded-xl p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white border-2 border-orange-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-700 font-bold text-sm">02</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Stage 2: KYC</div>
                                                    <div className="text-xs text-gray-600">Identity Verification</div>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                PENDING
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                                                <span className="text-gray-500">ID Document Upload</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                                                <span className="text-gray-500">Address Verification</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Documents */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-bold text-gray-900">Recent Documents</h3>
                                    <button className="text-sm font-bold text-[#1e5a8f] hover:underline">
                                        View All
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* Document 1 */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-50 rounded-lg">
                                                <FileText className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">Company_Registration.pdf</div>
                                                <div className="text-xs text-gray-500">Uploaded 2 days ago • 2.4 MB</div>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                                            View
                                        </button>
                                    </div>

                                    {/* Document 2 */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <ImageIcon className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">Proof_of_Address.jpg</div>
                                                <div className="text-xs text-gray-500">Uploaded 2 days ago • 3.5 MB</div>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Submitted Details' && (
                        <>
                            {/* Stage Header with Approve Button */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <span className="text-[#1e5a8f] font-bold text-sm">01</span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">Stage 1: Account Approval</h3>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors">
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative">
                                    {/* Line */}
                                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
                                    <div className="absolute top-5 left-0 w-1/3 h-0.5 bg-blue-500"></div>

                                    <div className="relative flex justify-between">
                                        {/* STAGE 1 - Completed */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">STAGE 1</span>
                                        </div>

                                        {/* REVIEW - Current */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center mb-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">REVIEW</span>
                                        </div>

                                        {/* KYC - Pending */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                                <span className="text-xs text-gray-400">3</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">KYC</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Details */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Details</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Full Name</label>
                                        <div className="text-sm font-semibold text-gray-900">David Turner</div>
                                    </div>

                                    {/* Email Address */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Email Address</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">david.t@oceanhire.com</span>
                                            <span className="text-xs font-semibold text-green-600">(Verified)</span>
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Phone Number</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">+44 7700 900077</span>
                                            <span className="text-xs font-semibold text-green-600">(Verified)</span>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Role</label>
                                        <div className="text-sm font-semibold text-gray-900">Senior Recruiter</div>
                                    </div>
                                </div>
                            </div>

                            {/* Company Information */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Information</h3>
                                </div>

                                <div className="space-y-5">
                                    {/* Company Name */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Company Name</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">Oceanhire Agency Ltd</span>
                                                <span className="text-xs font-semibold text-blue-600">(Claimed)</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Website & Social</label>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-semibold text-blue-600">oceanhire.com</span>
                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Address</label>
                                        <div className="text-sm font-semibold text-gray-900">
                                            71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
                                        </div>
                                    </div>

                                    {/* Plan Tier */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Plan Tier</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">Pro Plan</span>
                                            <span className="text-xs text-gray-500">(Billed Annually)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance Declaration */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compliance Declaration</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Declaration 1 */}
                                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">I confirm I am authorized to represent this company</span>
                                    </div>

                                    {/* Declaration 2 */}
                                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">I accept the Terms of Service and Privacy Policy</span>
                                    </div>

                                    {/* Declaration 3 */}
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-gray-700">
                                            Heard about us via: <span className="font-semibold">LinkedIn Advertisement</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4">
                                <button className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                                    Cancel review
                                </button>
                                <div className="flex items-center gap-3">
                                    <button className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                                        Reject Account
                                    </button>
                                    <button className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Approve Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Documents (0)' && (
                        <>
                            {/* Documents Header */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-6">Documents</h3>

                                {/* Document Cards Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Document 1 - Company Registration */}
                                    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Document Thumbnail */}
                                        <div className="aspect-[4/3] bg-gray-100 relative">
                                            <img
                                                src="https://images.unsplash.com/photo-1554224311-beee460c201e?w=400&h=300&fit=crop"
                                                alt="Document preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Document Info */}
                                        <div className="p-4">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                                CERTIFICATE
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 mb-1">
                                                Company_Registration_Cert.pdf
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                2.4 MB • Oct 24, 2023
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document 2 - VAT Certificate */}
                                    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Document Thumbnail */}
                                        <div className="aspect-[4/3] bg-gray-100 relative">
                                            <img
                                                src="https://images.unsplash.com/photo-1586282391129-76a6df230234?w=400&h=300&fit=crop"
                                                alt="Document preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Document Info */}
                                        <div className="p-4">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                                TAX DOCUMENT
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 mb-1">
                                                VAT_Certificate_2023.pdf
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                1.1 MB • Oct 24, 2023
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'KYC' && (
                        <>
                            {/* KYC Header */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                                            <span className="text-gray-500 font-bold text-sm">02</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">Stage 2: KYC Verification</h3>
                                            <p className="text-xs text-gray-500">Identity verification process</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-md">
                                            AWAITING SUBMISSION
                                        </span>
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-md">
                                            Not yet submitted
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Warning Message */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                                                KYC not yet submitted by the user
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                When this user completes their KYC submission, you will be able to review and verify their identity documents here.
                                            </p>

                                            {/* Required Documents Badges */}
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    ID Document
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Address Verification
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-6">
                                <button className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                                    Cancel review
                                </button>
                                <div className="flex items-center gap-3">
                                    <button className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                                        Reject Account
                                    </button>
                                    <button className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Approve Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Activity Log' && (
                        <>
                            {/* Activity Log */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-6">Activity Log</h3>

                                <div className="space-y-6">
                                    {/* Activity 1 - Email Verified */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Email Verified</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    2 hours ago
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">User verified email via magic link</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: System
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 2 - Account Created */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Account Created</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    2 hours ago
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">User registered via Sign Up page</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: David Turner
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 3 - Login Attempt */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Login Attempt</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    1 hour ago
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">Successful login from IP 192.168.1.1</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: David Turner
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 4 - Profile Updated */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Profile Updated</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    45 mins ago
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">Company information modified</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: David Turner
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 5 - Stage 1 Review Started */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Stage 1 Review Started</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Just now
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">Admin opened profile for review</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: John (Admin)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Admin Notes' && (
                        <>
                            {/* Admin Notes */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-base font-bold text-gray-900">Admin Notes</h3>
                                    <button className="px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add New Note
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {/* Note 1 - John (Admin) */}
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-gray-600">JA</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-bold text-gray-900">John (Admin)</span>
                                                <span className="text-xs text-gray-400">2 hours ago</span>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    Domain matched with corporate registry. Phone verification passed via OTP. Pending manual review of certification documents.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Note 2 - Sarah (Support) */}
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-gray-600">SS</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-bold text-gray-900">Sarah (Support)</span>
                                                <span className="text-xs text-gray-400">Yesterday</span>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    Requested updated VAT certificate as the uploaded one was blurry.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Add New Note */}
                                <div className="flex gap-4 pt-6 border-t border-gray-200">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-blue-600">YOU</span>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            placeholder="Write an internal note..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                            rows="3"
                                        ></textarea>
                                        <div className="flex justify-end mt-3">
                                            <button className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                                                Post Note
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Risk Analysis */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Risk Analysis</h3>
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>

                        {/* High Risk Alert */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm font-bold text-orange-900">High Risk Detected</div>
                            </div>
                            <p className="text-xs text-orange-700">
                                New domain registered (less than 30 days). Low social footprint.
                            </p>
                        </div>

                        {/* Risk Factors */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">IP Reputation</span>
                                <span className="font-semibold text-green-600">Clean</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Email Domain</span>
                                <span className="font-semibold text-green-600">Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Admin Notes</h3>
                            <button className="text-sm font-bold text-[#1e5a8f] hover:underline">
                                Edit
                            </button>
                        </div>

                        {/* Note */}
                        <div className="mb-4">
                            <div className="flex items-start gap-3 mb-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-gray-600">JA</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-gray-900">John (Admin)</span>
                                        <span className="text-xs text-gray-400">2 hrs ago</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        "Domain matched with corporate registry. Phone verification passed via OTP. Pending manual review of certification documents."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                            + Add Note
                        </button>
                    </div>

                    {/* Application Timeline */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Application Timeline</h3>

                        <div className="space-y-4">
                            {/* Timeline Item 1 */}
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="text-sm font-semibold text-gray-900 mb-0.5">Stage 1 Review Started</div>
                                    <div className="text-xs text-gray-500 mb-1">David Turner profile opened by Admin</div>
                                    <div className="text-xs text-gray-400">Just now</div>
                                </div>
                            </div>

                            {/* Timeline Item 2 */}
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="text-sm font-semibold text-gray-900 mb-0.5">Email Verified</div>
                                    <div className="text-xs text-gray-500 mb-1">User verified email via magic link</div>
                                    <div className="text-xs text-gray-400">2 hours ago</div>
                                </div>
                            </div>

                            {/* Timeline Item 3 */}
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-900 mb-0.5">Registered</div>
                                    <div className="text-xs text-gray-500 mb-1">Account created via Sign Up</div>
                                    <div className="text-xs text-gray-400">2 hours ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountProfile;
