import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Download, Search, ArrowUpRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const periodTabs = ['30 Days', '60 Days', '90 Days'];

const rowsByPeriod = {
    '30 Days': [
        { course: 'STCW Basic Safety', expiring: 4, trend: 3, locations: 'Liverpool • Aberdeen' },
        { course: 'Advanced Firefighting', expiring: 3, trend: 2, locations: 'Aberdeen • Liverpool' },
        { course: 'GWO Sea Survival', expiring: 2, trend: 2, locations: 'Liverpool • Aberdeen' },
        { course: 'Medical Care Onboard', expiring: 1, trend: 1, locations: 'Aberdeen' },
        { course: 'Energy Efficiency Program', expiring: 1, trend: 1, locations: 'Liverpool' }
    ],
    '60 Days': [
        { course: 'STCW Basic Safety', expiring: 9, trend: 7, locations: 'Liverpool • Aberdeen' },
        { course: 'Advanced Firefighting', expiring: 5, trend: 4, locations: 'Aberdeen • Liverpool' },
        { course: 'GWO Sea Survival', expiring: 4, trend: 3, locations: 'Liverpool • Aberdeen' },
        { course: 'Medical Care Onboard', expiring: 3, trend: 2, locations: 'Aberdeen' },
        { course: 'Energy Efficiency Program', expiring: 2, trend: 2, locations: 'Liverpool' }
    ],
    '90 Days': [
        { course: 'STCW Basic Safety', expiring: 14, trend: 11, locations: 'Liverpool • Aberdeen' },
        { course: 'Advanced Firefighting', expiring: 8, trend: 6, locations: 'Aberdeen • Liverpool' },
        { course: 'GWO Sea Survival', expiring: 6, trend: 5, locations: 'Liverpool • Aberdeen' },
        { course: 'Medical Care Onboard', expiring: 4, trend: 3, locations: 'Aberdeen' },
        { course: 'Energy Efficiency Program', expiring: 3, trend: 2, locations: 'Liverpool' }
    ]
};

function ExpiringCertificatesOverview() {
    const navigate = useNavigate();
    const [periodTab, setPeriodTab] = useState('30 Days');
    const [region, setRegion] = useState('my-region');
    const [year, setYear] = useState('2026');
    const [course, setCourse] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRows = useMemo(() => {
        const rows = rowsByPeriod[periodTab] || [];
        const search = searchTerm.trim().toLowerCase();

        return rows.filter((row) => {
            const matchesSearch =
                !search ||
                row.course.toLowerCase().includes(search) ||
                row.locations.toLowerCase().includes(search);

            if (!matchesSearch) return false;
            if (course === 'all') return true;

            const c = row.course.toLowerCase();
            if (course === 'stcw') return c.includes('stcw');
            if (course === 'firefighting') return c.includes('firefighting');
            if (course === 'gwo') return c.includes('gwo');
            if (course === 'medical') return c.includes('medical');
            return true;
        });
    }, [periodTab, searchTerm, course]);

    const handleExportCSV = () => {
        const headers = ['Course', 'Expiring', 'Trend', 'Primary Locations'];
        const csvRows = filteredRows.map((row) => [row.course, row.expiring, row.trend, row.locations]);
        const csv = [headers.join(','), ...csvRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expiring-certificates-${new Date().toISOString().slice(0, 10)}.csv`;
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
                        <div className="relative flex-1 md:w-80">
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

            <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 md:px-5 md:py-4">
                <div className="flex flex-wrap items-center gap-3">
                    <FilterSelect
                        label="Period"
                        value={periodTab}
                        onChange={setPeriodTab}
                        options={periodTabs.map((tab) => ({ value: tab, label: tab }))}
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
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

                <div className="overflow-x-auto">
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
                            {filteredRows.map((row, idx) => {
                                const isLast = idx === filteredRows.length - 1;
                                const trendUp = row.trend >= row.expiring;

                                return (
                                    <tr
                                        key={`${row.course}-${idx}`}
                                        className={`hover:bg-gray-50/60 transition-colors ${!isLast ? 'border-b border-gray-50' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                                                <span className="font-semibold text-gray-900">{row.course}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{row.expiring}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-amber-600'}`}
                                            >
                                                <ArrowUpRight className="h-3 w-3" />
                                                {row.trend}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{row.locations}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => navigate('/trainingprovider/expiries', { state: { certificate: row.course } })}
                                                className="text-xs font-bold text-[#003971] hover:text-[#002455]"
                                            >
                                                View Professionals
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredRows.length === 0 && (
                    <p className="px-4 py-6 text-sm text-gray-500 text-center">
                        No results match your filters.
                    </p>
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
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] cursor-pointer min-w-[150px] w-full"
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

export default ExpiringCertificatesOverview;
