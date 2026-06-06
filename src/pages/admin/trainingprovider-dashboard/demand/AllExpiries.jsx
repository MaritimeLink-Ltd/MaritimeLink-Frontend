import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { ChevronDown, Search, Download, ChevronsUpDown } from "lucide-react";
import trainerDashboardService from "../../../../services/trainerDashboardService";
import { useKycGuard } from "../../../../context/KycContext";
import { KYC_ACTIONS } from "../../../../constants/kycRestrictedActions";

const periodOptions = [
  { value: "all", label: "All" },
  { value: "30", label: "30 Days" },
  { value: "60", label: "60 Days" },
  { value: "90", label: "90 Days" },
];

const normalizeInitialPeriod = (value) => {
  if (value === "30d" || value === "30") return "30";
  if (value === "60d" || value === "60") return "60";
  if (value === "90d" || value === "90") return "90";
  return "all";
};

const normalizeInitialCertificate = (value) => {
  if (!value) return "all";
  const c = String(value).toLowerCase();
  if (c === "stcw" || c.includes("stcw")) return "stcw";
  if (c === "firefighting" || c.includes("firefighting")) return "firefighting";
  if (c === "gwo" || c.includes("gwo")) return "gwo";
  if (c === "medical" || c.includes("medical")) return "medical";
  if (c === "other" || c.includes("other")) return "other";
  return "all";
};

function AllExpiries() {
  const navigate = useNavigate();
  const location = useLocation();
  const { guardRestrictedAction } = useKycGuard();
  const [period, setPeriod] = useState(() =>
    normalizeInitialPeriod(location.state?.period),
  );
  const [year, setYear] = useState("all");
  const [city, setCity] = useState(() => {
    const fromNav = location.state?.city;
    return fromNav && String(fromNav).trim() ? String(fromNav).trim() : "all";
  });
  const [certificateType, setCertificateType] = useState(() =>
    normalizeInitialCertificate(location.state?.certificate),
  );
  const [rank, setRank] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const periodQuery =
    period === "30"
      ? "30d"
      : period === "60"
        ? "60d"
        : period === "90"
          ? "90d"
          : "all";

  useEffect(() => {
    let alive = true;
    const loadRows = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await trainerDashboardService.getDemandExpiries({
          period: periodQuery,
          year,
          city,
          certificate: certificateType,
          rank,
          search: searchTerm,
          page: currentPage,
          limit: pageSize,
        });

        if (!alive) return;
        const data = response?.data || {};
        setRows(Array.isArray(data.expiries) ? data.expiries : []);
        setPagination(
          response?.pagination || {
            page: 1,
            limit: pageSize,
            total: 0,
            pages: 1,
          },
        );
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Could not load expiries.");
        setRows([]);
        setPagination({ page: 1, limit: pageSize, total: 0, pages: 1 });
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadRows();
    return () => {
      alive = false;
    };
  }, [
    certificateType,
    city,
    currentPage,
    pageSize,
    periodQuery,
    rank,
    searchTerm,
    year,
  ]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Expiry Date",
      "Days Left",
      "Location",
      "Rank",
    ];
    const csvRows = rows.map((r) => {
      const daysLeft = Math.max(
        0,
        Math.ceil(
          (new Date(r.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
        ),
      );
      return [
        r.professionalName,
        formatDate(r.expiryDate),
        `${daysLeft} days`,
        r.location,
        r.rank,
      ];
    });
    const csv = [
      headers.join(","),
      ...csvRows.map((row) => row.map((c) => `"${c}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export completed");
  };

  const handleDownloadReport = () => {
    toast.success("Report download started");
  };

  const openProfessionalProfile = (row) => {
    const profileId = row.professionalId;
    if (!profileId) return;
    guardRestrictedAction(KYC_ACTIONS.VIEW_PROFESSIONAL_PROFILE, () => {
      navigate(`/trainingprovider/candidate/${profileId}`, {
        state: {
          isProfessionalView: true,
          returnPath: "/trainingprovider/expiries",
          candidateData: {
            fullname: row.professionalName,
            rank: row.rank,
          },
        },
      });
    });
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
            onChange={(v) => {
              setPeriod(v);
              setCurrentPage(1);
            }}
            options={periodOptions}
          />
          <FilterSelect
            label="Year"
            value={year}
            onChange={(v) => {
              setYear(v);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Years" },
              { value: "2025", label: "2025" },
              { value: "2026", label: "2026" },
            ]}
          />
          <FilterSelect
            label="City"
            value={city}
            onChange={(v) => {
              setCity(v);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Cities" },
              { value: "liverpool", label: "Liverpool" },
              { value: "aberdeen", label: "Aberdeen" },
              { value: "hull", label: "Hull" },
            ]}
          />
          <FilterSelect
            label="Certificate"
            value={certificateType}
            onChange={(v) => {
              setCertificateType(v);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Certificates" },
              { value: "stcw", label: "STCW Basic Safety" },
              { value: "firefighting", label: "Advanced Firefighting" },
              { value: "gwo", label: "GWO Sea Survival" },
              { value: "medical", label: "Medical Care Onboard" },
              { value: "other", label: "Other Training" },
            ]}
          />
          <FilterSelect
            label="Rank"
            value={rank}
            onChange={(v) => {
              setRank(v);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Ranks" },
              { value: "able seaman", label: "Able Seaman" },
              { value: "officer", label: "Officer" },
              { value: "master", label: "Master" },
            ]}
          />
        </div>
      </div>

      {/* Expiring Certificates Table */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
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

        <div className="overflow-x-auto flex-1">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">
                  <span className="flex items-center gap-1">
                    Name <ChevronsUpDown className="h-3.5 w-3.5" />
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
              {rows.map((row, idx) => {
                const isLast = idx === rows.length - 1;

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50/60 transition-colors ${!isLast ? "border-b border-gray-50" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {row.professionalName}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(row.expiryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                        {Math.max(
                          0,
                          Math.ceil(
                            (new Date(row.expiryDate) - new Date()) /
                              (1000 * 60 * 60 * 24),
                          ),
                        )}{" "}
                        days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.location}</td>
                    <td className="px-4 py-3 text-gray-700">{row.rank}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProfessionalProfile(row);
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

        {loading && (
          <div className="flex-1 flex items-center justify-center py-12 text-gray-500 text-sm">
            Loading expiries...
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-12 text-gray-500 text-sm">
            No expiries match your filters. Try adjusting period or filters.
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing{" "}
            {pagination.total === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, pagination.total)} of{" "}
            {pagination.total} expiries
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
            {Array.from({ length: Math.min(3, pagination.pages) }, (_, i) => {
              const p =
                pagination.pages <= 3
                  ? i + 1
                  : Math.min(currentPage, pagination.pages - 2) + i;
              if (p < 1 || p > pagination.pages) return null;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    currentPage === p
                      ? "bg-[#003971] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.pages, p + 1))
              }
              disabled={currentPage === pagination.pages}
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
          className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] cursor-pointer min-w-[120px] w-full"
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

export default AllExpiries;
