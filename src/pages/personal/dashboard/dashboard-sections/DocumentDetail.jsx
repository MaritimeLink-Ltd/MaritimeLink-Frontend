import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Trash2, Loader2, FileText, AlertTriangle, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import documentService from '../../../../services/documentService';
import { API_CONFIG } from '../../../../config/api.config';

// ─────────────────────────────────────────────────────────────────────────────
// Utility: isInternalUrl
//
// Returns true only if the given URL belongs to our own backend API.
// External URLs (Supabase Storage, S3, Cloudinary, etc.) return false.
//
// Why this matters:
//   Supabase public-bucket URLs reject requests that carry an Authorization
//   header — they respond with 400 Bad Request. Our hook was sending
//   `Bearer <token>` to every URL, causing the preview to always fail.
//   The fix: only send the Bearer token to our own API.
// ─────────────────────────────────────────────────────────────────────────────
const isInternalUrl = (url) => {
    try {
        const fileOrigin = new URL(url).origin;
        const apiOrigin = new URL(API_CONFIG.BASE_URL).origin;
        return fileOrigin === apiOrigin;
    } catch {
        // If URL parsing fails (e.g. a relative path), treat it as internal
        return true;
    }
};

/**
 * Ensures the URL is absolute. Relative paths (e.g. /api/professional/...)
 * are resolved against the API base URL so they hit the backend, not the
 * frontend dev server.
 */
const resolveFileUrl = (url) => {
    if (!url) return null;
    // Already absolute or a blob — leave as-is
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    // Relative path → prepend API base URL
    const base = API_CONFIG.BASE_URL.replace(/\/+$/, ''); // strip trailing slash
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
};


const useAuthImage = (rawFileUrl) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPdf, setIsPdf] = useState(false);

    // Use a ref so the cleanup function always sees the latest blob URL
    const blobUrlRef = useRef(null);

    useEffect(() => {
        // Resolve relative paths against the API base URL
        const fileUrl = resolveFileUrl(rawFileUrl);
        if (!fileUrl) return;

        // Already a local blob URL — no fetch needed
        if (fileUrl.startsWith('blob:')) {
            setImageSrc(fileUrl);
            return;
        }

        let cancelled = false;

        const fetchFile = async () => {
            setLoading(true);
            setImageSrc(null);

            try {
                // Only attach Bearer token for our own API URLs
                const needsAuth = isInternalUrl(fileUrl);

                const token = needsAuth
                    ? (localStorage.getItem('authToken') ||
                        localStorage.getItem('token') ||
                        localStorage.getItem('accessToken') ||
                        null)
                    : null;

                const response = await fetch(fileUrl, {
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch document: ${response.status} ${response.statusText}`
                    );
                }

                // Detect PDF via Content-Type header first, then URL extension
                const contentType = response.headers.get('content-type') || '';
                const detectedAsPdf =
                    contentType.includes('pdf') ||
                    fileUrl.toLowerCase().includes('.pdf');

                const blob = await response.blob();

                // Guard against state updates after unmount / URL change
                if (cancelled) return;

                // Revoke any previous blob URL before creating a new one
                if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                }

                const url = URL.createObjectURL(blob);
                blobUrlRef.current = url;

                setIsPdf(detectedAsPdf);
                setImageSrc(url);
            } catch (err) {
                console.error('[useAuthImage] Failed to load document file:', err);
                if (!cancelled) setImageSrc(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchFile();

        // Cleanup: revoke blob URL & prevent stale state updates
        return () => {
            cancelled = true;
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [rawFileUrl]);

    return { imageSrc, loading, isPdf };
};

// ─────────────────────────────────────────────────────────────────────────────
// Component: DocumentDetail
// ─────────────────────────────────────────────────────────────────────────────
const DocumentDetail = ({ document, onBack, onDeleteSuccess }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Support both fileUrl and image as the document file source
    const fileUrl = document?.fileUrl || document?.image || null;

    const { imageSrc, loading: imageLoading, isPdf } = useAuthImage(fileUrl);

    if (!document) return null;

    // ── Delete Handlers ───────────────────────────────────────────────────────
    const handleDeleteClick = () => setShowDeleteModal(true);

    const handleDeleteConfirm = async () => {
        try {
            setIsDeleting(true);
            await documentService.deleteDocument(document.id);
            setShowDeleteModal(false);
            toast.success('Document deleted successfully');
            if (onDeleteSuccess) onDeleteSuccess();
            else onBack();
        } catch (error) {
            toast.error(error.message || 'Failed to delete document');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Date Formatter ────────────────────────────────────────────────────────
    const formatDate = (value) => {
        if (!value) return 'N/A';
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-7xl mx-auto p-8">
            <Toaster />

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        disabled={isDeleting}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Document Detail
                    </h1>
                </div>

                <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                >
                    <Trash2 size={16} />
                    Delete Document
                </button>
            </div>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-12">

                {/* Left — Document Preview */}
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 flex items-center justify-center min-h-[600px]">

                        {/* Loading */}
                        {imageLoading && (
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <Loader2 size={40} className="animate-spin text-[#003366]" />
                                <span className="text-sm">Loading document...</span>
                            </div>
                        )}

                        {/* PDF — blob URL, so no auth header needed inside iframe */}
                        {!imageLoading && isPdf && imageSrc && (
                            <iframe
                                src={imageSrc}
                                title="Document PDF Preview"
                                className="w-full h-[560px] rounded border-0"
                            />
                        )}

                        {/* Image */}
                        {!imageLoading && !isPdf && imageSrc && (
                            <img
                                src={imageSrc}
                                alt={document.title || document.name || 'Document'}
                                className="max-w-full h-auto max-h-[560px] shadow-lg rounded object-contain"
                            />
                        )}

                        {/* Fallback */}
                        {!imageLoading && !imageSrc && (
                            <div className="flex flex-col items-center gap-4 text-gray-400">
                                <FileText size={64} className="text-gray-300" />
                                <span className="text-sm font-medium">
                                    Document Preview Unavailable
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Details */}
                <div className="w-full lg:w-[400px] space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                            {document.name || document.title}
                        </h2>
                        <span className="inline-block bg-[#003366] text-white text-sm px-4 py-1.5 rounded-full font-medium">
                            {document.type || document.category || 'Document'}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">
                                Certificate Number
                            </label>
                            <div className="text-gray-900 font-medium">
                                {document.number || document.certificateNumber || 'N/A'}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">
                                Issuing Country
                            </label>
                            <div className="text-gray-900 font-medium">
                                {document.issuingCountry || 'N/A'}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">
                                Date Of Issue
                            </label>
                            <div className="text-gray-900 font-medium">
                                {formatDate(document.issueDate || document.dateOfIssue)}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm text-gray-500 mb-1">
                                Valid Till
                            </label>
                            <div className="text-gray-900 font-medium">
                                {formatDate(document.expiryDate || document.validTill)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Delete Confirmation Modal ────────────────────────────────── */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <div className="flex justify-end p-3 pb-0">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-6 text-center">
                            {/* Warning Icon */}
                            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle size={28} className="text-red-500" />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete Document
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">
                                Are you sure you want to delete
                            </p>
                            <p className="text-sm font-semibold text-gray-700 mb-5">
                                "{document.name || document.title}"?
                            </p>
                            <p className="text-xs text-gray-400 mb-6">
                                This action cannot be undone.
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isDeleting
                                        ? <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                                        : <><Trash2 size={16} /> Delete</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentDetail;