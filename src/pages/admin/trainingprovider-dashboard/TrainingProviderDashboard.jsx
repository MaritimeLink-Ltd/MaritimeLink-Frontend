import { useState } from 'react';
import {
    BookOpen,
    Calendar,
    TrendingUp,
    Users,
    Clock,
    ChevronRight,
    MoreVertical,
    AlertCircle,
    BookMarked
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import VerifyIdentityModal from '../../../components/modals/VerifyIdentityModal';
import SelectDocumentModal from '../../../components/modals/SelectDocumentModal';
import UploadDocumentModal from '../../../components/modals/UploadDocumentModal';
import VerifyDetailsModal from '../../../components/modals/VerifyDetailsModal';
import TakeSelfieModal from '../../../components/modals/TakeSelfieModal';
import ProcessingDocumentModal from '../../../components/modals/ProcessingDocumentModal';
import VerificationSubmittedModal from '../../../components/modals/VerificationSubmittedModal';
import { useKycWizard } from '../../../hooks/useKycWizard';

function TrainingProviderDashboard() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [timeFilter, setTimeFilter] = useState('7 Days');

    const {
        kycStatus,
        isKycUnderReview,
        hasFullAccess,
        ui: {
            showVerifyIdentityModal,
            showSelectDocumentModal,
            showUploadDocumentModal,
            showVerifyDetailsModal,
            showTakeSelfieModal,
            showProcessingModal,
            showVerificationSubmittedModal,
            selectedDocumentType,
            kycData,
        },
        actions: {
            handleStartVerification,
            handleSelectDocument,
            handleDocumentUploaded,
            handleDetailsVerified,
            handleSelfieTaken,
            handleVerificationComplete,
            handleSkipVerification,
            setShowSelectDocumentModal,
            setShowUploadDocumentModal,
            setShowVerifyDetailsModal,
            setShowTakeSelfieModal,
        },
    } = useKycWizard({ userType: 'training-provider', storagePrefix: 'trainingProvider' });

    const timeFilters = ['Today', '7 Days', '30 Days'];

    const isPreKyc = !kycStatus || kycStatus === 'pending' || kycStatus === 'rejected' || kycStatus === 'skipped';

    const renderKycGate = () => {
        if (isKycUnderReview) {
            return (
                <div className="h-full flex items-center justify-center p-8">
                    <div className="max-w-2xl text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#003971] mb-4">
                            Welcome to MaritimeLink
                        </h1>
                        <p className="text-gray-600 mb-2">Thanks for submitting your KYC details.</p>
                        <p className="text-gray-500">
                            Your information and documents are currently under review by our team.
                            Once verification is complete, you will be granted full access to your training provider dashboard.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="max-w-2xl text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#003971]">
                        Welcome to MaritimeLink
                    </h1>
                    <p className="text-gray-600">Thanks for joining us.</p>
                    <p className="text-gray-500">
                        Before you can manage courses and sessions, we need to complete a quick KYC
                        check for your training center. Complete verification to unlock all features.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={handleStartVerification}
                            className="inline-flex items-center px-6 py-3 rounded-full bg-[#003971] text-white font-semibold text-sm hover:bg-[#002455] transition-colors"
                        >
                            Start verification
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Stats cards data based on time filter
    const statsData = {
        'Today': [
            { id: 1, title: 'Active Courses', value: '5', subtitle: 'Active Courses', icon: BookOpen, bgGradient: 'from-[#1E4976] to-[#2E6BA8]', iconBg: 'bg-white/20', path: '/trainingprovider/courses' },
            { id: 2, title: 'New Bookings', value: '4', subtitle: 'Today', icon: Calendar, bgGradient: 'from-[#0FA968] to-[#1BC47D]', iconBg: 'bg-white/20', path: '/trainingprovider/bookings' },
            { id: 3, title: 'Demand Signals', value: '1', subtitle: 'Today', icon: TrendingUp, bgGradient: 'from-[#E86C5F] to-[#F28B7D]', iconBg: 'bg-white/20', path: '/trainingprovider/demand' }
        ],
        '7 Days': [
            { id: 1, title: 'Active Courses', value: '5', subtitle: 'Active Courses', icon: BookOpen, bgGradient: 'from-[#1E4976] to-[#2E6BA8]', iconBg: 'bg-white/20', path: '/trainingprovider/courses' },
            { id: 2, title: 'New Bookings', value: '18', subtitle: 'New Bookings', icon: Calendar, bgGradient: 'from-[#0FA968] to-[#1BC47D]', iconBg: 'bg-white/20', path: '/trainingprovider/bookings' },
            { id: 3, title: 'Demand Signals', value: '4', subtitle: 'Demand Signals', icon: TrendingUp, bgGradient: 'from-[#E86C5F] to-[#F28B7D]', iconBg: 'bg-white/20', path: '/trainingprovider/demand' }
        ],
        '30 Days': [
            { id: 1, title: 'Active Courses', value: '5', subtitle: 'Active Courses', icon: BookOpen, bgGradient: 'from-[#1E4976] to-[#2E6BA8]', iconBg: 'bg-white/20', path: '/trainingprovider/courses' },
            { id: 2, title: 'New Bookings', value: '67', subtitle: 'This Month', icon: Calendar, bgGradient: 'from-[#0FA968] to-[#1BC47D]', iconBg: 'bg-white/20', path: '/trainingprovider/bookings' },
            { id: 3, title: 'Demand Signals', value: '12', subtitle: 'This Month', icon: TrendingUp, bgGradient: 'from-[#E86C5F] to-[#F28B7D]', iconBg: 'bg-white/20', path: '/trainingprovider/demand' }
        ]
    };

    // Get current stats based on time filter
    const statsCards = statsData[timeFilter] || statsData['7 Days'];

    const actionItems = [
        {
            id: 1,
            icon: Users,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            title: '12 learners waiting for Advanced Engineering Courses',
            subtitle: 'Next session: 10-12 June, Aberdeen',
            hasButton: false,
            path: '/trainingprovider/courses'
        },
        {
            id: 2,
            icon: BookMarked,
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-50',
            title: 'Energy Efficiency Program is 90% full',
            subtitle: 'Next session: 24-26 May, Aberdeen',
            hasButton: true,
            buttonText: 'View Bookings',
            buttonStyle: 'bg-[#003971] text-white hover:bg-[#002455]',
            path: '/trainingprovider/bookings'
        },
        {
            id: 3,
            icon: Clock,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50',
            title: '3 sessions need scheduling',
            subtitle: 'Marine Electricals • Offshore Safety > Energy Audits',
            hasButton: true,
            buttonText: 'Add Session',
            buttonStyle: 'bg-white text-orange-600 border-2 border-orange-200 hover:bg-orange-50',
            path: '/trainingprovider/courses'
        },
        {
            id: 4,
            icon: TrendingUp,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            title: 'High demand detected in Aberdeen',
            subtitle: '67 professionals need renewal in 30 days',
            hasButton: true,
            buttonText: 'View Demand',
            buttonStyle: 'bg-[#003971] text-white hover:bg-[#002455]',
            path: '/trainingprovider/demand'
        }
    ];

    const courses = [
        {
            id: 1,
            name: 'STCW Basic Safety',
            icon: Users,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            status: 'Nearly Full',
            statusColor: 'bg-orange-100 text-orange-700',
            capacity: '17 / 18'
        },
        {
            id: 2,
            name: 'Advanced Firefighting',
            icon: AlertCircle,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50',
            status: 'Nearly Full',
            statusColor: 'bg-orange-100 text-orange-700',
            capacity: '17 / 18'
        },
        {
            id: 3,
            name: 'Energy Efficiency',
            icon: BookOpen,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-50',
            status: 'Open',
            statusColor: 'bg-green-100 text-green-700',
            capacity: '17 / 20'
        }
    ];

    return (
        <div className="h-full pb-6">
            <div className="bg-[#F5F7FA] pb-4">
                {/* Welcome Section */}
                <div className="mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-[28px] font-bold text-gray-900 mb-1">Welcome Kingsley</h1>
                            <p className="text-gray-500 text-sm">Your training operations at a glance</p>
                        </div>
                        <div className="flex items-center gap-3">
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
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">Kingsley Osifo</p>
                                <p className="text-xs text-gray-500">Training Provider Manager</p>
                            </div>
                            <img
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                src="/images/login-image.webp"
                                alt="User avatar"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-8">
                {hasFullAccess ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                            {statsCards.map((card) => (
                                <div
                                    key={card.id}
                                    onClick={() => navigate(card.path)}
                                    className={`bg-gradient-to-br ${card.bgGradient} rounded-[20px] p-6 text-white shadow-md cursor-pointer active:scale-[0.98] relative`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`${card.iconBg} p-3 rounded-xl`}>
                                            <card.icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[40px] font-bold leading-none">{card.value}</h3>
                                        <p className="text-white/95 text-base font-medium">{card.subtitle}</p>
                                        <p className="text-white/70 text-xs">{card.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Required and Quick Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Action Required - 60% width (3 columns) */}
                            <div className="lg:col-span-3">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Action Required</h2>
                                <div className="space-y-3">
                                    {actionItems.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => item.path && navigate(item.path)}
                                            className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${item.path ? 'cursor-pointer' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className={`${item.iconBg} p-2.5 rounded-lg flex-shrink-0`}>
                                                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 leading-relaxed">{item.subtitle}</p>
                                                    </div>
                                                </div>
                                                {item.hasButton && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(item.path);
                                                        }}
                                                        className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all flex-shrink-0 ${item.buttonStyle}`}
                                                    >
                                                        <span>{item.buttonText}</span>
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Overview - 40% width (2 columns) */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-full">
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-lg font-bold text-gray-900">Quick Overview</h2>
                                    </div>

                                    {/* Table Header */}
                                    <div className="flex justify-between pb-3 mb-4 border-b border-gray-200">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            COURSE
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            STATUS / CAPACITY
                                        </div>
                                    </div>

                                    {/* Course List */}
                                    <div className="space-y-3">
                                        {courses.map((course, index) => (
                                            <div
                                                key={course.id}
                                                onClick={() => navigate(`/trainingprovider/courses/${course.id}`)}
                                                className={`flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2 ${index !== courses.length - 1 ? 'border-b border-gray-100' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`${course.iconBg} p-2.5 rounded-lg`}>
                                                        <course.icon className={`h-5 w-5 ${course.iconColor}`} />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {course.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${course.statusColor}`}>
                                                        {course.status}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-700 min-w-[55px] text-right">
                                                        {course.capacity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* View All Courses Link */}
                                    <div className="mt-5 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => navigate('/trainingprovider/courses')}
                                            className="w-full text-center text-sm font-bold text-[#003971] hover:text-[#002455] transition-colors"
                                        >
                                            View All Courses
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    renderKycGate()
                )}
            </div>

            {/* KYC Modals */}
            <VerifyIdentityModal
                isOpen={showVerifyIdentityModal}
                onClose={handleSkipVerification}
                onStartVerification={handleStartVerification}
            />
            <SelectDocumentModal
                isOpen={showSelectDocumentModal}
                onClose={() => setShowSelectDocumentModal(false)}
                onSelectDocument={handleSelectDocument}
            />
            <UploadDocumentModal
                isOpen={showUploadDocumentModal}
                onClose={() => setShowUploadDocumentModal(false)}
                onUploadComplete={handleDocumentUploaded}
                documentType={selectedDocumentType}
                userType="training-provider"
            />
            <VerifyDetailsModal
                isOpen={showVerifyDetailsModal}
                onClose={() => setShowVerifyDetailsModal(false)}
                onConfirm={handleDetailsVerified}
                initialData={kycData}
                documentType={selectedDocumentType}
            />
            <TakeSelfieModal
                isOpen={showTakeSelfieModal}
                onClose={() => setShowTakeSelfieModal(false)}
                onSelfieTaken={handleSelfieTaken}
            />
            <ProcessingDocumentModal
                isOpen={showProcessingModal}
            />
            <VerificationSubmittedModal
                isOpen={showVerificationSubmittedModal}
                onClose={handleVerificationComplete}
            />
        </div>
    );
}

export default TrainingProviderDashboard;
