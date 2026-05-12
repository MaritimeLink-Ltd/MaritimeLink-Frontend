import React, { useState, useEffect, useMemo } from 'react';
import {
    Download,
    Share2,
    Upload,
    Edit2,
    Trash2,
    FileText,
    Crown,
    Award,
    Folder,
    CheckCircle,
    Copy,
    Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UploadDocument from './UploadDocument';
import EditDocument from './EditDocument';
import DocumentDetail from './DocumentDetail';
import CategoryDocuments from './CategoryDocuments';
import documentService from '../../../../services/documentService';
import authService from '../../../../services/authService';
import { API_CONFIG, rewriteShareLinkForSharing } from '../../../../config/api.config';
// import { getDocumentStatusMeta } from '../../../../utils/documentStatus';
import { getDocumentDisplayCategory } from '../../../../utils/documentCategory';
import { documentMatchesWalletFilter, EXPIRING_SOON_DAYS } from '../../../../utils/documentStatus';
import { isPremiumTier } from '../../../../utils/isPremiumTier';

const WALLET_STATUS_TABS = [
    { id: 'all', label: 'All' },
    { id: 'ready', label: 'Compliance Ready' },
    { id: 'expiring', label: 'Expiring Soon' },
    { id: 'expired', label: 'Expired' },
    { id: 'rejected', label: 'Rejected' },
];

const DocumentsWallet = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('list'); // 'list', 'upload', 'edit', 'detail', 'category'
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [uploadCategory, setUploadCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [walletStatusFilter, setWalletStatusFilter] = useState('all');

    // Pro membership
    const [membershipTier, setMembershipTier] = useState('FREE');

    // Modal states for export and share
    const [showExportModal, setShowExportModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [exportProgress, setExportProgress] = useState({ done: 0, total: 0, label: '' });
    const [exportError, setExportError] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [shareDetails, setShareDetails] = useState(null);

    // Real data state
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    /** Wallet grid categories only — resume/CV rows are stored but not shown here */
    const categoryDefinitions = [
        {
            id: 'licenses',
            title: 'Licenses & Endorsements',
            icon: FileText,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-600',
        },
        {
            id: 'stcw',
            title: 'STCW Certificates',
            icon: Award,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
        },
        {
            id: 'medical',
            title: 'Medical Certificates',
            icon: Folder,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
        },
        {
            id: 'seaman',
            title: 'Seaman Book data/Stamp pages',
            icon: FileText,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
        },
        {
            id: 'travel',
            title: 'Travel Documents',
            icon: Crown,
            iconBg: 'bg-cyan-50',
            iconColor: 'text-cyan-500',
        },
        {
            id: 'academic',
            title: 'Academic Qualifications',
            icon: Award,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-500',
        },
        {
            id: 'company',
            title: 'Company Letters / Misc',
            icon: Folder,
            iconBg: 'bg-cyan-50',
            iconColor: 'text-cyan-500',
        },
        {
            id: 'appraisals',
            title: 'Recent Appraisals',
            icon: FileText,
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-500',
        },
    ];

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await documentService.getDocuments();
            let docs = [];
            if (response?.data?.documents) {
                docs = response.data.documents;
            } else if (Array.isArray(response?.data)) {
                docs = response.data;
            } else if (Array.isArray(response)) {
                docs = response;
            }

            setDocuments(docs);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    useEffect(() => {
        let mounted = true;
        const loadTier = async () => {
            try {
                const accountResponse = await authService.getMyAccount();
                const professional = accountResponse?.data?.professional || null;
                const tier = professional?.tier || professional?.membershipTier || professional?.membership?.tier || 'FREE';
                if (mounted) setMembershipTier(tier || 'FREE');
            } catch {
                // keep FREE as fallback
            }
        };
        loadTier();
        return () => {
            mounted = false;
        };
    }, []);

    const walletDocumentsForShare = useMemo(() => {
        const EXCLUDED = new Set(['CV_RESUME', 'COVER_LETTER']);
        return documents.filter((d) => d.category && !EXCLUDED.has(d.category));
    }, [documents]);

    const walletFolderRows = useMemo(() => {
        const EXCLUDED = new Set(['CV_RESUME', 'COVER_LETTER']);
        const walletDocs = documents.filter((d) => d.category && !EXCLUDED.has(d.category));
        const docsByCategoryId = {};
        walletDocs.forEach((doc) => {
            const catId = getDocumentDisplayCategory(doc);
            if (!catId) return;
            if (!docsByCategoryId[catId]) docsByCategoryId[catId] = [];
            docsByCategoryId[catId].push(doc);
        });
        return categoryDefinitions.map((def) => ({
            ...def,
            catDocs: docsByCategoryId[def.id] || [],
        }));
    }, [documents]);

    const shareModalCategorySummary = useMemo(
        () =>
            walletFolderRows.map(({ catDocs, ...def }) => ({
                ...def,
                count: catDocs.length,
            })),
        [walletFolderRows],
    );

    const dynamicCategories = useMemo(
        () =>
            walletFolderRows.map(({ catDocs, ...def }) => {
                const filtered =
                    walletStatusFilter === 'all'
                        ? catDocs
                        : catDocs.filter((d) => documentMatchesWalletFilter(d, walletStatusFilter));
                return {
                    ...def,
                    count: walletStatusFilter === 'all' ? catDocs.length : filtered.length,
                };
            }),
        [walletFolderRows, walletStatusFilter],
    );

    const filteredDynamicCategories = useMemo(() => {
        return dynamicCategories.filter((category) => {
            const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
            if (walletStatusFilter !== 'all' && category.count === 0) return false;
            return true;
        });
    }, [dynamicCategories, searchQuery, walletStatusFilter]);

    const handleUploadComplete = (newDoc) => {
        fetchDocuments(); // refresh list
        setSelectedDoc(newDoc);
        setView('detail');
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setView('category');
    };

    const isInternalUrl = (url) => {
        try {
            const fileOrigin = new URL(url).origin;
            const apiOrigin = new URL(API_CONFIG.BASE_URL).origin;
            return fileOrigin === apiOrigin;
        } catch {
            return true;
        }
    };

    const resolveFileUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${base}${path}`;
    };

    const sanitizeFileName = (value) =>
        String(value || 'document')
            .trim()
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
            .replace(/\s+/g, '_')
            .slice(0, 140) || 'document';

    const guessExtension = ({ url, contentType }) => {
        const ct = String(contentType || '').toLowerCase();
        if (ct.includes('pdf')) return '.pdf';
        if (ct.includes('png')) return '.png';
        if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg';
        if (ct.includes('webp')) return '.webp';
        if (ct.includes('heic')) return '.heic';
        if (ct.includes('zip')) return '.zip';
        if (ct.includes('msword')) return '.doc';
        if (ct.includes('officedocument.wordprocessingml')) return '.docx';
        if (ct.includes('officedocument.spreadsheetml')) return '.xlsx';
        if (ct.includes('spreadsheet')) return '.xls';
        if (ct.includes('text/plain')) return '.txt';

        const u = String(url || '').toLowerCase();
        const match = u.match(/\.([a-z0-9]{2,6})(?:\?|#|$)/);
        if (match) return `.${match[1]}`;
        return '';
    };

    // Handle Export Document Pack
    const handleExportDocumentPack = async () => {
        if (!isPremiumTier(membershipTier)) {
            setShowPremiumModal(true);
            return;
        }

        setShowExportModal(true);
        setExportError('');

        try {
            const docs = Array.isArray(documents) ? documents : [];
            const exportable = docs
                .map((doc) => {
                    const rawUrl =
                        doc?.fileUrl ||
                        doc?.url ||
                        doc?.documentUrl ||
                        doc?.path ||
                        doc?.image ||
                        null;
                    const resolvedUrl = resolveFileUrl(rawUrl);
                    return { doc, resolvedUrl };
                })
                .filter((x) => Boolean(x.resolvedUrl));

            if (exportable.length === 0) {
                setExportError('No downloadable files found in your documents yet.');
                setExportProgress({ done: 0, total: 0, label: '' });
                return;
            }

            const { default: JSZip } = await import('jszip');
            const zip = new JSZip();

            const total = exportable.length;
            setExportProgress({ done: 0, total, label: 'Starting export…' });

            for (let i = 0; i < exportable.length; i += 1) {
                const { doc, resolvedUrl } = exportable[i];

                const displayName =
                    doc?.name ||
                    doc?.title ||
                    doc?.documentName ||
                    doc?.category ||
                    `document_${i + 1}`;
                const folderName = sanitizeFileName(doc?.category || doc?.type || 'documents');

                setExportProgress({
                    done: i,
                    total,
                    label: `Downloading ${i + 1}/${total}: ${displayName}`,
                });

                const needsAuth = isInternalUrl(resolvedUrl);
                const token = needsAuth
                    ? (localStorage.getItem('authToken') ||
                        localStorage.getItem('token') ||
                        localStorage.getItem('accessToken') ||
                        null)
                    : null;

                const response = await fetch(resolvedUrl, {
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!response.ok) {
                    throw new Error(
                        `Failed to download "${displayName}" (${response.status} ${response.statusText})`,
                    );
                }

                const contentType = response.headers.get('content-type') || '';
                const blob = await response.blob();
                const ext = guessExtension({ url: resolvedUrl, contentType });
                const baseFileName = sanitizeFileName(displayName);
                const fileName = baseFileName.toLowerCase().endsWith(ext) ? baseFileName : `${baseFileName}${ext}`;

                zip.folder(folderName).file(fileName, blob);

                setExportProgress({
                    done: i + 1,
                    total,
                    label: `Added ${i + 1}/${total}`,
                });
            }

            setExportProgress({ done: total, total, label: 'Building zip…' });
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `DocumentPack_${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            await documentService.markReportGenerated();
            setExportProgress({ done: total, total, label: 'Done' });
            setTimeout(() => {
                setShowExportModal(false);
            }, 800);
        } catch (err) {
            console.error('Export document pack failed', err);
            setExportError(err?.message || 'Failed to export document pack.');
        }
    };

    // Handle Share Secure Link
    const handleShareSecureLink = async () => {
        if (!isPremiumTier(membershipTier)) {
            setShowPremiumModal(true);
            return;
        }

        setShowShareModal(true);
        setShareLoading(true);
        setGeneratedLink('');
        setShareDetails(null);
        setLinkCopied(false);

        try {
            const response = await documentService.createShareLink();
            const d = response?.data ?? response ?? {};
            const secureLink = d.secureLink || '';
            if (!secureLink) {
                throw new Error('Could not generate secure link.');
            }
            setGeneratedLink(rewriteShareLinkForSharing(secureLink));
            setShareDetails({
                expiresAt: d.expiresAt || null,
                previewOnly: d.previewOnly !== false,
                expiresInSeconds: d.expiresInSeconds ?? null,
            });
        } catch (error) {
            console.error('Create share link failed', error);
            setGeneratedLink('');
            setShareDetails(null);
        } finally {
            setShareLoading(false);
        }
    };

    // Copy link to clipboard
    const handleCopyLink = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    if (view === 'upload') {
        return (
            <UploadDocument
                onBack={() => {
                    setView('list');
                    setUploadCategory(null);
                }}
                onCompletion={handleUploadComplete}
                category={uploadCategory || selectedCategory || undefined}
            />
        );
    }

    if (view === 'edit') {
        return <EditDocument
            document={selectedDoc}
            onBack={() => { setView('list'); setSelectedDoc(null); fetchDocuments(); }}
            onCompletion={(updatedDoc) => {
                fetchDocuments();
                setSelectedDoc(updatedDoc);
                setView('detail');
            }}
        />;
    }

    if (view === 'detail') {
        return <DocumentDetail 
            document={selectedDoc} 
            onBack={() => { setView('list'); setSelectedDoc(null); fetchDocuments(); }}
            onDeleteSuccess={() => { setView('list'); setSelectedDoc(null); fetchDocuments(); }}
        />;
    }

    if (view === 'category') {
        return <CategoryDocuments
            category={selectedCategory}
            walletStatusFilter={walletStatusFilter}
            walletFilterLabel={WALLET_STATUS_TABS.find((t) => t.id === walletStatusFilter)?.label}
            onBack={() => { setView('list'); setSelectedCategory(null); fetchDocuments(); }}
            onUploadClick={() => setView('upload')}
        />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto min-h-screen pb-10">
            {/* Sticky Header Section */}
            <div className="lg:sticky lg:top-0 bg-gray-50 lg:z-10 px-4 sm:px-6 pt-4 pb-2">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-4">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Documents Wallet</h1>
                        <p className="text-gray-500 mt-0.5 text-sm sm:text-base">Manage your uploaded documents</p>
                    </div>

                    {/* Search Bar - Hidden on mobile, shown on tablet+ */}
                    <div className="relative w-full sm:w-56 hidden sm:block">
                        <input
                            type="text"
                            placeholder="Search docs..."
                            className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 text-sm bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                    </div>

                    {/* Action Buttons - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleExportDocumentPack}
                            className="flex items-center justify-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-900 transition-colors min-h-[44px]"
                        >
                            <Crown size={14} />
                            <span className="hidden sm:inline">Export Document Pack</span>
                            <span className="sm:hidden">Export Pack</span>
                        </button>
                        <button
                            onClick={handleShareSecureLink}
                            className="flex items-center justify-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-900 transition-colors min-h-[44px]"
                        >
                            <Crown size={14} />
                            <span className="hidden sm:inline">Share Secure Link</span>
                            <span className="sm:hidden">Share Link</span>
                        </button>
                    </div>
                </div>

                {/* Upload Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setView('upload')}
                        className="flex items-center justify-center gap-2 bg-blue-50 text-[#003366] px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors min-h-[44px] flex-shrink-0"
                    >
                        <Upload size={16} />
                        Upload Document
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                    {WALLET_STATUS_TABS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            title={
                                id === 'expiring'
                                    ? `Expiry date is within the next ${EXPIRING_SOON_DAYS} days (from today)`
                                    : undefined
                            }
                            onClick={() => setWalletStatusFilter(id)}
                            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                                walletStatusFilter === id
                                    ? 'bg-[#003366] text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories Grid - Single column on mobile, 2 on tablet+ */}
            <div className="px-4 sm:px-6 pt-3 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {isLoading ? (
                    <div className="col-span-full py-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                    </div>
                ) : filteredDynamicCategories.length > 0 ? (
                    filteredDynamicCategories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            {/* Icon Box */}
                            <div className={`w-12 h-12 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0`}>
                                <cat.icon size={22} className={cat.iconColor} />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-800 leading-tight">{cat.title}</h3>
                                        <p className="text-gray-400 text-sm mt-0.5 font-medium">{cat.count} Documents</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        <Folder className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No documents found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Export Document Pack Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                                    <Download size={32} className="text-[#003366] animate-bounce" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Preparing Document Pack</h3>
                            <p className="text-gray-500 mb-4">{exportProgress.label || 'Compressing all your documents into a zip file…'}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-[#003366] h-2 rounded-full transition-all"
                                    style={{
                                        width:
                                            exportProgress.total > 0
                                                ? `${Math.round((exportProgress.done / exportProgress.total) * 100)}%`
                                                : '30%',
                                    }}
                                />
                            </div>
                            {exportError ? (
                                <div className="mt-4 text-sm text-red-600">{exportError}</div>
                            ) : (
                                <p className="text-sm text-gray-400 mt-3">
                                    {exportProgress.total > 0
                                        ? `${exportProgress.done}/${exportProgress.total} files`
                                        : 'This will take just a moment'}
                                </p>
                            )}
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="mt-6 w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors border border-gray-200 hover:bg-gray-50 bg-white rounded-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Secure Link Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Share Secure Link</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowShareModal(false);
                                    setShareLoading(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2.5 mb-4 text-xs text-gray-700 space-y-1">
                            <p>
                                <span className="font-semibold text-[#003366]">7-day access.</span>{' '}
                                This link stops working after seven days.
                            </p>
                            <p>
                                <span className="font-semibold text-[#003366]">Preview only.</span>{' '}
                                Recipients can view documents in the browser; direct downloads are not provided on the shared page.
                            </p>
                            {shareDetails?.expiresAt && (
                                <p className="text-gray-600">
                                    Expires:{' '}
                                    <strong>
                                        {new Date(shareDetails.expiresAt).toLocaleString(undefined, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </strong>
                                </p>
                            )}
                        </div>

                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Documents included ({walletDocumentsForShare.length})
                            </p>
                            <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 bg-gray-50/50">
                                {walletDocumentsForShare.length === 0 ? (
                                    <p className="p-3 text-sm text-gray-500">No wallet documents to share yet.</p>
                                ) : (
                                    walletDocumentsForShare.map((doc) => (
                                        <div key={doc.id} className="px-3 py-2 text-sm">
                                            <p className="font-medium text-gray-900 line-clamp-2">{doc.name || 'Untitled'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">
                                                {String(getDocumentDisplayCategory(doc) || '').replace(/-/g, ' ')}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                {shareLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#003366] border-t-transparent" />
                                        <p className="text-sm text-gray-600">Generating secure link…</p>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} className={generatedLink ? 'text-green-500' : 'text-amber-500'} />
                                        <p className="text-sm text-gray-600">
                                            {generatedLink
                                                ? 'Secure link generated! Copy and send it only to people you trust.'
                                                : 'We could not generate a secure link right now.'}
                                        </p>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                The link opens a MaritimeLink page (not a raw file URL). Share it securely.
                            </p>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 break-all text-sm text-gray-700 mb-4">
                                {shareLoading
                                    ? '…'
                                    : generatedLink ||
                                      'Unable to generate secure link right now. Please try again.'}
                            </div>

                            <button
                                type="button"
                                onClick={handleCopyLink}
                                disabled={!generatedLink || shareLoading}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${linkCopied
                                    ? 'bg-green-50 text-green-600 border-2 border-green-500'
                                    : generatedLink
                                        ? 'bg-[#003366] text-white hover:bg-blue-900'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {linkCopied ? (
                                    <>
                                        <CheckCircle size={18} />
                                        <span>Link Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        <span>Copy Link</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <p className="text-xs text-gray-500 mb-3">Summary by folder</p>
                            <div className="grid grid-cols-2 gap-2">
                                {shareModalCategorySummary.map((cat) => (
                                    <div key={cat.id} className="flex items-center gap-2 text-xs text-gray-600">
                                        <cat.icon size={14} className={cat.iconColor} />
                                        <span>
                                            {cat.count} {cat.title.split(' ')[0]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowShareModal(false);
                                setShareLoading(false);
                            }}
                            className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Feature Modal */}
            {showPremiumModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center">
                                <Star size={32} className="text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Premium Feature
                        </h3>

                        <p className="text-gray-500 mb-8 text-sm sm:text-base">
                            Upgrade to Premium to unlock Export Document Pack, Secure Link Sharing, and many other exclusive features to boost your maritime career.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/personal/profile/manage-subscription')}
                                className="w-full bg-[#003366] text-white py-3.5 px-4 rounded-xl hover:bg-blue-900 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                            >
                                <Crown size={20} />
                                Yes, Upgrade Now
                            </button>

                            <button
                                onClick={() => setShowPremiumModal(false)}
                                className="w-full text-gray-500 hover:text-gray-700 py-3.5 px-4 rounded-xl font-medium transition-colors border border-gray-200 hover:bg-gray-50 bg-white"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsWallet;
