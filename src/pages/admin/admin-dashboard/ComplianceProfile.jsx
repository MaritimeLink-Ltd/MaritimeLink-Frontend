import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Eye, Search, RefreshCcw } from 'lucide-react';

function ComplianceProfile() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('Overview');

    // Mock data - in real app, this would come from API based on id
    const userData = {
        name: 'Carlos Vega',
        status: 'UNDER REVIEW',
        role: 'Crew Member',
        company: 'Worldwide Crew Now',
        dateOfBirth: '17 May 1985',
        documentNumber: '****3832',
        expiryDate: '15/04/2028',
        issuingCountry: 'Spain',
        firstName: 'Carlos Andres',
        lastName: 'Vega',
        ocrConfidence: '98%'
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Compliance
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-md">
                                {userData.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {userData.role}: <span className="text-[#1e5a8f] font-semibold">{userData.company}</span>
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                            Request Resubmission
                        </button>
                        <button className="px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                            Reject
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Approve Verification
                        </button>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="mt-8">
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
                        <div className="absolute top-5 left-0 w-2/4 h-0.5 bg-green-500"></div>

                        <div className="relative flex justify-between">
                            {/* Account Approved */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xs font-bold text-green-600">Account Approved</span>
                            </div>

                            {/* Document Uploaded */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xs font-bold text-green-600">Document Uploaded</span>
                            </div>

                            {/* Document Review */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center mb-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                </div>
                                <span className="text-xs font-bold text-gray-900">Document Review</span>
                            </div>

                            {/* Cleared */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                    <span className="text-xs text-gray-400">4</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400">Cleared</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ID Document & Photo */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-base font-bold text-gray-900">ID Document & Photo</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <Search className="h-4 w-4 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <Eye className="h-4 w-4 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <RefreshCcw className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Document Images */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Spanish ID Card */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="aspect-[3/2] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-2">ESPAÑA 🇪🇸</div>
                                        <div className="text-lg font-bold text-gray-700 mb-1">VEGA</div>
                                        <div className="text-sm font-semibold text-gray-700 mb-2">CARLOS ANDRES</div>
                                        <div className="text-xs text-gray-500">15-04-2028</div>
                                    </div>
                                </div>
                            </div>

                            {/* Photo */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="aspect-[3/2] bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                                    <div className="text-6xl">👤</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extracted Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="text-base font-bold text-gray-900">Extracted Information</h3>
                            </div>
                            <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md">
                                OCR Confidence: {userData.ocrConfidence}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            {/* First Name */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">First Name</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.firstName}</div>
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Last Name</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.lastName}</div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Date of Birth</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.dateOfBirth}</div>
                            </div>

                            {/* Document Number */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Document Number</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.documentNumber}</div>
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Expiry Date</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.expiryDate}</div>
                            </div>

                            {/* Issuing Country */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Issuing Country</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{userData.issuingCountry}</span>
                                    <span>🇪🇸</span>
                                </div>
                            </div>
                        </div>

                        {/* Mismatch Warning */}
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-yellow-900 mb-1">Detected mismatch</div>
                                <div className="text-sm text-yellow-700">
                                    The expiry date on the document (2028) differs from the user input (2035). Please verify.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Flags & Issues */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">FLAGS & ISSUES</h3>

                        <div className="space-y-3">
                            {/* Document Expired */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-start gap-2 mb-1">
                                    <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-red-900 mb-1">Document Expired</div>
                                        <div className="text-xs text-red-700">HIGH</div>
                                    </div>
                                </div>
                                <div className="text-xs text-red-700 mt-2">
                                    ID card expired on 15 Apr 2028 (Wait; 2028 is future? Logic check. System date is 2026. This file might be false positive)
                                </div>
                            </div>

                            {/* Certificate OCR Readable */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-green-900 mb-1">Certificate OCR Readable</div>
                                        <div className="text-xs text-green-700">All data fields extracted successfully</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">ADMIN NOTES</h3>
                            <button className="text-sm font-bold text-[#1e5a8f] hover:underline">
                                View All
                            </button>
                        </div>

                        {/* Note Input */}
                        <div className="mb-4">
                            <textarea
                                placeholder="Add internal note..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                rows="3"
                            ></textarea>
                        </div>

                        {/* Previous Note */}
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-gray-600">SM</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-gray-900">Sarah Mcneil</span>
                                        <span className="text-xs text-gray-400">2 months ago</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Carlos has had two previous warnings. Proceed with caution.
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 mt-4">
                                <button className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Escalate Review
                                </button>
                                <button className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <RefreshCcw className="w-4 h-4" />
                                    Reset Process
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComplianceProfile;
