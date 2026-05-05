import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    TrendingUp,
    MessageCircle,
    ChevronDown,
    Search,
    ArrowUpRight
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import trainerDashboardService from '../../../../services/trainerDashboardService';

const SUMMARY_FALLBACK = {
    certificatesExpiring: 0,
    certificatesExpiringWindowLabel: 'Next 30 days',
    courseSearchDemand: 0,
    activeEnquiries: 0,
    uniqueCurrentMonth: 0,
};

const renewalTabs = ['30 Days', '60 Days', '90 Days'];

const statusStyles = {
    warning: 'bg-amber-50 text-amber-700',
    success: 'bg-emerald-50 text-emerald-700',
    info: 'bg-blue-50 text-blue-700',
    neutral: 'bg-gray-100 text-gray-700'
};

function DemandPlanning() {
    const navigate = useNavigate();
    const [region, setRegion] = useState('my-region');
    const [year, setYear] = useState('2025');
    const [course, setCourse] = useState('all');
    const [rangeTab, setRangeTab] = useState('30 Days');
    const [searchTerm, setSearchTerm] = useState('');
    const [dashboardData, setDashboardData] = useState({
        summary: SUMMARY_FALLBACK,
        forecast: [],
        renewalDemand: [],
        engagementCourses: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const summary = dashboardData.summary || SUMMARY_FALLBACK;
    const capacitySummary = summary.capacity || { utilization: 0, bookedSeats: 0, totalSeats: 0 };
    const topTrendingCourse = dashboardData.renewalDemand[0]?.course || '—';

    const periodQuery = rangeTab === '30 Days' ? '30d' : rangeTab === '60 Days' ? '60d' : '90d';

    useEffect(() => {
        let alive = true;
        const loadDemand = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await trainerDashboardService.getDemandOverview({
                    period: periodQuery,
                    region,
                    year,
                    course,
                    search: searchTerm,
                });
                if (!alive) return;
                const data = response?.data || {};
                setDashboardData({
                    summary: data.summary || SUMMARY_FALLBACK,
                    forecast: Array.isArray(data.forecast) ? data.forecast : [],
                    renewalDemand: Array.isArray(data.renewalDemand) ? data.renewalDemand : [],
                    engagementCourses: Array.isArray(data.engagementCourses) ? data.engagementCourses : [],
                });
            } catch (err) {
                if (!alive) return;
                setError(err?.message || 'Could not load demand planning data.');
                setDashboardData({
                    summary: SUMMARY_FALLBACK,
                    forecast: [],
                    renewalDemand: [],
                    engagementCourses: [],
                });
            } finally {
                if (alive) setLoading(false);
            }
        };

        loadDemand();
        return () => {
            alive = false;
        };
    }, [course, periodQuery, region, searchTerm, year]);

    const forecastData = dashboardData.forecast;
    const filteredEngagementCourses = dashboardData.engagementCourses;
    const filteredRenewalDemand = dashboardData.renewalDemand;

    return (
        <div className="h-full flex flex-col">
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
                        label="Period"
                        value={rangeTab}
                        onChange={setRangeTab}
                        options={renewalTabs.map((tab) => ({ value: tab, label: tab }))}
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

            {error && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Certificates Expiring
                            </p>
                            <div className="flex items-end gap-2 mt-1">
                                <p className="text-3xl font-bold text-gray-900">
                                    {loading ? '—' : summary.certificatesExpiring}
                                </p>
                                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                    {summary.certificatesExpiringWindowLabel}
                                </span>
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-rose-600" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{error ? 'Live data unavailable' : `Current window: ${periodQuery}`}</span>
                        <span>{topTrendingCourse !== '—' ? `Top: ${topTrendingCourse}` : 'No trend yet'}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Course Search Demand
                            </p>
                            <div className="flex items-end gap-2 mt-1">
                                <p className="text-3xl font-bold text-gray-900">
                                    {loading ? '—' : summary.courseSearchDemand}
                                </p>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    unique professionals
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Top trending: {topTrendingCourse}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Active Enquiries
                            </p>
                            <div className="flex items-end gap-2 mt-1">
                                <p className="text-3xl font-bold text-gray-900">
                                    {loading ? '—' : summary.activeEnquiries}
                                </p>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    pending bookings
                                </span>
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Forecast + Gauge */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                {/* Demand Forecast Chart */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Demand Forecast (Expires by Course)
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Projected certificate expiries over the next 12 months
                            </p>
                        </div>
                        <div className="bg-gray-50 p-1 rounded-xl inline-flex border border-gray-100">
                            {renewalTabs.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setRangeTab(tab)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${rangeTab === tab
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData} margin={{ left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="stcw"
                                    name="STCW"
                                    stroke="#1e40af"
                                    fill="#bfdbfe"
                                    fillOpacity={0.5}
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="firefighting"
                                    name="Firefighting"
                                    stroke="#fb923c"
                                    fill="#fed7aa"
                                    fillOpacity={0.45}
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="gwo"
                                    name="GWO"
                                    stroke="#22c55e"
                                    fill="#bbf7d0"
                                    fillOpacity={0.45}
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="medical"
                                    name="Medical"
                                    stroke="#06b6d4"
                                    fill="#bae6fd"
                                    fillOpacity={0.45}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Course Engagement & Capacity */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-900">
                            Capacity
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 mb-5">
                            Overall utilization across scheduled sessions
                        </p>

                        {/* Hero stat + progress bar */}
                        <div className="mb-5">
                            <div className="flex items-baseline justify-between mb-2">
                                <span className="text-3xl font-bold text-gray-900">
                                    {loading ? '—' : `${capacitySummary.utilization}%`}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {capacitySummary.bookedSeats} / {capacitySummary.totalSeats} seats
                                </span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#003971] to-[#0EA5E9] transition-all duration-500"
                                    style={{ width: `${capacitySummary.utilization}%` }}
                                />
                            </div>
                        </div>

                        {/* Metric tiles */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    Available
                                </p>
                                <p className="text-lg font-bold text-gray-900 mt-0.5">
                                    {Math.max(0, (capacitySummary.totalSeats || 0) - (capacitySummary.bookedSeats || 0))}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    Scheduled
                                </p>
                                <p className="text-lg font-bold text-gray-900 mt-0.5">{capacitySummary.bookedSeats}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    In Review
                                </p>
                                <p className="text-lg font-bold text-gray-900 mt-0.5">
                                    {summary.uniqueCurrentMonth || 0}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/trainingprovider/bookings')}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#EBF3FF] text-[#003971] text-sm font-semibold hover:bg-[#d7e6ff] transition-colors"
                        >
                            View Sessions
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
                {/* Upcoming Renewal Demand */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Upcoming Renewal Demand
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Courses with certificates expiring in your selected region.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-1 rounded-xl inline-flex border border-gray-100">
                            {renewalTabs.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setRangeTab(tab)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${rangeTab === tab
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto -mx-4 md:mx-0">
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
                                {filteredRenewalDemand.map((row, idx) => {
                                    const isLast = idx === filteredRenewalDemand.length - 1;
                                    const trendUp = row.trendChange >= 0;
                                    const trendValue = row.trendChange >= 0
                                        ? `+${row.trendChange}`
                                        : `${row.trendChange}`;

                                    return (
                                        <tr
                                            key={`${row.course}-${idx}`}
                                            className={`hover:bg-gray-50/60 transition-colors ${!isLast ? 'border-b border-gray-50' : ''
                                                }`}
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
                                                    {trendValue}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {row.locations}
                                            </td>
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

                    {filteredRenewalDemand.length === 0 && (
                        <p className="px-4 py-6 text-sm text-gray-500 text-center">
                            No results match your filters. Try adjusting region or course.
                        </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/trainingprovider/expiries-overview')}
                            className="text-sm font-bold text-[#003971] hover:text-[#002455]"
                        >
                            View All Expiries.
                        </button>
                    </div>
                </div>

                {/* Right Column: Engagement List + Recent Enquiries */}
                <div className="space-y-5">
                    {/* Course Engagement List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Course Engagement
                            </h2>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Last 30 Days
                            </span>
                        </div>

                        <div className="space-y-3">
                            {filteredEngagementCourses.length === 0 && (
                                <p className="py-4 text-sm text-gray-500 text-center">
                                    No courses match your filters.
                                </p>
                            )}
                            {filteredEngagementCourses.map((courseItem, idx) => {
                                const utilizationPercent = courseItem.utilization;
                                const isLast = idx === filteredEngagementCourses.length - 1;

                                return (
                                    <div
                                        key={courseItem.name}
                                        className={`py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {courseItem.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {courseItem.views} views • {courseItem.enquiries} enquiries
                                                </p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#003971] rounded-full"
                                                            style={{ width: `${utilizationPercent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-600 min-w-[36px] text-right">
                                                        {utilizationPercent}%
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusStyles[courseItem.statusVariant]
                                                    }`}
                                            >
                                                {courseItem.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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

export default DemandPlanning;
