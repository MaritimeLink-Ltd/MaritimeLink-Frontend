import { useState } from 'react';
import {
    Search,
    Filter,
    MapPin,
    Clock,
    ChevronDown,
    FileText,
    List,
    Grid3x3,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminSearch({ onViewCandidate }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [sortBy, setSortBy] = useState('Best Matches');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(true);
    const itemsPerPage = 10;

    const [filters, setFilters] = useState({
        rankPosition: [],
        experienceLevel: [],
        vesselType: []
    });

    const rankPositions = ['Master', 'Chief Officer', 'Chief Engineer', '2nd Engineer', '3rd Officer', 'Electrician'];
    const experienceLevels = ['0-2 years', '3-5 years', '6-10 years', '10+ years'];
    const vesselTypes = ['Tanker', 'Container', 'Bulk Carrier', 'Offshore', 'Cruise Ship'];

    const candidates = [
        {
            id: 1,
            name: "Alex Morgan",
            rank: "Chief Engineer",
            experience: "15 years",
            location: "UK",
            matchPercentage: 92,
            verified: true,
            image: "https://i.pravatar.cc/150?img=12",
            vesselTypes: ["Tanker", "Bulk Carrier"]
        },
        {
            id: 2,
            name: "Sarah Chen",
            rank: "2nd Officer",
            experience: "8 years",
            location: "Singapore",
            matchPercentage: 88,
            verified: true,
            image: "https://i.pravatar.cc/150?img=45",
            vesselTypes: ["Container", "Cruise Ship"]
        },
        {
            id: 3,
            name: "Marcus Johnson",
            rank: "Master",
            experience: "22 years",
            location: "USA",
            matchPercentage: 85,
            verified: true,
            image: "https://i.pravatar.cc/150?img=33",
            vesselTypes: ["Tanker", "Offshore"]
        },
        {
            id: 4,
            name: "Felipe Rodriguez",
            rank: "Electrician (ETO)",
            experience: "6 years",
            location: "Philippines",
            matchPercentage: 78,
            verified: false,
            image: "https://i.pravatar.cc/150?img=68",
            vesselTypes: ["Offshore", "Container"]
        },
        {
            id: 5,
            name: "Emma Wilson",
            rank: "3rd Officer",
            experience: "5 years",
            location: "Australia",
            matchPercentage: 82,
            verified: true,
            image: "https://i.pravatar.cc/150?img=47",
            vesselTypes: ["Bulk Carrier", "Container"]
        },
        {
            id: 6,
            name: "David Martinez",
            rank: "Chief Officer",
            experience: "12 years",
            location: "Spain",
            matchPercentage: 90,
            verified: true,
            image: "https://i.pravatar.cc/150?img=15",
            vesselTypes: ["Cruise Ship", "Tanker"]
        }
    ];

    const filteredCandidates = candidates.filter(candidate => {
        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!candidate.name.toLowerCase().includes(query) &&
                !candidate.rank.toLowerCase().includes(query)) {
                return false;
            }
        }

        // Rank Filter
        if (filters.rankPosition.length > 0 && !filters.rankPosition.includes(candidate.rank)) {
            return false;
        }

        // Experience Filter (Simplified matching for demo - ideally parse range)
        if (filters.experienceLevel.length > 0) {
            // This is a basic text match for the demo as the data matches the options.
            // In a real app, you'd parse "15 years" to a number and check range.
            // For now, let's assume direct match or partial match if needed, but data "15 years" doesn't match "10+ years" directly.
            // Let's implement a simple parser for better UX or just strict match if data aligns.
            // Given the mock data: "15 years" vs "10+ years".
            // Let's just check if any selected filter loosely matches or if we need custom logic.
            // Custom logic:
            const years = parseInt(candidate.experience);
            const matchesAny = filters.experienceLevel.some(level => {
                if (level === '0-2 years') return years >= 0 && years <= 2;
                if (level === '3-5 years') return years >= 3 && years <= 5;
                if (level === '6-10 years') return years >= 6 && years <= 10;
                if (level === '10+ years') return years > 10;
                return false;
            });
            if (!matchesAny) return false;
        }

        // Vessel Type Filter
        if (filters.vesselType.length > 0) {
            // Check if candidate has any of the selected vessel types
            const hasMatchingVessel = filters.vesselType.some(selectedVessel =>
                candidate.vesselTypes && candidate.vesselTypes.includes(selectedVessel)
            );
            if (!hasMatchingVessel) return false;
        }

        return true;
    });

    // Sort filtered candidates based on sortBy selection
    const sortedCandidates = [...filteredCandidates].sort((a, b) => {
        switch (sortBy) {
            case 'Best Matches':
                return b.matchPercentage - a.matchPercentage;
            case 'Experience (High to Low)':
                return parseInt(b.experience) - parseInt(a.experience);
            case 'Experience (Low to High)':
                return parseInt(a.experience) - parseInt(b.experience);
            case 'Alphabetical':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    const totalCandidates = sortedCandidates.length;
    const totalPages = Math.ceil(totalCandidates / itemsPerPage);
    
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCandidates = sortedCandidates.slice(indexOfFirstItem, indexOfLastItem);
    
    // Handle page change
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };
    
    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-gray-50">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-8 pt-4 pb-3 bg-gray-50">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Search Candidates</h1>
                        <p className="text-gray-600 mt-1 text-sm font-medium">Find qualified maritime professionals for your vessels</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full lg:w-[420px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by rank, name, certification..."
                            className="w-full pl-12 pr-14 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#003971] text-white p-2 rounded-lg hover:bg-[#002855] transition-colors">
                            <Search className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden px-8 pb-4">
                <div className="flex flex-col lg:flex-row gap-4 h-full">
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Controls Bar */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 flex-shrink-0">
                            <div className="text-sm font-bold text-gray-900">Showing {totalCandidates} candidates</div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 font-semibold">Sort by:</span>
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option>Best Matches</option>
                                        <option>Experience (High to Low)</option>
                                        <option>Experience (Low to High)</option>
                                        <option>Alphabetical</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>

                                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-[#003971]' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        <List className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-[#003971]' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        <Grid3x3 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Candidate Cards - List View */}
                        {viewMode === 'list' && (
                            <div className="space-y-2 flex-1 overflow-y-auto">
                                {currentCandidates.map((candidate) => (
                                    <div key={candidate.id} className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between gap-4">
                                        {/* Left: Avatar & Info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={candidate.image}
                                                    alt={candidate.name}
                                                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-100"
                                                />
                                                {candidate.verified && (
                                                    <div className="absolute -bottom-1 -right-1 bg-[#003971] rounded-full p-1">
                                                        <svg className="h-3 w-3 text-white fill-current" viewBox="0 0 20 20">
                                                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="text-base font-bold text-gray-900">{candidate.name}</h3>
                                                        {candidate.verified && (
                                                            <svg className="h-4 w-4 text-[#1DA1F2] fill-current flex-shrink-0" viewBox="0 0 20 20">
                                                                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 font-semibold mb-1">{candidate.rank}</p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>{candidate.experience}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            <span>{candidate.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Match & Button */}
                                            <div className="flex items-center gap-5">
                                                <div className="text-right">
                                                    <div className="text-2xl font-extrabold text-[#003971]">{candidate.matchPercentage}%</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Match</div>
                                                </div>
                                                <button
                                                    onClick={() => onViewCandidate ? onViewCandidate(candidate.id) : navigate(`/admin/candidate/${candidate.id}`)}
                                                    className="bg-[#003971] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#002855] transition-colors flex items-center gap-2 whitespace-nowrap"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    View Summary
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Candidate Cards - Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 flex-1 overflow-y-auto">
                            {currentCandidates.map((candidate) => (
                                <div key={candidate.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col items-center text-center">
                                        {/* Avatar */}
                                        <div className="relative mb-4">
                                            <img
                                                src={candidate.image}
                                                alt={candidate.name}
                                                className="h-16 w-16 rounded-full object-cover border-2 border-gray-100"
                                            />
                                            {candidate.verified && (
                                                <div className="absolute -bottom-1 -right-1 bg-[#003971] rounded-full p-1.5">
                                                    <svg className="h-3 w-3 text-white fill-current" viewBox="0 0 20 20">
                                                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                                        {/* Name */}
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <h3 className="text-base font-bold text-gray-900">{candidate.name}</h3>
                                            {candidate.verified && (
                                                <svg className="h-4 w-4 text-[#1DA1F2] fill-current flex-shrink-0" viewBox="0 0 20 20">
                                                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Rank */}
                                        <p className="text-sm text-gray-600 font-semibold mb-4">{candidate.rank}</p>

                                        {/* Match Percentage */}
                                        <div className="text-2xl font-extrabold text-[#003971] mb-1">{candidate.matchPercentage}%</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">Match</div>

                                        {/* Experience & Location */}
                                        <div className="grid grid-cols-2 gap-4 w-full mb-4 py-3 border-t border-b border-gray-100">
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">EXP</div>
                                                <div className="text-sm font-bold text-gray-900">{candidate.experience.replace(' years', ' Yrs')}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Location</div>
                                                <div className="text-sm font-bold text-gray-900">{candidate.location}</div>
                                            </div>
                                        </div>

                                        {/* Button */}
                                        <button
                                            onClick={() => onViewCandidate ? onViewCandidate(candidate.id) : navigate(`/admin/candidate/${candidate.id}`)}
                                            className="w-full bg-[#003971] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#002855] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}

                        {/* Pagination */}
                        <div className="flex items-center justify-between pt-2 flex-shrink-0">
                            <p className="text-sm text-gray-600 font-medium">
                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalCandidates)} of {totalCandidates} results
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors" 
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {getPageNumbers().map((page, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => page !== '...' && handlePageChange(page)}
                                        className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-bold transition-colors ${page === currentPage
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
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Sidebar */}
                    <div className="lg:w-72 flex-shrink-0 h-full">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Filter className="h-5 w-5" />
                                    <h3 className="font-bold text-base">Filters</h3>
                                </div>
                                {(filters.rankPosition.length > 0 || filters.experienceLevel.length > 0 || filters.vesselType.length > 0) && (
                                    <button
                                        onClick={() => setFilters({ rankPosition: [], experienceLevel: [], vesselType: [] })}
                                        className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Scrollable Filters Content */}
                            <div className="overflow-y-auto flex-1 p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">

                            {/* Rank/Position Filter */}
                            <div className="space-y-2">
                                <button className="flex items-center justify-between w-full text-left">
                                    <h4 className="font-bold text-sm text-gray-900">Rank / Position</h4>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </button>
                                <div className="space-y-2 pl-1">
                                    {rankPositions.map((rank) => (
                                        <label key={rank} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971] cursor-pointer"
                                                checked={filters.rankPosition.includes(rank)}
                                                onChange={(e) => {
                                                    const newRanks = e.target.checked
                                                        ? [...filters.rankPosition, rank]
                                                        : filters.rankPosition.filter(r => r !== rank);
                                                    setFilters({ ...filters, rankPosition: newRanks });
                                                }}
                                            />
                                            <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{rank}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Level Filter */}
                            <div className="space-y-2">
                                <button className="flex items-center justify-between w-full text-left">
                                    <h4 className="font-bold text-sm text-gray-900">Experience Level</h4>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </button>
                                <div className="space-y-2 pl-1">
                                    {experienceLevels.map((level) => (
                                        <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971] cursor-pointer"
                                                checked={filters.experienceLevel.includes(level)}
                                                onChange={(e) => {
                                                    const newLevels = e.target.checked
                                                        ? [...filters.experienceLevel, level]
                                                        : filters.experienceLevel.filter(l => l !== level);
                                                    setFilters({ ...filters, experienceLevel: newLevels });
                                                }}
                                            />
                                            <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{level}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Vessel Type Experience Filter */}
                            <div className="space-y-2">
                                <button className="flex items-center justify-between w-full text-left">
                                    <h4 className="font-bold text-sm text-gray-900">Vessel Type Experience</h4>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </button>
                                <div className="space-y-2 pl-1">
                                    {vesselTypes.map((vessel) => (
                                        <label key={vessel} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971] cursor-pointer"
                                                checked={filters.vesselType.includes(vessel)}
                                                onChange={(e) => {
                                                    const newVessels = e.target.checked
                                                        ? [...filters.vesselType, vessel]
                                                        : filters.vesselType.filter(v => v !== vessel);
                                                    setFilters({ ...filters, vesselType: newVessels });
                                                }}
                                            />
                                            <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{vessel}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            </div>

                            {/* Show Results Button - Fixed at bottom */}
                            <div className="p-4 border-t border-gray-100 flex-shrink-0">
                                <button className="w-full bg-[#003971] text-white py-2.5 rounded-lg font-bold hover:bg-[#002855] transition-colors">
                                    Show {totalCandidates} Candidates
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSearch;
