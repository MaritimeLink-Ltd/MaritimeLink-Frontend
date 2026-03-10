import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
    ChevronDown,
    Search,
    Download,
    ChevronsUpDown
} from 'lucide-react';

const periodOptions = [
    { value: 'all', label: 'All' },
    { value: '30', label: '30 Days' },
    { value: '60', label: '60 Days' },
    { value: '90', label: '90 Days' }
];

// Generate mock data with relative dates (days from today)
function getMockExpiries() {
    const today = new Date();
    const base = [
        { id: 1, certificateType: 'STCW Basic Safety', daysLeft: 6, location: 'Liverpool', rank: 'Able Seaman' },
        { id: 2, certificateType: 'STCW Basic Safety', daysLeft: 7, location: 'Liverpool', rank: 'Officer' },
        { id: 3, certificateType: 'Advanced Firefighting', daysLeft: 12, location: 'Aberdeen', rank: 'Master' },
        { id: 4, certificateType: 'STCW Basic Safety', daysLeft: 15, location: 'Hull', rank: 'Able Seaman' },
        { id: 5, certificateType: 'GWO Sea Survival', daysLeft: 20, location: 'Liverpool', rank: 'Officer' },
        { id: 6, certificateType: 'Medical Care Onboard', daysLeft: 23, location: 'Aberdeen', rank: 'Master' },
        { id: 7, certificateType: 'STCW Basic Safety', daysLeft: 27, location: 'Hull', rank: 'Able Seaman' },
        { id: 8, certificateType: 'Advanced Firefighting', daysLeft: 30, location: 'Liverpool', rank: 'Officer' },
        { id: 9, certificateType: 'STCW Basic Safety', daysLeft: 33, location: 'Aberdeen', rank: 'Able Seaman' },
        { id: 10, certificateType: 'Energy Efficiency Program', daysLeft: 37, location: 'Liverpool', rank: 'Master' },
        { id: 11, certificateType: 'STCW Basic Safety', daysLeft: 46, location: 'Hull', rank: 'Officer' },
        { id: 12, certificateType: 'GWO Sea Survival', daysLeft: 56, location: 'Aberdeen', rank: 'Able Seaman' },
        { id: 13, certificateType: 'STCW Basic Safety', daysLeft: 61, location: 'Liverpool', rank: 'Master' },
        { id: 14, certificateType: 'Advanced Firefighting', daysLeft: 71, location: 'Aberdeen', rank: 'Officer' },
        { id: 15, certificateType: 'STCW Basic Safety', daysLeft: 81, location: 'Hull', rank: 'Able Seaman' }
    ];
    return base.map((r) => {
        const d = new Date(today);
        d.setDate(d.getDate() + r.daysLeft);
        return { ...r, expiryDate: d.toISOString().slice(0, 10) };
    });
}

const mockExpiries = getMockExpiries();

function AllExpiries() {
    const navigate = useNavigate();
    const location = useLocation();
    const [period, setPeriod] = useState('all');
    const [region, setRegion] = useState('my-region');
    const [year, setYear] = useState('all');
    const [city, setCity] = useState('all');
    const [certificateType, setCertificateType] = useState(() => {
        if (location.state?.certificate) {
            const c = location.state.certificate.toLowerCase();
            if (c.includes('stcw')) return 'stcw';
            if (c.includes('firefighting')) return 'firefighting';
            if (c.includes('gwo')) return 'gwo';
            if (c.includes('medical')) return 'medical';
        }
        return 'all';
    });
    const [rank, setRank] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    const filteredExpiries = useMemo(() => {
        const today = new Date();
        return mockExpiries.filter((row) => {
            const expiryDate = new Date(row.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            const expiryYear = expiryDate.getFullYear().toString();

            if (period === '30' && daysUntilExpiry > 30) return false;
            if (period === '60' && daysUntilExpiry > 60) return false;
            if (period === '90' && daysUntilExpiry > 90) return false;
            if (daysUntilExpiry < 0) return false;

            if (year !== 'all' && expiryYear !== year) return false;

            const loc = row.location.toLowerCase();
            if (region === 'north-sea' && !['aberdeen', 'hull'].includes(loc)) return false;
            if (region === 'my-region' && !['liverpool', 'aberdeen'].includes(loc)) return false;

            const searchLower = searchTerm.trim().toLowerCase();
            if (searchLower) {
                const match = row.certificateType.toLowerCase().includes(searchLower) ||
                    row.location.toLowerCase().includes(searchLower) ||
                    row.rank.toLowerCase().includes(searchLower);
                if (!match) return false;
            }

            if (certificateType !== 'all' && !row.certificateType.toLowerCase().includes(certificateType)) return false;
            if (rank !== 'all' && row.rank.toLowerCase() !== rank) return false;
            if (city !== 'all' && row.location.toLowerCase() !== city) return false;
            return true;
        });
    }, [period, year, region, searchTerm, certificateType, rank, city]);

    const paginatedExpiries = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredExpiries.slice(start, start + pageSize);
    }, [filteredExpiries, currentPage]);

    const totalPages = Math.ceil(filteredExpiries.length / pageSize);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleExportCSV = () => {
        const headers = ['Certificate Type', 'Expiry Date', 'Days Left', 'Location', 'Rank'];
        const rows = filteredExpiries.map((r) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(r.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
            return [r.certificateType, formatDate(r.expiryDate), `${daysLeft} days`, r.location, r.rank];
        });
        const csv = [headers.join(','), ...rows.map((row) => row.map((c) => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expiries-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Export completed');
    };

    const handleDownloadReport = () => {
        toast.success('Report download started');
    };

    return (
        <div className="min-h-full flex flex-col pb-6">
            <Toaster position="top-right" />
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-[26px] md:text-[28px] font-bold text-gray-900">
                            All Expiries
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View and manage expiring certificates for upcoming renewals.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search certificates, locations..."
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 md:px-5 md:py-4">
                <div className="flex flex-wrap items-center gap-3">
                    <FilterSelect
                        label="Period"
                        value={period}
                        onChange={(v) => { setPeriod(v); setCurrentPage(1); }}
                        options={periodOptions}
                    />
                    <FilterSelect
                        label="Region"
                        value={region}
                        onChange={setRegion}
                        options={[
                            { value: 'my-region', label: 'My Region' },
                            { value: 'north-sea', label: 'North Sea' },
                            { value: 'global', label: 'Global' }
                        ]}
                    />
                    <FilterSelect
                        label="Year"
                        value={year}
                        onChange={setYear}
                        options={[
                            { value: 'all', label: 'All Years' },
                            { value: '2025', label: '2025' },
                            { value: '2026', label: '2026' }
                        ]}
                    />
                    <FilterSelect
                        label="City"
                        value={city}
                        onChange={setCity}
                        options={[
                            { value: 'all', label: 'All Cities' },
                            { value: 'liverpool', label: 'Liverpool' },
                            { value: 'aberdeen', label: 'Aberdeen' },
                            { value: 'hull', label: 'Hull' }
                        ]}
                    />
                    <FilterSelect
                        label="Certificate"
                        value={certificateType}
                        onChange={setCertificateType}
                        options={[
                            { value: 'all', label: 'All Certificates' },
                            { value: 'stcw', label: 'STCW Basic Safety' },
                            { value: 'firefighting', label: 'Advanced Firefighting' },
                            { value: 'gwo', label: 'GWO Sea Survival' },
                            { value: 'medical', label: 'Medical Care Onboard' }
                        ]}
                    />
                    <FilterSelect
                        label="Rank"
                        value={rank}
                        onChange={setRank}
                        options={[
                            { value: 'all', label: 'All Ranks' },
                            { value: 'able seaman', label: 'Able Seaman' },
                            { value: 'officer', label: 'Officer' },
                            { value: 'master', label: 'Master' }
                        ]}
                    />
                </div>
            </div>

            {/* Expiring Certificates Table */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Expiring Certificates</h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Export CSV
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadReport}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Download report
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                <th className="px-4 py-3 text-left">
                                    <span className="flex items-center gap-1">
                                        Certificate Type <ChevronsUpDown className="h-3.5 w-3.5" />
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="flex items-center gap-1">
                                        Expiry Date <ChevronsUpDown className="h-3.5 w-3.5" />
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="flex items-center gap-1">
                                        Days Left <ChevronsUpDown className="h-3.5 w-3.5" />
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="flex items-center gap-1">
                                        Location <ChevronsUpDown className="h-3.5 w-3.5" />
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="flex items-center gap-1">
                                        Rank <ChevronsUpDown className="h-3.5 w-3.5" />
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedExpiries.map((row, idx) => {
                                const isLast = idx === paginatedExpiries.length - 1;

                                return (
                                    <tr
                                        key={row.id}
                                        className={`hover:bg-gray-50/60 transition-colors ${!isLast ? 'border-b border-gray-50' : ''}`}
                                    >
                                        <td className="px-4 py-3 font-semibold text-gray-900">{row.certificateType}</td>
                                        <td className="px-4 py-3 text-gray-700">{formatDate(row.expiryDate)}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                                                {Math.max(0, Math.ceil((new Date(row.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)))} days
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{row.location}</td>
                                        <td className="px-4 py-3 text-gray-700">{row.rank}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/trainingprovider/candidate/${row.id}`);
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-[#EBF3FF] text-[#003971] text-xs font-semibold hover:bg-[#d7e6ff] transition-colors cursor-pointer"
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {paginatedExpiries.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-12 text-gray-500 text-sm">
                        No expiries match your filters. Try adjusting period or filters.
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Showing {(currentPage - 1) * pageSize + 1} to{' '}
                        {Math.min(currentPage * pageSize, filteredExpiries.length)} of {filteredExpiries.length} expiries
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Prev
                        </button>
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                            const p = totalPages <= 3 ? i + 1 : Math.min(currentPage, totalPages - 2) + i;
                            if (p < 1 || p > totalPages) return null;
                            return (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setCurrentPage(p)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${currentPage === p
                                        ? 'bg-[#003971] text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterSelect({ label, value, onChange, options }) {
    const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer">
                {label}
            </label>
            <div className="relative">
                <select
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] cursor-pointer min-w-[120px] w-full"
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
        </div>
    );
}

export default AllExpiries;
