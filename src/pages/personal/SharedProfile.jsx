import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Ship,
    Clock,
    MapPin,
    Check,
    Star,
    Briefcase,
    FileText,
    Eye,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Award,
    GraduationCap,
    ShieldCheck,
} from 'lucide-react';
import profileShareService from '../../services/profileShareService';
import { buildSeaServiceExperience, formatTotalSeaTimeLabel } from '../../utils/seaServiceExperience';

function formatDate(value) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return '—';
    }
}

function formatCategoryLabel(doc) {
    return String(doc.displayCategory || doc.category || '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Public page: open a shared professional profile from a link (no login).
 * Documents are previewed inline through the API; direct file URLs are never exposed.
 */
export default function SharedProfile() {
    const { token: tokenParam } = useParams();
    const token = tokenParam ? decodeURIComponent(tokenParam) : '';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
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
                const res = await profileShareService.getSharedProfile(token);
                const payload = res?.data ?? res;
                if (!alive) return;
                if (!payload?.profile) {
                    setError('Could not load this shared profile.');
                    setData(null);
                } else {
                    setData(payload);
                    if (payload.documents?.length) setSelectedId(payload.documents[0].id);
                }
            } catch (e) {
                if (!alive) return;
                setError(e?.message || 'This link is invalid or has expired.');
                setData(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [token]);

    const selectedDoc = useMemo(
        () => data?.documents?.find((d) => d.id === selectedId) || null,
        [data, selectedId],
    );

    /**
     * Fetch into a blob URL rather than pointing an iframe at the API: the API sends
     * X-Frame-Options: SAMEORIGIN (Helmet), which blocks embedding cross-origin.
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
            return undefined;
        }

        let cancelled = false;
        const url = profileShareService.sharedFileUrl(token, selectedId);

        setPreviewLoading(true);
        setPreviewError('');

        (async () => {
            try {
                const res = await fetch(url, { method: 'GET', credentials: 'omit' });
                if (!res.ok) {
                    throw new Error(
                        res.status === 401 || res.status === 403
                            ? 'Link expired or this document is not shared.'
                            : `Preview failed (${res.status})`,
                    );
                }
                const blob = await res.blob();
                if (cancelled) return;

                const docRow = data?.documents?.find((d) => d.id === selectedId);
                const mime = blob.type || res.headers.get('content-type') || '';
                const nameLower = String(docRow?.name || '').toLowerCase();
                let isImage = mime.startsWith('image/');
                let isPdf = mime.includes('pdf');
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
                if (cancelled) return;
                setPreviewBlobUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    previewBlobRef.current = null;
                    return null;
                });
                setPreviewKind(null);
                setPreviewError(e?.message || 'Could not load preview.');
            } finally {
                if (!cancelled) setPreviewLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token, selectedId, data?.documents]);

    useEffect(() => {
        return () => {
            if (previewBlobRef.current) {
                URL.revokeObjectURL(previewBlobRef.current);
                previewBlobRef.current = null;
            }
        };
    }, []);

    /** Token share links are private: keep them out of search engines entirely. */
    useEffect(() => {
        const tag = document.createElement('meta');
        tag.setAttribute('name', 'robots');
        tag.setAttribute('content', 'noindex, nofollow, noarchive');
        document.head.appendChild(tag);
        return () => {
            document.head.removeChild(tag);
        };
    }, []);

    const summary = useMemo(() => {
        const seaService = Array.isArray(data?.seaService) ? data.seaService : [];
        const seaExperience = buildSeaServiceExperience(seaService);
        return {
            vesselTypes: seaExperience.uniqueVesselTypes,
            seaTime: formatTotalSeaTimeLabel(seaService),
            experience: seaExperience.experienceLines,
        };
    }, [data]);

    const profile = data?.profile;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#003366] flex items-center justify-center">
                            <Ship className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Shared profile</h1>
                            <p className="text-xs text-slate-500">MaritimeLink secure view</p>
                        </div>
                    </div>
                    <Link to="/" className="text-sm font-medium text-[#003366] hover:underline">
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

                {!loading && !error && profile && (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-[#003366] px-3 py-1 font-medium">
                                    <Eye className="w-4 h-4" />
                                    Preview only — downloading is disabled
                                </span>
                                {data.expiresAt && (
                                    <span className="text-slate-600">
                                        Access expires{' '}
                                        <strong>
                                            {new Date(data.expiresAt).toLocaleString(undefined, {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </strong>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                                <div className="flex items-start gap-6">
                                    {profile.profilePhotoUrl ? (
                                        <img
                                            src={profile.profilePhotoUrl}
                                            alt={profile.name}
                                            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-slate-100"
                                        />
                                    ) : (
                                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 border-slate-100 bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-500">
                                            No image
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{profile.name}</h2>
                                        {profile.rank && (
                                            <p className="text-lg text-slate-600 font-medium mb-3">{profile.rank}</p>
                                        )}
                                        <div className="space-y-2">
                                            {summary.vesselTypes.map((vesselType) => (
                                                <div key={vesselType} className="flex items-center gap-2 text-slate-700">
                                                    <Ship className="h-4 w-4 text-[#003366]" />
                                                    <span className="font-medium">{vesselType}</span>
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Clock className="h-4 w-4 text-[#003366]" />
                                                <span className="font-medium">{summary.seaTime}</span>
                                            </div>
                                            {profile.country && (
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <MapPin className="h-4 w-4 text-[#003366]" />
                                                    <span className="font-medium">{profile.country}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start sm:items-end gap-2">
                                    {profile.compliant && (
                                        <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            Fully Compliant
                                        </div>
                                    )}
                                    {profile.availableForWork ? (
                                        <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Available for Job
                                        </div>
                                    ) : (
                                        <div className="bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Currently Employed / On Contract
                                        </div>
                                    )}
                                </div>
                            </div>

                            {profile.summary && (
                                <p className="mt-6 pt-6 border-t border-slate-100 text-slate-700 leading-relaxed">
                                    {profile.summary}
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-5">
                                <Briefcase className="h-5 w-5 text-[#003366]" />
                                <h3 className="text-lg font-bold text-[#003366]">Experience Summary</h3>
                            </div>
                            <div className="space-y-3">
                                {summary.experience.length > 0 ? (
                                    summary.experience.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl">
                                            <div className="h-2 w-2 rounded-full bg-[#003366] mt-2 flex-shrink-0" />
                                            <p className="text-slate-700 font-medium">{item}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-slate-50 p-3.5 rounded-xl text-slate-600 text-sm">
                                        No experience summary available.
                                    </div>
                                )}
                            </div>
                        </div>

                        {data.skills?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                                <div className="flex items-center gap-2 mb-5">
                                    <Star className="h-5 w-5 text-[#003366]" />
                                    <h3 className="text-lg font-bold text-[#003366]">Key Skills &amp; Competencies</h3>
                                </div>
                                <div className="space-y-4">
                                    {data.skills.map((skill, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-slate-900 font-medium">{skill.skillName}</span>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-5 w-5 ${
                                                            i < (skill.rating || 0)
                                                                ? 'fill-[#003366] text-[#003366]'
                                                                : 'fill-slate-200 text-slate-200'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.resume && (
                            <div className="grid gap-6 md:grid-cols-2">
                                {data.resume.licenses?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <ShieldCheck className="h-5 w-5 text-[#003366]" />
                                            <h3 className="text-base font-bold text-[#003366]">Licences &amp; Endorsements</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {data.resume.licenses.map((item) => (
                                                <li key={item.id} className="bg-slate-50 rounded-xl p-3">
                                                    <p className="font-medium text-slate-900 text-sm">
                                                        {item.name || 'Licence'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {item.country ? `${item.country} · ` : ''}
                                                        Expires {formatDate(item.expiryDate)}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {data.resume.stcwCertificates?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Award className="h-5 w-5 text-[#003366]" />
                                            <h3 className="text-base font-bold text-[#003366]">STCW Certificates</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {data.resume.stcwCertificates.map((item) => (
                                                <li key={item.id} className="bg-slate-50 rounded-xl p-3">
                                                    <p className="font-medium text-slate-900 text-sm">
                                                        {item.qualification || 'Certificate'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {item.issuingCountry ? `${item.issuingCountry} · ` : ''}
                                                        Expires {formatDate(item.expiryDate)}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {data.resume.education?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <GraduationCap className="h-5 w-5 text-[#003366]" />
                                            <h3 className="text-base font-bold text-[#003366]">Education</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {data.resume.education.map((item) => (
                                                <li key={item.id} className="bg-slate-50 rounded-xl p-3">
                                                    <p className="font-medium text-slate-900 text-sm">
                                                        {item.qualificationName || 'Qualification'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {item.institution || '—'}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {data.documents?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-[#003366] mb-3 flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Shared documents ({data.documents.length})
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                    <div className="lg:col-span-2">
                                        <div className="rounded-2xl border border-slate-200 bg-white max-h-[70vh] overflow-y-auto shadow-sm">
                                            {data.documents.map((doc) => (
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
                                                        {doc.expiryDate ? ` · Exp. ${formatDate(doc.expiryDate)}` : ''}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white min-h-[360px] lg:min-h-[70vh] overflow-hidden shadow-sm flex flex-col">
                                            {selectedDoc ? (
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
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
