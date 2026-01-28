import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    Edit,
    Pause,
    Upload,
    XCircle,
    Users,
    CheckCircle,
    AlertTriangle,
    XOctagon,
    Search,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

function JobApplicants() {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [activeTab, setActiveTab] = useState('new');
    const [currentPage, setCurrentPage] = useState(1);

    const jobDetails = {
        title: 'Chief Engineer',
        vessel: 'LNG Tanker',
        posted: 'Posted 2 days ago'
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
        { id: 'new', label: 'New', count: 12 },
        { id: 'matches', label: 'Matches', count: 4 },
        { id: 'shortlisted', label: 'Shortlisted', count: 6 },
        { id: 'interviewing', label: 'Interviewing', count: 0 },
        { id: 'offered', label: 'Offered', count: 0 },
        { id: 'hired', label: 'Hired', count: 0 }
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
            matchPercentage: 80
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
            matchPercentage: 80
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
            matchPercentage: 80
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
            matchPercentage: 80
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
            matchPercentage: 80
        }
    ];

    return (
        <div className="space-y-5">
            {/* Back Button */}
            <button
                onClick={() => navigate('/admin/jobs')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
                <ChevronLeft className="h-5 w-5" />
                Back to Jobs
            </button>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{jobDetails.title}</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{jobDetails.vessel}</span>
                        <span>•</span>
                        <span>{jobDetails.posted}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Job
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Pause className="h-4 w-4" />
                        Pause
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Publish
                    </button>
                    <button className="px-4 py-2 border border-red-200 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Close Job
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`${stat.color} rounded-2xl p-5 border border-gray-100`}>
                        <div className="flex items-center gap-3 mb-3">
                            <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                            <span className={`text-sm font-bold ${stat.textColor}`}>{stat.label}</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.subtitle}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-[#003971] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter by rank"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                    />
                </div>

                <div className="relative">
                    <select className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer">
                        <option>Compliance</option>
                        <option>Ready</option>
                        <option>Expiring Soon</option>
                        <option>Missing</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer">
                        <option>Sea Service</option>
                        <option>0-5 years</option>
                        <option>5-10 years</option>
                        <option>10+ years</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer">
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
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Applicants</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Rank</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Availability</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Compliance</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Match</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map((applicant, idx) => (
                                <tr key={applicant.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
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
                                        <span className="text-gray-900 font-bold">{applicant.matchPercentage}%</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 font-bold hover:underline text-sm">
                                            Invite To Apply
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-bold">5</span> of <span className="font-bold">45</span> entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {[1, 2, 3, '...', 8].map((page, idx) => (
                            <button
                                key={idx}
                                className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-bold transition-colors ${page === 1
                                    ? 'bg-[#003971] text-white'
                                    : page === '...'
                                        ? 'text-gray-400 cursor-default'
                                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                disabled={page === '...'}
                            >
                                {page}
                            </button>
                        ))}
                        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JobApplicants;
