import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Filter,
    Grid3x3,
    List,
    Loader2,
    MapPin,
    Search,
} from 'lucide-react';
import recruiterCandidateService from '../../../../services/recruiterCandidateService';

const PAGE_SIZE = 6;

const rankPositions = [
    'Master',
    'Chief Officer',
    'Chief Engineer',
    '2nd Engineer',
    '3rd Officer',
    'Electrician',
];

const experienceLevels = ['0-2 years', '3-5 years', '6-10 years', '10+ years'];

const vesselTypes = ['Tanker', 'Container', 'Bulk Carrier', 'Offshore', 'Cruise Ship'];

const sortOptions = [
    'Best Matches',
    'Experience (High to Low)',
    'Experience (Low to High)',
    'Alphabetical',
];

const buildAvatarFallback = (name, seed = '') => {
    const initials =
        (name || 'Candidate')
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join('') || 'C';

    const colors = ['0D8ABC', '1E5A8F', '2563EB', '0F766E', '7C3AED', 'B45309'];
    const index = `${name}:${seed}`
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="#${colors[index]}" width="80" height="80"/><text x="50%" y="50%" dy=".35em" fill="white" font-family="Arial" font-size="28" text-anchor="middle">${initials}</text></svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const getCandidateName = (candidate) => candidate?.fullname || candidate?.name || 'Unknown candidate';

function AdminSearch({ onViewCandidate }) {
    const navigate = useNavigate();
    const location = useLocation();
    const requestRef = useRef(0);
    const debounceRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Best Matches');
    const [viewMode, setViewMode] = useState('list');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        rankPosition: [],
        experienceLevel: [],
        vesselType: [],
    });
    const [candidates, setCandidates] = useState([]);
    const [totalCandidates, setTotalCandidates] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastAppliedAt, setLastAppliedAt] = useState(null);

    useEffect(() => {
        const initialQuery = String(location.state?.searchQuery || '').trim();
        if (initialQuery) {
            setSearchQuery(initialQuery);
        }
    }, [location.state]);

    const loadCandidates = useCallback(
        async ({ page = 1, query = searchQuery, nextFilters = filters, nextSortBy = sortBy } = {}) => {
            const requestId = ++requestRef.current;
            setIsLoading(true);
            setError(null);

            try {
                const response = await recruiterCandidateService.searchCandidates({
                    page,
                    limit: PAGE_SIZE,
                    search: query,
                    sortBy: nextSortBy,
                    rankPosition: nextFilters.rankPosition,
                    experienceLevel: nextFilters.experienceLevel,
                    vesselType: nextFilters.vesselType,
                });

                if (requestId !== requestRef.current) return;

                const payload = response?.data || response || {};
                const items = payload?.data?.candidates || payload?.candidates || [];
                const pagination = payload?.pagination || {};

                setCandidates(Array.isArray(items) ? items : []);
                setTotalCandidates(
                    Number.isFinite(Number(pagination.total))
                        ? Number(pagination.total)
                        : Array.isArray(items)
                            ? items.length
                            : 0,
                );
                setTotalPages(Math.max(1, Number(pagination.pages) || 1));
                setCurrentPage(Number(pagination.page) || page);
                setLastAppliedAt(new Date());
            } catch (err) {
                if (requestId !== requestRef.current) return;
                setCandidates([]);
                setTotalCandidates(0);
                setTotalPages(1);
                setError(err?.data?.message || err?.message || 'Could not load candidates.');
            } finally {
                if (requestId === requestRef.current) {
                    setIsLoading(false);
                }
            }
        },
        [filters, searchQuery, sortBy],
    );

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            void loadCandidates({ page: 1 });
        }, 350);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, sortBy, filters, loadCandidates]);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        void loadCandidates({ page: 1 });
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) {
            return;
        }

        void loadCandidates({ page: pageNumber });
    };

    const handleCandidateView = (candidateId) => {
        if (onViewCandidate) {
            onViewCandidate(candidateId);
            return;
        }
        navigate(`/recruiter/candidate/${candidateId}`);
    };

    const clearAllFilters = () => {
        setFilters({
            rankPosition: [],
            experienceLevel: [],
            vesselType: [],
        });
    };

    const pageNumbers = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, '...', totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, '...', currentPage, '...', totalPages];
    }, [currentPage, totalPages]);

    const showingFrom = totalCandidates === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const showingTo = Math.min(currentPage * PAGE_SIZE, totalCandidates);
    const activeFilterCount =
        filters.rankPosition.length +
        filters.experienceLevel.length +
        filters.vesselType.length;

    return (
        <div className="h-full flex flex-col overflow-hidden bg-gray-50">
            <div className="flex-shrink-0 px-8 pt-4 pb-3 bg-gray-50">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Search Candidates</h1>
                        <p className="text-gray-600 mt-1 text-sm font-medium">
                            Find qualified maritime professionals for your vessels
                        </p>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-[420px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by rank, name, certification..."
                            className="w-full pl-12 pr-14 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#003971] text-white p-2 rounded-lg hover:bg-[#002855] transition-colors"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-8 pb-4">
                <div className="flex flex-col lg:flex-row gap-4 h-full">
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 flex-shrink-0">
                            <div className="text-sm font-bold text-gray-900">
                                {isLoading ? 'Searching candidates...' : `Showing ${totalCandidates} candidates`}
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 font-semibold">Sort by:</span>
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        {sortOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>

                                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('list')}
                                        className={`p-2.5 transition-colors ${viewMode === 'list'
                                            ? 'bg-gray-100 text-[#003971]'
                                            : 'text-gray-400 hover:bg-gray-50'
                                            }`}
                                        aria-label="List view"
                                    >
                                        <List className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2.5 transition-colors ${viewMode === 'grid'
                                            ? 'bg-gray-100 text-[#003971]'
                                            : 'text-gray-400 hover:bg-gray-50'
                                            }`}
                                        aria-label="Grid view"
                                    >
                                        <Grid3x3 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="relative flex-1 overflow-hidden">
                            {isLoading && candidates.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white border border-gray-100">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Loader2 className="h-5 w-5 animate-spin text-[#003971]" />
                                        Loading candidates...
                                    </div>
                                </div>
                            ) : candidates.length === 0 ? (
                                <div className="h-full flex items-center justify-center rounded-xl bg-white border border-gray-100">
                                    <div className="text-center max-w-md px-8">
                                        <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <h3 className="text-lg font-bold text-gray-900">No candidates found</h3>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Try a different keyword, clear some filters, or broaden the experience range.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {viewMode === 'list' ? (
                                        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                                            {candidates.map((candidate) => (
                                                <div
                                                    key={candidate.id}
                                                    className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="relative flex-shrink-0">
                                                                <img
                                                                    src={candidate.image || buildAvatarFallback(getCandidateName(candidate), candidate.id)}
                                                                    alt={getCandidateName(candidate)}
                                                                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-100"
                                                                />
                                                                {candidate.verified && (
                                                                    <div className="absolute -bottom-1 -right-1 bg-[#003971] rounded-full px-1.5 py-0.5">
                                                                        <span className="text-[10px] font-bold text-white">V</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <h3 className="text-base font-bold text-gray-900">
                                                                        {getCandidateName(candidate)}
                                                                    </h3>
                                                                    {candidate.verified && (
                                                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                                                            Verified
                                                                        </span>
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

                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#003971]">
                                                                {candidate.matchPercentage}% match
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCandidateView(candidate.id)}
                                                                className="bg-[#003971] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#002855] transition-colors flex items-center gap-2 whitespace-nowrap"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                                View Profile
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 flex-1 overflow-y-auto pr-1">
                                            {candidates.map((candidate) => (
                                                <div
                                                    key={candidate.id}
                                                    className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="relative mb-4">
                                                            <img
                                                                src={candidate.image || buildAvatarFallback(getCandidateName(candidate), candidate.id)}
                                                                alt={getCandidateName(candidate)}
                                                                className="h-16 w-16 rounded-full object-cover border-2 border-gray-100"
                                                            />
                                                            {candidate.verified && (
                                                                <div className="absolute -bottom-1 -right-1 bg-[#003971] rounded-full px-1.5 py-0.5">
                                                                    <span className="text-[10px] font-bold text-white">V</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-center gap-1.5 mb-1 flex-wrap">
                                                            <h3 className="text-base font-bold text-gray-900">
                                                                {getCandidateName(candidate)}
                                                            </h3>
                                                            {candidate.verified && (
                                                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                                                    Verified
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-gray-600 font-semibold mb-4">{candidate.rank}</p>

                                                        <div className="grid grid-cols-2 gap-4 w-full mb-4 py-3 border-t border-b border-gray-100">
                                                            <div className="text-center">
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                                                                    EXP
                                                                </div>
                                                                <div className="text-sm font-bold text-gray-900">
                                                                    {candidate.experience}
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                                                                    Location
                                                                </div>
                                                                <div className="text-sm font-bold text-gray-900">
                                                                    {candidate.location}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full flex items-center justify-between gap-2 mb-3">
                                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#003971]">
                                                                {candidate.matchPercentage}% match
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {candidate.availability || 'Available now'}
                                                            </span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleCandidateView(candidate.id)}
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

                                    <div className="flex items-center justify-between pt-2 flex-shrink-0">
                                        <p className="text-sm text-gray-600 font-medium">
                                            Showing {showingFrom}-{showingTo} of {totalCandidates} results
                                            {lastAppliedAt && (
                                                <span className="ml-2 text-gray-400">
                                                    · Updated {lastAppliedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                                disabled={currentPage === 1 || isLoading}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            {pageNumbers.map((page, idx) => (
                                                <button
                                                    key={`${page}-${idx}`}
                                                    type="button"
                                                    onClick={() => page !== '...' && handlePageChange(page)}
                                                    className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-bold transition-colors ${page === currentPage
                                                        ? 'bg-[#003971] text-white'
                                                        : page === '...'
                                                            ? 'text-gray-400 cursor-default'
                                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                    disabled={page === '...' || isLoading}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                                disabled={currentPage === totalPages || isLoading}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="lg:w-72 flex-shrink-0 h-full">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Filter className="h-5 w-5" />
                                    <h3 className="font-bold text-base">Filters</h3>
                                </div>
                                {activeFilterCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearAllFilters}
                                        className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="overflow-y-auto flex-1 p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between w-full text-left">
                                        <h4 className="font-bold text-sm text-gray-900">Rank / Position</h4>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="space-y-2 pl-1">
                                        {rankPositions.map((rank) => (
                                            <label key={rank} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971] cursor-pointer"
                                                    checked={filters.rankPosition.includes(rank)}
                                                    onChange={(e) => {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            rankPosition: e.target.checked
                                                                ? [...prev.rankPosition, rank]
                                                                : prev.rankPosition.filter((item) => item !== rank),
                                                        }));
                                                    }}
                                                />
                                                <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                                                    {rank}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between w-full text-left">
                                        <h4 className="font-bold text-sm text-gray-900">Experience Level</h4>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="space-y-2 pl-1">
                                        {experienceLevels.map((level) => (
                                            <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971] cursor-pointer"
                                                    checked={filters.experienceLevel.includes(level)}
                                                    onChange={(e) => {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            experienceLevel: e.target.checked
                                                                ? [...prev.experienceLevel, level]
                                                                : prev.experienceLevel.filter((item) => item !== level),
                                                        }));
                                                    }}
                                                />
                                                <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                                                    {level}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between w-full text-left">
                                        <h4 className="font-bold text-sm text-gray-900">Vessel Type Experience</h4>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="space-y-2 pl-1">
                                        {vesselTypes.map((vessel) => (
                                            <label key={vessel} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-[#003971] focus:ring-[#003971] cursor-pointer"
                                                    checked={filters.vesselType.includes(vessel)}
                                                    onChange={(e) => {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            vesselType: e.target.checked
                                                                ? [...prev.vesselType, vessel]
                                                                : prev.vesselType.filter((item) => item !== vessel),
                                                        }));
                                                    }}
                                                />
                                                <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                                                    {vessel}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => void loadCandidates({ page: 1 })}
                                    className="w-full bg-[#003971] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#002855] transition-colors"
                                >
                                    {isLoading ? 'Refreshing...' : `Show ${totalCandidates || 0} Candidates`}
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
