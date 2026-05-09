import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Eye, AlertCircle, Ship, Loader2 } from 'lucide-react';
import documentService from '../../services/documentService';
import { API_CONFIG } from '../../config/api.config';

/** Path only — in dev, fetch via Vite proxy (same origin as the app). */
function sharedFilePath(token, documentId) {
    return `/api/professional/documents/shared/${encodeURIComponent(token)}/file/${documentId}`;
}

function sharedFileUrl(token, documentId) {
    if (import.meta.env.DEV) {
        return sharedFilePath(token, documentId);
    }
    const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
    return `${base}${sharedFilePath(token, documentId)}`;
}

function formatCategoryLabel(doc) {
    const raw = doc.displayCategory || doc.category || '';
    return String(raw)
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatExpiry(expiryDate) {
    if (!expiryDate) return '—';
    try {
        return new Date(expiryDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return '—';
    }
}

/**
 * Public page: open shared document pack from a link (no login).
 * Previews are served inline via the API; direct file URLs are not exposed.
 */
function SharedDocumentPack() {
    const { token: tokenParam } = useParams();
    const token = tokenParam ? decodeURIComponent(tokenParam) : '';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pack, setPack] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
    const [previewKind, setPreviewKind] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const previewBlobRef = useRef(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            if (!token) {
                setError('Invalid link.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const res = await documentService.getSharedDocumentPack(token);
                const data = res?.data ?? res;
                const docs = data?.documents;
                if (!alive) return;
                if (!Array.isArray(docs)) {
                    setError('Could not load shared documents.');
                    setPack(null);
                } else {
                    setPack({
                        documents: docs,
                        previewOnly: data?.previewOnly !== false,
                        expiresAt: data?.expiresAt || null,
                    });
                    if (docs.length > 0) setSelectedId(docs[0].id);
                }
            } catch (e) {
                if (!alive) return;
                setError(e?.message || 'This link is invalid or has expired.');
                setPack(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [token]);

    const selectedDoc = useMemo(
        () => pack?.documents?.find((d) => d.id === selectedId) || null,
        [pack, selectedId],
    );

    /**
     * Load file via fetch + blob URL. Embedding the API URL in an iframe is blocked when the API
     * sends X-Frame-Options: SAMEORIGIN (Helmet) and the app runs on another origin/port.
     */
    useEffect(() => {
        if (!token || !selectedId) {
            setPreviewBlobUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
            previewBlobRef.current = null;
            setPreviewKind(null);
            setPreviewError('');
            setPreviewLoading(false);
            return;
        }

        let cancelled = false;
        const url = sharedFileUrl(token, selectedId);

        setPreviewLoading(true);
        setPreviewError('');

        (async () => {
            try {
                const res = await fetch(url, { method: 'GET', credentials: 'omit' });
                if (!res.ok) {
                    throw new Error(res.status === 401 ? 'Link expired or invalid.' : `Preview failed (${res.status})`);
                }
                const blob = await res.blob();
                if (cancelled) return;

                const docRow = pack?.documents?.find((d) => d.id === selectedId);
                let mime = blob.type || res.headers.get('content-type') || '';
                const nameLower = String(docRow?.name || '').toLowerCase();
                let isImage = mime.startsWith('image/');
                let isPdf = mime.includes('pdf') || mime === 'application/pdf';
                if (!mime || mime === 'application/octet-stream') {
                    if (/\.(png|jpe?g|gif|webp|bmp)$/i.test(nameLower)) isImage = true;
                    if (nameLower.endsWith('.pdf')) isPdf = true;
                }

                setPreviewBlobUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    const next = URL.createObjectURL(blob);
                    previewBlobRef.current = next;
                    return next;
                });
                setPreviewKind(isImage ? 'image' : isPdf ? 'pdf' : 'iframe');
            } catch (e) {
                if (!cancelled) {
                    setPreviewBlobUrl((prev) => {
                        if (prev) URL.revokeObjectURL(prev);
                        previewBlobRef.current = null;
                        return null;
                    });
                    setPreviewKind(null);
                    setPreviewError(
                        e?.message ||
                            'Could not load preview. In local development, start the API and set VITE_PROXY_TARGET if it is not on port 3000.',
                    );
                }
            } finally {
                if (!cancelled) setPreviewLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token, selectedId, pack?.documents]);

    useEffect(() => {
        return () => {
            if (previewBlobRef.current) {
                URL.revokeObjectURL(previewBlobRef.current);
                previewBlobRef.current = null;
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#003366] flex items-center justify-center">
                            <Ship className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Shared documents</h1>
                            <p className="text-xs text-slate-500">MaritimeLink secure view</p>
                        </div>
                    </div>
                    <Link
                        to="/"
                        className="text-sm font-medium text-[#003366] hover:underline"
                    >
                        Back to MaritimeLink
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#003366] border-t-transparent" />
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 flex gap-3 items-start max-w-xl">
                        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-900">Unable to open this link</p>
                            <p className="text-sm text-amber-800 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {!loading && pack && !error && (
                    <>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-sm">
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-[#003366] px-3 py-1 font-medium">
                                    <Eye className="w-4 h-4" />
                                    Preview only — downloading is disabled
                                </span>
                                {pack.expiresAt && (
                                    <span className="text-slate-600">
                                        Access expires{' '}
                                        <strong>
                                            {new Date(pack.expiresAt).toLocaleString(undefined, {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </strong>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2 space-y-2">
                                <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    All documents ({pack.documents.length})
                                </h2>
                                <div className="rounded-2xl border border-slate-200 bg-white max-h-[70vh] overflow-y-auto shadow-sm">
                                    {pack.documents.map((doc) => (
                                        <button
                                            key={doc.id}
                                            type="button"
                                            onClick={() => setSelectedId(doc.id)}
                                            className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition-colors ${
                                                selectedId === doc.id
                                                    ? 'bg-[#003366]/8 border-l-4 border-l-[#003366]'
                                                    : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                                            }`}
                                        >
                                            <p className="font-medium text-slate-900 text-sm line-clamp-2">
                                                {doc.name || 'Untitled'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {formatCategoryLabel(doc)}
                                                {doc.expiryDate ? ` · Exp. ${formatExpiry(doc.expiryDate)}` : ''}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <h2 className="text-sm font-semibold text-slate-700 mb-2">Preview</h2>
                                <div className="rounded-2xl border border-slate-200 bg-white min-h-[360px] lg:min-h-[70vh] overflow-hidden shadow-sm flex flex-col">
                                    {selectedDoc && selectedId ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500">
                                                {selectedDoc.name}
                                            </div>
                                            <div className="flex-1 bg-slate-100 p-2 min-h-[320px] relative flex items-center justify-center">
                                                {previewLoading && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100/90 z-10 text-slate-600 text-sm">
                                                        <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
                                                        Loading preview…
                                                    </div>
                                                )}
                                                {previewError && !previewLoading && (
                                                    <div className="text-center text-sm text-red-700 px-4 max-w-md">
                                                        {previewError}
                                                    </div>
                                                )}
                                                {!previewLoading && !previewError && previewBlobUrl && previewKind === 'image' && (
                                                    <img
                                                        src={previewBlobUrl}
                                                        alt={selectedDoc.name || 'Document'}
                                                        className="max-w-full max-h-[65vh] mx-auto object-contain"
                                                    />
                                                )}
                                                {!previewLoading &&
                                                    !previewError &&
                                                    previewBlobUrl &&
                                                    (previewKind === 'pdf' || previewKind === 'iframe') && (
                                                        <iframe
                                                            title={selectedDoc.name || 'Document preview'}
                                                            src={previewBlobUrl}
                                                            className="w-full h-[65vh] border-0 rounded-lg bg-white"
                                                        />
                                                    )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-8">
                                            Select a document to preview
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default SharedDocumentPack;
