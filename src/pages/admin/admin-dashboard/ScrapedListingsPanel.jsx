import { useState, useEffect, useCallback } from 'react';
import { Search, ExternalLink, Trash2, ShieldAlert, ChevronDown, XCircle } from 'lucide-react';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';

/**
 * Admin review/removal for scraped external jobs (SerpApi, JSearch, RSS
 * feeds, and company career pages via Greenhouse/Lever/SmartRecruiters/
 * Workday) — self-contained on purpose. Marketplace.jsx's Jobs/Training
 * Courses tabs share a lot of tangled conditional logic (stats, filters,
 * CSV export, pagination math); wiring a third data shape through all of
 * that risked breaking those working tabs. This component owns its own
 * state/effects entirely, so it can only ever affect itself.
 */

const PROVIDER_LABELS = {
    serpapi: 'SerpApi',
    jsearch: 'JSearch',
    feed: 'RSS Feed',
    greenhouse: 'Greenhouse',
    lever: 'Lever',
    smartrecruiters: 'SmartRecruiters',
    workday: 'Workday',
};

const ITEMS_PER_PAGE = 10;

function ScrapedListingsPanel() {
    const [listings, setListings] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [providerFilter, setProviderFilter] = useState('All Sources');
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const load = useCallback(async (targetPage, searchValue, provider) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(targetPage),
                limit: String(ITEMS_PER_PAGE),
            });
            if (searchValue.trim()) params.set('search', searchValue.trim());
            if (provider !== 'All Sources') {
                const providerKey = Object.keys(PROVIDER_LABELS).find(
                    (key) => PROVIDER_LABELS[key] === provider,
                );
                if (providerKey) params.set('provider', providerKey);
            }

            const res = await httpClient.get(`${API_ENDPOINTS.ADMIN.EXTERNAL_JOBS}?${params.toString()}`);
            const rows = res?.data?.listings ?? res?.data?.data?.listings ?? [];
            const totalCount = res?.data?.pagination?.total ?? res?.pagination?.total ?? rows.length;

            setListings(rows);
            setTotal(Number(totalCount) || 0);
        } catch (error) {
            console.error('Failed to load scraped listings:', error);
            setListings([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load(page, search, providerFilter);
    }, [load, page, search, providerFilter]);

    useEffect(() => {
        setPage(1);
    }, [search, providerFilter]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        setDeleteError('');
        try {
            await httpClient.delete(API_ENDPOINTS.ADMIN.DELETE_EXTERNAL_JOB(deleteTarget.id));
            setDeleteTarget(null);
            // Reload the current page — the removed row simply won't be in it anymore.
            await load(page, search, providerFilter);
        } catch (error) {
            console.error('Failed to remove listing:', error);
            setDeleteError(error?.response?.data?.message || 'Failed to remove this listing. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    const startIndex = (page - 1) * ITEMS_PER_PAGE;

    const providerOptions = ['All Sources', ...Object.values(PROVIDER_LABELS)];

    return (
        <div className="flex flex-col">
            <div className="flex-shrink-0 bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <ShieldAlert className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-amber-900">Scraped / External Listings</h3>
                    <p className="text-xs text-amber-700 mt-0.5">
                        Pulled in automatically (SerpApi, JSearch, RSS feeds, Greenhouse, Lever, SmartRecruiters, Workday)
                        and shown to professionals as MaritimeLink job listings. No source verifies authenticity — review and remove anything that looks bad,
                        suspicious, or scam-like. Removing a listing here also hides it permanently, even if the source
                        lists the same job again on a future refresh.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col mb-6">
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search title, company, location..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowProviderDropdown((v) => !v)}
                                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${providerFilter !== 'All Sources' ? 'border-[#1e5a8f] text-[#1e5a8f] bg-[#1e5a8f]/5' : 'border-gray-200 text-gray-700'}`}
                            >
                                {providerFilter}
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            {showProviderDropdown && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                    {providerOptions.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                setProviderFilter(option);
                                                setShowProviderDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${providerFilter === option ? 'text-[#1e5a8f] font-semibold bg-gray-50' : 'text-gray-700'}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fetched</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                                        Loading scraped listings…
                                    </td>
                                </tr>
                            ) : listings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                                        No scraped listings found.
                                    </td>
                                </tr>
                            ) : (
                                listings.map((listing) => (
                                    <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{listing.title}</div>
                                            {listing.applyLink && (
                                                <a
                                                    href={listing.applyLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-[#1e5a8f] hover:underline mt-0.5"
                                                >
                                                    View source listing <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-900">{listing.company || '—'}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-900">{listing.location || '—'}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-500">
                                                {listing.fetchedAt ? new Date(listing.fetchedAt).toLocaleDateString() : '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => setDeleteTarget(listing)}
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{total === 0 ? 0 : startIndex + 1}</span> - <span className="font-semibold">{Math.min(startIndex + listings.length, total)}</span> of <span className="font-semibold">{total}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &larr;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${page === p ? 'bg-[#1e5a8f] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => { setDeleteTarget(null); setDeleteError(''); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Remove this listing?</h3>
                            <p className="text-gray-500 text-sm mt-2">
                                "{deleteTarget.title}"{deleteTarget.company ? ` at ${deleteTarget.company}` : ''} will
                                stop showing to professionals immediately, and won't reappear even if the source
                                lists it again.
                            </p>
                        </div>

                        {deleteError && (
                            <div className="mb-4 text-sm text-red-600 text-center">{deleteError}</div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setDeleteTarget(null); setDeleteError(''); }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Removing…' : 'Remove Listing'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScrapedListingsPanel;
