import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    Users,
    CheckCircle,
    AlertTriangle,
    XOctagon,
    Search,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

function JobApplicants({ jobId, onBack, onViewCandidate }) {
    const navigate = useNavigate();
    const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
    const [activeTab, setActiveTab] = useState('new');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        rank: '',
        compliance: 'Compliance',
        seaService: 'Sea Service',
        availability: 'Availability'
    });

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/recruiter-dashboard');
        }
    };

    const jobDetails = {
        title: 'Chief Engineer',
        vessel: 'LNG Tanker',
        posted: 'Posted 2 days ago',
        description: 'We are looking for an experienced Chief Engineer for LNG tanker operations. The candidate should have strong vessel management, safety compliance, and crew leadership experience.'
    };

    const handleOpenJobDetailsPage = () => {
        setShowJobDetailsModal(false);
        navigate(`/admin/jobs/${jobId || '000001'}`, {
            state: {
                jobData: {
                    id: jobId || '000001',
                    title: jobDetails.title,
                    vessel: jobDetails.vessel,
                    posted: jobDetails.posted.replace('Posted ', ''),
                    status: 'Active',
                    description: jobDetails.description
                },
                readOnly: true
            }
        });
    };

    const stats = [
        {
            icon: Users,
            label: 'Total Applicants',
            value: '45',
            subtitle: 'Since 20 Apr 2024',
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-600'
        },
        {
            icon: CheckCircle,
            label: 'Compliance Ready',
            value: '21',
            subtitle: 'Amm days',
            color: 'bg-green-50',
            iconColor: 'text-green-600',
            textColor: 'text-green-600'
        },
        {
            icon: AlertTriangle,
            label: 'Expiring Soon',
            value: '14',
            subtitle: 'Expire in 90 days',
            color: 'bg-orange-50',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-600'
        },
        {
            icon: XOctagon,
            label: 'Not Deployable',
            value: '10',
            subtitle: 'Missing critical certs',
            color: 'bg-red-50',
            iconColor: 'text-red-600',
            textColor: 'text-red-600'
        }
    ];

    const tabs = [
        { id: 'new', label: 'New', count: 2 },
        { id: 'matches', label: 'Matches', count: 2 },
        { id: 'shortlisted', label: 'Shortlisted', count: 2 },
        { id: 'interviewing', label: 'Interviewing', count: 1 },
        { id: 'offered', label: 'Offered', count: 1 },
        { id: 'hired', label: 'Hired', count: 1 }
    ];

    const applicants = [
        {
            id: 1,
            name: 'Sarah Johnson',
            age: 28,
            image: 'https://i.pravatar.cc/150?img=45',
            rank: 'Chief Engineer',
            availability: 'Meyer Avance',
            availabilitySubtext: 'Master',
            compliance: 'Ready',
            complianceColor: 'text-green-600',
            applicationDate: '20 Apr 2024',
            matchPercentage: 80,
            stage: 'new'
        },
        {
            id: 2,
            name: 'Michael Brown',
            age: 34,
            image: 'https://i.pravatar.cc/150?img=12',
            rank: 'Chief Engineer',
            availability: 'BW Pavilion Arches',
            availabilitySubtext: '3rd Officer',
            compliance: 'Expiring Soon',
            complianceSubtext: 'Ends in 2 days',
            complianceColor: 'text-orange-600',
            applicationDate: '20 Apr 2024',
            matchPercentage: 80,
            stage: 'new'
        },
        {
            id: 3,
            name: 'Ali Shahzaib',
            age: 31,
            image: 'https://i.pravatar.cc/150?img=33',
            rank: 'Chief Engineer',
            availability: 'Meyer Avance',
            availabilitySubtext: 'LNG Tanker',
            compliance: 'Ready',
            complianceColor: 'text-green-600',
            applicationDate: '20 Apr 2024',
            matchPercentage: 80,
            stage: 'matches'
        },
        {
            id: 4,
            name: 'James Wilson',
            age: 45,
            image: 'https://i.pravatar.cc/150?img=68',
            rank: 'Chief Engineer',
            availability: 'GasLog Genesis',
            availabilitySubtext: 'LNG Tanker',
            compliance: 'Missing',
            complianceColor: 'text-red-600',
            applicationDate: '20 Apr 2024',
            matchPercentage: 80,
            stage: 'shortlisted'
        },
        {
            id: 5,
            name: 'Omar Farooq',
            age: 29,
            image: 'https://i.pravatar.cc/150?img=52',
            rank: 'Chief Engineer',
            availability: 'CleanTech Spirit',
            availabilitySubtext: 'Offshore Supply Vessel',
            compliance: 'Expiring Soon',
            complianceSubtext: 'Ends in 3 days',
            complianceColor: 'text-orange-600',
            applicationDate: '20 Apr 2024',
            matchPercentage: 80,
            stage: 'matches'
        },
        {
            id: 6,
            name: 'David Chen',
            age: 38,
            image: 'https://i.pravatar.cc/150?img=15',
            rank: 'Chief Engineer',
            availability: 'Pacific Explorer',
            availabilitySubtext: 'LNG Tanker',
            compliance: 'Ready',
            complianceColor: 'text-green-600',
            applicationDate: '19 Apr 2024',
            matchPercentage: 85,
            stage: 'shortlisted'
        },
        {
            id: 7,
            name: 'Emma Rodriguez',
            age: 32,
            image: 'https://i.pravatar.cc/150?img=47',
            rank: 'Chief Engineer',
            availability: 'Atlantic Star',
            availabilitySubtext: 'Container Ship',
            compliance: 'Ready',
            complianceColor: 'text-green-600',
            applicationDate: '18 Apr 2024',
            matchPercentage: 90,
            stage: 'interviewing'
        },
        {
            id: 8,
            name: 'John Smith',
            age: 42,
            image: 'https://i.pravatar.cc/150?img=13',
            rank: 'Chief Engineer',
            availability: 'Nordic Voyager',
            availabilitySubtext: 'LNG Tanker',
            compliance: 'Ready',
            complianceColor: 'text-green-600',
            applicationDate: '17 Apr 2024',
            matchPercentage: 88,
            stage: 'offered'
        },
        {
            id: 9,
            name: 'Maria Santos',
            age: 35,
            image: 'https://i.pravatar.cc/150?img=44',
            rank: 'Chief Engineer',
            availability: 'Ocean Princess',
            availabilitySubtext: 'Cruise Ship',
            compliance: 'Ready',
            complianceColor: 'text-green-600',
            applicationDate: '16 Apr 2024',
            matchPercentage: 92,
            stage: 'hired'
        }
    ];

    // State to track applicant stages (in real app, this would be in backend)
    const [applicantStages, setApplicantStages] = useState(
        applicants.reduce((acc, app) => ({ ...acc, [app.id]: app.stage }), {})
    );

    // Function to move applicant to different stage
    const handleMoveToStage = (applicantId, newStage) => {
        setApplicantStages(prev => ({ ...prev, [applicantId]: newStage }));
    };

    // Filter applicants based on filters only (not by stage)
    const filteredApplicants = applicants.filter(applicant => {
        // Filter by rank (search text)
        if (filters.rank && !applicant.rank.toLowerCase().includes(filters.rank.toLowerCase())) {
            return false;
        }

        // Filter by compliance
        if (filters.compliance !== 'Compliance') {
            if (filters.compliance === 'Ready' && applicant.compliance !== 'Ready') return false;
            if (filters.compliance === 'Expiring Soon' && applicant.compliance !== 'Expiring Soon') return false;
            if (filters.compliance === 'Missing' && applicant.compliance !== 'Missing') return false;
        }

        return true;
    });

    // Function to get action button based on stage
    const getActionButton = (applicant) => {
        const currentStage = applicantStages[applicant.id];
        
        switch (currentStage) {
            case 'new':
                return (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onViewCandidate && onViewCandidate(applicant.id)}
                            className="text-blue-600 font-bold hover:underline text-sm"
                        >
                            View Profile
                        </button>
                        <button 
                            onClick={() => handleMoveToStage(applicant.id, 'shortlisted')}
                            className="bg-[#003971] text-white px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-[#002855] transition-colors"
                        >
                            Shortlist
                        </button>
                    </div>
                );
            case 'matches':
                return (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onViewCandidate && onViewCandidate(applicant.id)}
                            className="text-blue-600 font-bold hover:underline text-sm"
                        >
                            View Profile
                        </button>
                        <button 
                            onClick={() => handleMoveToStage(applicant.id, 'shortlisted')}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-green-700 transition-colors"
                        >
                            Move to Shortlist
                        </button>
                    </div>
                );
            case 'shortlisted':
                return (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onViewCandidate && onViewCandidate(applicant.id)}
                            className="text-blue-600 font-bold hover:underline text-sm"
                        >
                            View Profile
                        </button>
                        <button 
                            onClick={() => handleMoveToStage(applicant.id, 'interviewing')}
                            className="bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-purple-700 transition-colors"
                        >
                            Schedule Interview
                        </button>
                    </div>
                );
            case 'interviewing':
                return (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onViewCandidate && onViewCandidate(applicant.id)}
                            className="text-blue-600 font-bold hover:underline text-sm"
                        >
                            View Profile
                        </button>
                        <button 
                            onClick={() => handleMoveToStage(applicant.id, 'offered')}
                            className="bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-orange-700 transition-colors"
                        >
                            Send Offer
                        </button>
                    </div>
                );
            case 'offered':
                return (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onViewCandidate && onViewCandidate(applicant.id)}
                            className="text-blue-600 font-bold hover:underline text-sm"
                        >
                            View Profile
                        </button>
                        <button 
                            onClick={() => handleMoveToStage(applicant.id, 'hired')}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-green-700 transition-colors"
                        >
                            Mark as Hired
                        </button>
                    </div>
                );
            case 'hired':
                return (
                    <button 
                        onClick={() => onViewCandidate && onViewCandidate(applicant.id)}
                        className="text-blue-600 font-bold hover:underline text-sm"
                    >
                        View Profile
                    </button>
                );
            default:
                return (
                    <button 
                        onClick={() => onViewCandidate && onViewCandidate(applicant.id)}
                        className="text-blue-600 font-bold hover:underline text-sm"
                    >
                        View Profile
                    </button>
                );
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <div className="flex-shrink-0 bg-white px-8 py-6">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                    Back to Jobs
                </button>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{jobDetails.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{jobDetails.vessel}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                {jobDetails.posted}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowJobDetailsModal(true)}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                        >
                            View Job Details
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`${stat.color} rounded-2xl p-6`}>
                            <div className="flex items-center gap-2 mb-4">
                                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                <span className={`text-sm font-semibold ${stat.textColor}`}>{stat.label}</span>
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.subtitle}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'bg-[#003971] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.label} {tab.count > 0 && `(${tab.count})`}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap mb-5">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter by rank"
                        value={filters.rank}
                        onChange={(e) => setFilters({...filters, rank: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                    />
                </div>

                <div className="relative">
                    <select 
                        value={filters.compliance}
                        onChange={(e) => setFilters({...filters, compliance: e.target.value})}
                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
                    >
                        <option>Compliance</option>
                        <option>Ready</option>
                        <option>Expiring Soon</option>
                        <option>Missing</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select 
                        value={filters.seaService}
                        onChange={(e) => setFilters({...filters, seaService: e.target.value})}
                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
                    >
                        <option>Sea Service</option>
                        <option>0-5 years</option>
                        <option>5-10 years</option>
                        <option>10+ years</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select 
                        value={filters.availability}
                        onChange={(e) => setFilters({...filters, availability: e.target.value})}
                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
                    >
                        <option>Availability</option>
                        <option>Immediate</option>
                        <option>Within 30 days</option>
                        <option>Within 90 days</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

                {/* Applicants Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">Applicants</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">Rank</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">Availability</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">Compliance</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">Application Date</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplicants.map((applicant, idx) => (
                                <tr key={applicant.id} className="border-b border-gray-100 hover:bg-[#EBF3FF]/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={applicant.image}
                                                alt={applicant.name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <div className="font-bold text-gray-900">{applicant.name}</div>
                                                <div className="text-xs text-gray-500">Age: {applicant.age}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-900 font-medium">{applicant.rank}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{applicant.availability}</div>
                                            <div className="text-xs text-gray-500">{applicant.availabilitySubtext}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className={`font-bold ${applicant.complianceColor}`}>{applicant.compliance}</div>
                                            {applicant.complianceSubtext && (
                                                <div className="text-xs text-gray-500">{applicant.complianceSubtext}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-900 font-medium">{applicant.applicationDate}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getActionButton(applicant)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-bold">5</span> of <span className="font-bold">45</span> entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-[#003971] hover:border-[#003971] hover:bg-[#EBF3FF] disabled:opacity-50 transition-colors" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {[1, 2, 3, '...', 8].map((page, idx) => (
                                <button
                                    key={idx}
                                    className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-bold transition-colors ${page === 1
                                        ? 'bg-[#003971] text-white'
                                        : page === '...'
                                            ? 'text-gray-400 cursor-default'
                                            : 'border border-gray-200 text-gray-600 hover:bg-[#EBF3FF] hover:border-[#003971] hover:text-[#003971]'
                                        }`}
                                    disabled={page === '...'}
                                >
                                    {page}
                                </button>
                            ))}
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-[#003971] hover:border-[#003971] hover:bg-[#EBF3FF] transition-colors">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showJobDetailsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Job Details</h3>
                        <p className="text-sm text-gray-600 mb-1">
                            {jobDetails.title} • {jobDetails.vessel}
                        </p>
                        <p className="text-sm text-gray-600 mb-5">{jobDetails.posted}</p>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Description</p>
                            <p className="text-sm text-gray-700 leading-6">{jobDetails.description}</p>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowJobDetailsModal(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleOpenJobDetailsPage}
                                className="px-5 py-2.5 rounded-xl font-semibold bg-[#003971] text-white hover:bg-[#002855] transition-colors"
                            >
                                Open Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>    
    );
}

export default JobApplicants;
