import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
    ChevronDown,
    Search,
    ArrowUpRight,
    Download
} from 'lucide-react';

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
    const [region, setRegion] = useState('my-region');
    const [year, setYear] = useState(() => new Date().getFullYear().toString());
    const [course, setCourse] = useState(() => {
        if (location.state?.certificate) {
            const c = location.state.certificate.toLowerCase();
            if (c.includes('stcw')) return 'stcw';
            if (c.includes('firefighting')) return 'firefighting';
            if (c.includes('gwo')) return 'gwo';
            if (c.includes('medical')) return 'medical';
        }
        return 'all';
    });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredExpiries = useMemo(() => {
        const today = new Date();
        return mockExpiries.filter((row) => {
            const expiryDate = new Date(row.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            const expiryYear = expiryDate.getFullYear().toString();

            if (daysUntilExpiry < 0) return false;

            if (year !== expiryYear) return false;

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

            if (course !== 'all' && !row.certificateType.toLowerCase().includes(course)) return false;
            return true;
        });
    }, [year, region, searchTerm, course]);

    const renewalDemandRows = useMemo(() => {
        const grouped = new Map();

        filteredExpiries.forEach((row) => {
            const key = row.certificateType;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    course: row.certificateType,
                    expiring: 0,
                    locations: new Set(),
                    candidateId: row.id
                });
            }

            const entry = grouped.get(key);
            entry.expiring += 1;
            entry.locations.add(row.location);
        });

        return Array.from(grouped.values())
            .map((row) => ({
                course: row.course,
                expiring: row.expiring,
                trend: Math.max(1, Math.round(row.expiring * 0.8)),
                locations: Array.from(row.locations).join(' • '),
                candidateId: row.candidateId
            }))
            .sort((a, b) => b.expiring - a.expiring);
    }, [filteredExpiries]);

    const handleExportCSV = () => {
        const headers = ['Course', 'Expiring', 'Trend', 'Primary Locations'];
        const rows = renewalDemandRows.map((r) => [r.course, r.expiring, r.trend, r.locations]);
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
                            Demand &amp; Planning
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Monitor training demand, watch capacity, and plan renewal demands.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search courses, enquiries..."
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
                            { value: '2025', label: '2025' },
                            { value: '2026', label: '2026' }
                        ]}
                    />
                    <FilterSelect
                        label="Course"
                        value={course}
                        onChange={setCourse}
                        options={[
                            { value: 'all', label: 'All Courses' },
                            { value: 'stcw', label: 'STCW Basic Safety' },
                            { value: 'firefighting', label: 'Advanced Firefighting' },
                            { value: 'gwo', label: 'GWO Sea Survival' },
                            { value: 'medical', label: 'Medical Care Onboard' }
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
                                <th className="px-4 py-3 text-left">Course</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">Expiring</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">Trend</th>
                                <th className="px-4 py-3 text-left whitespace-nowrap">Primary Locations</th>
                                <th className="px-4 py-3 text-right" />
                            </tr>
                        </thead>
                        <tbody>
                            {renewalDemandRows.map((row, idx) => {
                                const isLast = idx === renewalDemandRows.length - 1;
                                const trendUp = row.trend >= row.expiring;

                                return (
                                    <tr
                                        key={`${row.course}-${idx}`}
                                        className={`hover:bg-gray-50/60 transition-colors ${!isLast ? 'border-b border-gray-50' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                                                <span className="font-semibold text-gray-900">
                                                    {row.course}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            {row.expiring}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-semibold ${trendUp
                                                    ? 'text-emerald-600'
                                                    : 'text-amber-600'
                                                    }`}
                                            >
                                                <ArrowUpRight className="h-3 w-3" />
                                                {row.trend}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{row.locations}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/trainingprovider/candidate/${row.candidateId}`, { state: { certificate: row.course } })}
                                                className="text-xs font-bold text-[#003971] hover:text-[#002455]"
                                            >
                                                View Professionals
                                            </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {renewalDemandRows.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-12 text-gray-500 text-sm">
                        No results match your filters. Try adjusting region or course.
                    </div>
                )}
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
