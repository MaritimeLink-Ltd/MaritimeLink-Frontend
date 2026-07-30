import { useEffect, useMemo, useState } from 'react';
import {
    X,
    Check,
    Folder,
    ChevronRight,
    ChevronLeft,
    FileText,
    Link2,
    Copy,
    Clock,
    Download,
    ShieldCheck,
    Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ModalOverlay from '../common/ModalOverlay';
import documentService from '../../services/documentService';
import profileShareService from '../../services/profileShareService';
import { getApiErrorMessage } from '../../utils/apiError';
import { rewriteShareLinkForSharing } from '../../config/api.config';

const EXPIRY_OPTIONS = [
    { hours: 24, label: '24 hours', hint: 'Recommended' },
    { hours: 72, label: '3 days', hint: null },
    { hours: 168, label: '7 days', hint: 'Maximum' },
];

/** Turn a raw document category into a readable folder name. */
function formatCategoryLabel(raw) {
    return String(raw || 'Document')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * "Share Profile" flow: pick what the recipient may see (resume + specific document
 * wallet items), then generate a secure expiring link. Mirrors the selective-sharing
 * pattern used when applying for a job.
 */
export default function ShareProfileModal({ isOpen, onClose }) {
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [includeResume, setIncludeResume] = useState(true);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [openFolder, setOpenFolder] = useState(null);
    const [expiresInHours, setExpiresInHours] = useState(24);
    // Preview-only by default; the professional opts in to downloads.
    const [allowDownload, setAllowDownload] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generated, setGenerated] = useState(null);
    const [copied, setCopied] = useState(false);

    // Load the wallet each time the modal opens so newly uploaded docs appear.
    useEffect(() => {
        if (!isOpen) return undefined;

        let alive = true;
        setIsLoadingDocuments(true);
        (async () => {
            try {
                const res = await documentService.getDocuments();
                if (!alive) return;
                const list = res?.data?.documents || [];
                setDocuments(
                    list
                        .filter((d) => d.category !== 'CV_RESUME' && d.category !== 'COVER_LETTER')
                        .map((d) => ({
                            id: d.id,
                            name: d.name || 'Untitled document',
                            category: d.displayCategory || d.category || 'Document',
                            expiryDate: d.expiryDate,
                        })),
                );
            } catch (error) {
                if (alive) {
                    console.error('Failed to load documents for sharing:', error);
                    toast.error('Could not load your document wallet.');
                }
            } finally {
                if (alive) setIsLoadingDocuments(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [isOpen]);

    // Reset back to a clean state whenever the modal is dismissed.
    useEffect(() => {
        if (isOpen) return;
        setGenerated(null);
        setCopied(false);
        setOpenFolder(null);
        setSelectedDocuments([]);
        setIncludeResume(true);
        setExpiresInHours(24);
    }, [isOpen]);

    const folders = useMemo(() => {
        const grouped = documents.reduce((acc, doc) => {
            const key = formatCategoryLabel(doc.category);
            if (!acc[key]) acc[key] = [];
            acc[key].push(doc);
            return acc;
        }, {});
        return Object.entries(grouped).map(([name, docs]) => ({ name, documents: docs }));
    }, [documents]);

    const activeFolder = useMemo(
        () => folders.find((f) => f.name === openFolder) || null,
        [folders, openFolder],
    );

    const toggleDocument = (id) => {
        setSelectedDocuments((prev) =>
            prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id],
        );
    };

    const toggleFolder = (folder) => {
        const ids = folder.documents.map((d) => d.id);
        const allSelected = ids.every((id) => selectedDocuments.includes(id));
        setSelectedDocuments((prev) =>
            allSelected
                ? prev.filter((id) => !ids.includes(id))
                : [...new Set([...prev, ...ids])],
        );
    };

    const nothingSelected = !includeResume && selectedDocuments.length === 0;

    const handleGenerate = async () => {
        if (nothingSelected || isGenerating) return;

        setIsGenerating(true);
        try {
            const res = await profileShareService.createShareLink({
                includeResume,
                documentIds: selectedDocuments,
                expiresInHours,
                allowDownload,
            });
            const data = res?.data || {};
            if (!data.shareLink) throw new Error('No link was returned.');
            // The API builds links from its own FRONTEND_URL; force the public domain.
            setGenerated({
                shareLink: rewriteShareLinkForSharing(data.shareLink),
                expiresAt: data.expiresAt,
                allowDownload: data.allowDownload === true,
            });
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Could not create the share link. Please try again.'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!generated?.shareLink) return;
        try {
            await navigator.clipboard.writeText(generated.shareLink);
            setCopied(true);
            toast.success('Link copied to clipboard.');
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error('Could not copy automatically — please copy the link manually.');
        }
    };

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-[#003971] flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            Share Profile
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Create a secure link to your profile and choose exactly what the recipient can see.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {generated ? (
                    <div className="px-6 py-6 space-y-5">
                        <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
                            <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold text-green-800">Your secure link is ready</p>
                                <p className="text-green-700 mt-0.5">
                                    Anyone with this link can preview the selected items until it expires. Downloading is disabled.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="share-profile-link" className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                                Shareable link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="share-profile-link"
                                    type="text"
                                    readOnly
                                    value={generated.shareLink}
                                    onFocus={(e) => e.target.select()}
                                    className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="bg-[#003971] text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#002855] transition-colors whitespace-nowrap"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        {generated.expiresAt && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#003971]" />
                                Expires{' '}
                                <strong className="text-gray-900">
                                    {new Date(generated.expiresAt).toLocaleString(undefined, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </strong>
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setGenerated(null)}
                                className="border-2 border-[#003971] text-[#003971] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#003971] hover:text-white transition-colors"
                            >
                                Create another link
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">
                            <section>
                                <h3 className="text-sm font-bold text-gray-800 mb-1">Resume</h3>
                                <p className="text-xs text-gray-500 mb-3">
                                    Your profile summary (rank, sea time, skills) is always included.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIncludeResume((prev) => !prev)}
                                    className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-colors ${
                                        includeResume ? 'border-[#003971] bg-[#003971]/5' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                                            includeResume ? 'bg-[#003971] border-[#003971]' : 'border-gray-300 bg-white'
                                        }`}
                                    >
                                        {includeResume && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <FileText className={`h-5 w-5 flex-shrink-0 ${includeResume ? 'text-[#003971]' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Include full resume detail</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Licences &amp; endorsements, education and STCW certificates.
                                        </p>
                                    </div>
                                </button>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-bold text-gray-800">
                                        Document Wallet <span className="text-gray-400 font-normal">(Optional)</span>
                                    </h3>
                                    {selectedDocuments.length > 0 && (
                                        <span className="text-xs font-bold text-[#003971]">
                                            {selectedDocuments.length} selected
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-3">
                                    Choose which certificates and documents this link may reveal.
                                </p>

                                {isLoadingDocuments ? (
                                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                                        <Loader2 className="h-5 w-5 animate-spin text-[#003971]" />
                                        Loading your documents…
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                                        No shareable documents in your wallet yet.
                                    </div>
                                ) : !activeFolder ? (
                                    <div className="space-y-2">
                                        {folders.map((folder) => {
                                            const selectedCount = folder.documents.filter((d) =>
                                                selectedDocuments.includes(d.id),
                                            ).length;
                                            return (
                                                <div
                                                    key={folder.name}
                                                    className={`flex items-center gap-3 p-4 border rounded-xl transition-colors ${
                                                        selectedCount > 0
                                                            ? 'border-[#003971] bg-[#003971]/5'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleFolder(folder)}
                                                        aria-label={`Select all in ${folder.name}`}
                                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                                                            selectedCount === folder.documents.length
                                                                ? 'bg-[#003971] border-[#003971]'
                                                                : 'border-gray-300 bg-white'
                                                        }`}
                                                    >
                                                        {selectedCount === folder.documents.length && (
                                                            <Check size={14} className="text-white" strokeWidth={3} />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenFolder(folder.name)}
                                                        className="flex items-center justify-between gap-3 flex-1 min-w-0 text-left"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <Folder
                                                                className={`h-5 w-5 flex-shrink-0 ${
                                                                    selectedCount > 0 ? 'text-[#003971]' : 'text-gray-400'
                                                                }`}
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-sm text-gray-900 truncate">{folder.name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {folder.documents.length} document(s)
                                                                    {selectedCount > 0 ? ` · ${selectedCount} selected` : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => setOpenFolder(null)}
                                            className="flex items-center gap-1 text-sm font-bold text-[#003971] hover:underline mb-1"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            All folders
                                        </button>
                                        {activeFolder.documents.map((doc) => {
                                            const checked = selectedDocuments.includes(doc.id);
                                            return (
                                                <button
                                                    key={doc.id}
                                                    type="button"
                                                    onClick={() => toggleDocument(doc.id)}
                                                    className={`w-full flex items-center gap-3 p-4 border rounded-xl text-left transition-colors ${
                                                        checked ? 'border-[#003971] bg-[#003971]/5' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                                                            checked ? 'bg-[#003971] border-[#003971]' : 'border-gray-300 bg-white'
                                                        }`}
                                                    >
                                                        {checked && <Check size={14} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm text-gray-900 truncate">{doc.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {doc.expiryDate
                                                                ? `Expires ${new Date(doc.expiryDate).toLocaleDateString()}`
                                                                : 'No expiry'}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-gray-800 mb-1">Link expires after</h3>
                                <p className="text-xs text-gray-500 mb-3">
                                    Access is revoked automatically once the link expires.
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {EXPIRY_OPTIONS.map((option) => (
                                        <button
                                            key={option.hours}
                                            type="button"
                                            onClick={() => setExpiresInHours(option.hours)}
                                            className={`p-3 rounded-xl border-2 text-center transition-colors ${
                                                expiresInHours === option.hours
                                                    ? 'border-[#003971] bg-[#003971]/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <p
                                                className={`font-bold text-sm ${
                                                    expiresInHours === option.hours ? 'text-[#003971]' : 'text-gray-800'
                                                }`}
                                            >
                                                {option.label}
                                            </p>
                                            {option.hint && <p className="text-[11px] text-gray-500 mt-0.5">{option.hint}</p>}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-gray-800 mb-1">Downloads</h3>
                                <p className="text-xs text-gray-500 mb-3">
                                    By default recipients can only preview documents in the browser.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setAllowDownload((prev) => !prev)}
                                    className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-colors ${
                                        allowDownload ? 'border-[#003971] bg-[#003971]/5' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                                            allowDownload ? 'bg-[#003971] border-[#003971]' : 'border-gray-300 bg-white'
                                        }`}
                                    >
                                        {allowDownload && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <Download className={`h-5 w-5 flex-shrink-0 ${allowDownload ? 'text-[#003971]' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Allow recipients to download</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Files can be saved outside MaritimeLink — for example into a recruiter&apos;s
                                            HR records. Only enable for people you trust.
                                        </p>
                                    </div>
                                </button>
                            </section>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-[#003971]" />
                                {allowDownload
                                    ? 'Downloads enabled for this link.'
                                    : 'Preview only — recipients cannot download your files.'}
                            </p>
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={nothingSelected || isGenerating}
                                    className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#002855] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                                    {isGenerating ? 'Generating…' : 'Generate link'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ModalOverlay>
    );
}
