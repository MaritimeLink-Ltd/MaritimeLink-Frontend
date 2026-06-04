import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Download,
  Search,
  ArrowUpRight,
  AlertCircle,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import trainerDashboardService from "../../../../services/trainerDashboardService";
import SearchableFilterSelect from "../../../../components/common/SearchableFilterSelect";
import {
  buildCountryLocationFilterOptions,
  filterRenewalRowsByLocation,
} from "../../../../utils/trainerDemandLocationOptions";

const periodTabs = ["30 Days", "60 Days", "90 Days"];

const SUMMARY_FALLBACK = {
  certificatesExpiring: 0,
  certificatesExpiringTracked: 0,
  certificatesExpiringWindowLabel: "Next 30 days",
  courseSearchDemand: 0,
  activeEnquiries: 0,
};

function ExpiringCertificatesOverview() {
  const navigate = useNavigate();
  const [periodTab, setPeriodTab] = useState("30 Days");
  const [year, setYear] = useState("all");
  const [course, setCourse] = useState("all");
  const [location, setLocation] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardData, setDashboardData] = useState({
    summary: SUMMARY_FALLBACK,
    renewalDemand: [],
    availableRegions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const periodQuery =
    periodTab === "30 Days" ? "30d" : periodTab === "60 Days" ? "60d" : "90d";
  const summary = dashboardData.summary || SUMMARY_FALLBACK;
  const certificatesTracked =
    summary.certificatesExpiringTracked ?? summary.certificatesExpiring ?? 0;
  const certificatesInPeriod = summary.certificatesExpiring ?? 0;
  const topTrendingCourse = dashboardData.renewalDemand[0]?.course || "—";

  useEffect(() => {
    let alive = true;

    const loadOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await trainerDashboardService.getDemandOverview({
          period: periodQuery,
          year,
          course,
          region: location !== "all" ? location : undefined,
          city: location !== "all" ? location : undefined,
          search: searchTerm,
        });

        if (!alive) return;

        const data = response?.data || {};
        setDashboardData({
          summary: data.summary || SUMMARY_FALLBACK,
          renewalDemand: Array.isArray(data.renewalDemand)
            ? data.renewalDemand
            : [],
          availableRegions: Array.isArray(data.availableRegions)
            ? data.availableRegions
            : [],
        });
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Could not load expiring certificates.");
        setDashboardData({
          summary: SUMMARY_FALLBACK,
          renewalDemand: [],
          availableRegions: [],
        });
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadOverview();
    return () => {
      alive = false;
    };
  }, [course, location, periodQuery, searchTerm, year]);

  const locationOptions = useMemo(() => buildCountryLocationFilterOptions(), []);

  const filteredRows = useMemo(
    () => filterRenewalRowsByLocation(dashboardData.renewalDemand, location),
    [dashboardData.renewalDemand, location],
  );
  const handleExportCSV = () => {
    const headers = ["Course", "Expiring", "Trend Change", "Primary Locations"];
    const csvRows = filteredRows.map((row) => [
      row.course,
      row.expiring,
      row.trendChange ?? row.trend ?? 0,
      row.locations,
    ]);
    const csv = [
      headers.join(","),
      ...csvRows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expiring-certificates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export completed");
  };

  const handleDownloadReport = () => {
    toast.success("Report download started");
  };

  return (
    <div className="min-h-full flex flex-col pb-6">
      <Toaster position="top-right" />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-[26px] md:text-[28px] font-bold text-gray-900">
              Expiring Certificates Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor upcoming renewals and move professionals into the right
              training window.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses, locations..."
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
            label="Year"
            value={year}
            onChange={setYear}
            options={[
              { value: "all", label: "All Years" },
              { value: "2025", label: "2025" },
              { value: "2026", label: "2026" },
            ]}
          />
          <FilterSelect
            label="Course"
            value={course}
            onChange={setCourse}
            options={[
              { value: "all", label: "All Courses" },
              { value: "stcw", label: "STCW Basic Safety" },
              { value: "firefighting", label: "Advanced Firefighting" },
              { value: "gwo", label: "GWO Sea Survival" },
              { value: "medical", label: "Medical Care Onboard" },
            ]}
          />
          <SearchableFilterSelect
            label="Location"
            value={location}
            onChange={setLocation}
            options={locationOptions}
            placeholder="Search country..."
            minWidth="min-w-[200px]"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Certificates expiring (tracked)
              </p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "—" : certificatesTracked}
                </p>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                  Next 12 mo
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {loading
                  ? " "
                  : `${certificatesInPeriod} due within ${summary.certificatesExpiringWindowLabel}`}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Table: next 12 months</span>
            <span>
              {topTrendingCourse !== "—"
                ? `Top: ${topTrendingCourse}`
                : "No trend yet"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Course Search Demand
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? "—" : summary.courseSearchDemand}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Unique professionals with expiries in the next 12 months.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Enquiries
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? "—" : summary.activeEnquiries}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Pending bookings for active courses.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Expiring Certificates
          </h2>
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
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  Expiring
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  Trend
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Primary Locations
                </th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const isLast = idx === filteredRows.length - 1;
                const trendValue = Number(row.trendChange ?? row.trend ?? 0);
                const trendUp = trendValue >= 0;

                return (
                  <tr
                    key={`${row.course}-${idx}`}
                    className={`hover:bg-gray-50/60 transition-colors ${!isLast ? "border-b border-gray-50" : ""}`}
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
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${trendUp ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        {trendValue >= 0 ? `+${trendValue}` : trendValue}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.locations}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/trainingprovider/expiries", {
                            state: {
                              certificate: row.bucket || row.course,
                              period: "all",
                              city: location !== "all" ? location : undefined,
                            },
                          })
                        }
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

        {loading && (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading expiring certificate overview...
          </div>
        )}

        {!loading && filteredRows.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No results match your filters. Try adjusting period, course, or location.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
      >
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
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        />
      </div>
    </div>
  );
}

export default ExpiringCertificatesOverview;
