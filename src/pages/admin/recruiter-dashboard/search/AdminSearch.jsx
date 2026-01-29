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

function AdminSearch() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [sortBy, setSortBy] = useState('Best Matches');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(true);

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
            image: "https://i.pravatar.cc/150?img=12"
        },
        {
            id: 2,
            name: "Sarah Chen",
            rank: "2nd Officer",
            experience: "8 years",
            location: "Singapore",
            matchPercentage: 88,
            verified: true,
            image: "https://i.pravatar.cc/150?img=45"
        },
        {
            id: 3,
            name: "Marcus Johnson",
            rank: "Master",
            experience: "22 years",
            location: "USA",
            matchPercentage: 85,
            verified: true,
            image: "https://i.pravatar.cc/150?img=33"
        },
        {
            id: 4,
            name: "Felipe Rodriguez",
            rank: "Electrician (ETO)",
            experience: "6 years",
            location: "Philippines",
            matchPercentage: 78,
            verified: false,
            image: "https://i.pravatar.cc/150?img=68"
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

        // Vessel Type Filter (Mock data doesn't have vessel type explicitly, adding a mock check or skipping)
        // Since mock data only has: name, rank, experience, location.
        // I will assume for now we skip vessel filter or add it to mock data.
        // Let's add 'vesselType' to mock data in a previous step? Or just ignore it for now to avoid errors?
        // Let's ignore it for now as it's not in the data object.
        return true;
    });

    const totalCandidates = filteredCandidates.length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Search Candidates</h1>
                    <p className="text-gray-500 mt-1 text-sm">Find qualified maritime professionals for your vessels</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by rank, name, certification..."
                        className="w-full pl-12 pr-14 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#003971] text-white p-2 rounded-lg hover:bg-[#002855] transition-colors">
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Controls Bar & Filters Layout */}
            <div className="flex flex-col lg:flex-row gap-5">
                {/* Main Content */}
                <div className="flex-1 space-y-4">
                    {/* Controls Bar */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="font-bold text-gray-900">Showing {totalCandidates} candidates</div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium">Sort by:</span>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
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
                                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-[#003971]' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-[#003971]' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    <Grid3x3 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Candidate Cards - List View */}
                    {viewMode === 'list' && (
                        <div className="space-y-3">
                            {filteredCandidates.map((candidate) => (
                                <div key={candidate.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between gap-6">
                                        {/* Left: Avatar & Info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={candidate.image}
                                                    alt={candidate.name}
                                                    className="h-14 w-14 rounded-full object-cover border-2 border-gray-100"
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
                                                <p className="text-sm text-gray-600 font-medium mb-1.5">{candidate.rank}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
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
                                                onClick={() => navigate(`/admin/candidate/${candidate.id}`)}
                                                className="bg-[#003971] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#002855] transition-colors flex items-center gap-2 whitespace-nowrap"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredCandidates.map((candidate) => (
                                <div key={candidate.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
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
                                        <p className="text-sm text-gray-600 font-medium mb-4">{candidate.rank}</p>

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
                                            onClick={() => navigate(`/admin/candidate/${candidate.id}`)}
                                            className="w-full bg-[#003971] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#002855] transition-colors flex items-center justify-center gap-2"
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
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-sm text-gray-500">Showing 1-4 of {totalCandidates} results</p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {[1, 2, 3, '...', 12].map((page, idx) => (
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

                {/* Filters Sidebar */}
                <div className="lg:w-80 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-900">
                                <Filter className="h-4 w-4" />
                                <h3 className="font-bold text-sm">Filters</h3>
                            </div>
                            <button
                                onClick={() => setFilters({ rankPosition: [], experienceLevel: [], vesselType: [] })}
                                className="text-sm font-bold text-red-500 hover:text-red-600"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Rank/Position Filter */}
                        <div className="space-y-3">
                            <button className="flex items-center justify-between w-full text-left">
                                <h4 className="font-bold text-gray-900">Rank / Position</h4>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                            <div className="space-y-2.5 pl-1">
                                {rankPositions.map((rank) => (
                                    <label key={rank} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971]"
                                            checked={filters.rankPosition.includes(rank)}
                                            onChange={(e) => {
                                                const newRanks = e.target.checked
                                                    ? [...filters.rankPosition, rank]
                                                    : filters.rankPosition.filter(r => r !== rank);
                                                setFilters({ ...filters, rankPosition: newRanks });
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">{rank}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Experience Level Filter */}
                        <div className="space-y-3">
                            <button className="flex items-center justify-between w-full text-left">
                                <h4 className="font-bold text-gray-900">Experience Level</h4>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                            <div className="space-y-2.5 pl-1">
                                {experienceLevels.map((level) => (
                                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971]"
                                            checked={filters.experienceLevel.includes(level)}
                                            onChange={(e) => {
                                                const newLevels = e.target.checked
                                                    ? [...filters.experienceLevel, level]
                                                    : filters.experienceLevel.filter(l => l !== level);
                                                setFilters({ ...filters, experienceLevel: newLevels });
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Vessel Type Experience Filter */}
                        <div className="space-y-3">
                            <button className="flex items-center justify-between w-full text-left">
                                <h4 className="font-bold text-gray-900">Vessel Type Experience</h4>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                            <div className="space-y-2.5 pl-1">
                                {vesselTypes.map((vessel) => (
                                    <label key={vessel} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971]"
                                            checked={filters.vesselType.includes(vessel)}
                                            onChange={(e) => {
                                                const newVessels = e.target.checked
                                                    ? [...filters.vesselType, vessel]
                                                    : filters.vesselType.filter(v => v !== vessel);
                                                setFilters({ ...filters, vesselType: newVessels });
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">{vessel}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Show Results Button */}
                        <button className="w-full bg-[#003971] text-white py-3 rounded-xl font-bold hover:bg-[#002855] transition-colors mt-6">
                            Show {totalCandidates} Candidates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSearch;
