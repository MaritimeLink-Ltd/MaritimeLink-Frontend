import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Ship,
    Clock,
    MapPin,
    Check,
    Star,
    Briefcase,
    FileText,
    Lock,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    User,
    Wallet,
} from 'lucide-react';
import publicProfileService from '../../services/publicProfileService';
import authService from '../../services/authService';
import VerificationBadge from '../../components/common/VerificationBadge';

/** Keep in sync with the serverless renderer in /api/profile.js. */
function buildMetaDescription(profile) {
    if (!profile) return '';
    const bits = [profile.rank, profile.seaTimeLabel ? `${profile.seaTimeLabel} sea time` : null]
        .filter(Boolean)
        .join(' · ');
    const where = profile.country ? ` Based in ${profile.country}.` : '';
    const vessels = profile.vesselTypes?.length
        ? ` Experience on ${profile.vesselTypes.slice(0, 4).join(', ')}.`
        : '';
    const availability = profile.availableForWork
        ? ' Currently available for work.'
        : ' Currently employed / on contract.';
    return `${profile.name}${bits ? ` — ${bits}.` : '.'}${where}${vessels}${availability} View the full maritime career profile on MaritimeLink.`.trim();
}

/**
 * Public, search-indexable career summary (no login required).
 *
 * Only the conservative summary is public. The full resume, document wallet and
 * messaging are gated behind a MaritimeLink account, mirroring the way the profile
 * appears to recruiters once they are signed in.
 */
export default function PublicProfile() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);

    const isLoggedIn = authService.isAuthenticated();

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const res = await publicProfileService.getBySlug(slug);
                const found = (res?.data ?? res)?.profile;
                if (!alive) return;
                if (!found) {
                    setError('This profile is not available.');
                    setProfile(null);
                } else {
                    setProfile(found);
                }
            } catch (e) {
                if (!alive) return;
                setError(
                    e?.status === 404
                        ? 'This profile is either private or no longer available.'
                        : e?.message || 'Could not load this profile.',
                );
                setProfile(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [slug]);

    /**
     * Client-side meta tags. The serverless renderer already injects these for crawlers;
     * this keeps them correct during in-app client-side navigation.
     */
    useEffect(() => {
        if (!profile) return undefined;

        const previousTitle = document.title;
        const title = `${profile.name}${profile.rank ? ` — ${profile.rank}` : ''} | MaritimeLink`;
        document.title = title;

        const setMeta = (selector, attr, value) => {
            let tag = document.head.querySelector(selector);
            if (!tag) {
                tag = document.createElement('meta');
                const [key, val] = attr;
                tag.setAttribute(key, val);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', value);
            return tag;
        };

        const description = buildMetaDescription(profile);
        setMeta('meta[name="description"]', ['name', 'description'], description);
        setMeta('meta[property="og:title"]', ['property', 'og:title'], title);
        setMeta('meta[property="og:description"]', ['property', 'og:description'], description);
        setMeta('meta[property="og:type"]', ['property', 'og:type'], 'profile');

        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', `${window.location.origin}/in/${profile.slug}`);

        return () => {
            document.title = previousTitle;
        };
    }, [profile]);

    const skills = useMemo(
        () => (Array.isArray(profile?.skills) ? profile.skills : []),
        [profile],
    );

    const experienceLines = useMemo(
        () => (Array.isArray(profile?.experienceLines) ? profile.experienceLines : []),
        [profile],
    );

    /**
     * This page is public, so the viewer may be anyone. Send each role somewhere that
     * actually exists for them rather than assuming everyone is a recruiter.
     * Recruiters/admins land on candidate search with the name pre-filled, so they
     * arrive at this professional instead of a blank search.
     */
    const viewerAction = useMemo(() => {
        if (!isLoggedIn || !profile) return null;

        const userType = String(localStorage.getItem('userType') || '').toLowerCase();
        const searchState = { state: { searchQuery: profile.name } };

        switch (userType) {
            case 'recruiter':
                return { label: `Find ${profile.name} in MaritimeLink`, to: '/recruiter/search', ...searchState };
            case 'admin':
                // /admin/search redirects to /recruiter/search, preserving state.
                return { label: `Find ${profile.name} in MaritimeLink`, to: '/admin/search', ...searchState };
            case 'training-provider':
                return { label: 'Open my MaritimeLink dashboard', to: '/trainingprovider-dashboard' };
            case 'professional':
                return { label: 'Go to my dashboard', to: '/personal/dashboard' };
            default:
                return { label: 'Go to MaritimeLink', to: '/' };
        }
    }, [isLoggedIn, profile]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#003366] border-t-transparent" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-slate-50">
                <PublicHeader />
                <main className="max-w-3xl mx-auto px-4 py-16">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 flex gap-3 items-start">
                        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-900">Profile unavailable</p>
                            <p className="text-sm text-amber-800 mt-1">{error}</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const LockedCard = ({ icon: Icon, title, blurb }) => (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-slate-400" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        {title}
                        <Lock className="h-4 w-4 text-slate-400" />
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{blurb}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <PublicHeader />

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
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
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                                    {profile.name}
                                </h1>
                                {profile.rank && (
                                    <p className="text-lg text-slate-600 font-medium mb-3">{profile.rank}</p>
                                )}
                                <div className="space-y-2">
                                    {profile.vesselTypes?.map((vesselType) => (
                                        <div key={vesselType} className="flex items-center gap-2 text-slate-700">
                                            <Ship className="h-4 w-4 text-[#003366]" />
                                            <span className="font-medium">{vesselType}</span>
                                        </div>
                                    ))}
                                    {profile.seaTimeLabel && (
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Clock className="h-4 w-4 text-[#003366]" />
                                            <span className="font-medium">{profile.seaTimeLabel} sea time</span>
                                        </div>
                                    )}
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
                            <VerificationBadge verified={profile.verified} />
                            {profile.availableForWork ? (
                                <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 whitespace-nowrap">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                    Available for Job
                                </div>
                            ) : (
                                <div className="bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 whitespace-nowrap">
                                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                                    Currently Employed / On Contract
                                </div>
                            )}
                        </div>
                    </div>

                    {profile.summary && (
                        <p className="mt-6 pt-6 border-t border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                            {profile.summary}
                        </p>
                    )}
                </div>

                {experienceLines.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-5">
                            <Briefcase className="h-5 w-5 text-[#003366]" />
                            <h2 className="text-lg font-bold text-[#003366]">Experience Summary</h2>
                        </div>
                        <div className="space-y-3">
                            {experienceLines.map((line, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl">
                                    <div className="h-2 w-2 rounded-full bg-[#003366] mt-2 flex-shrink-0" />
                                    <p className="text-slate-700 font-medium">{line}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {skills.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-5">
                            <Star className="h-5 w-5 text-[#003366]" />
                            <h2 className="text-lg font-bold text-[#003366]">Key Skills &amp; Competencies</h2>
                        </div>
                        <div className="space-y-4">
                            {skills.map((skill, idx) => (
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

                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-5 w-5 text-[#003366]" />
                        <h2 className="text-lg font-bold text-[#003366]">
                            {isLoggedIn ? 'Full profile' : 'Members-only details'}
                        </h2>
                    </div>
                    <p className="text-sm text-slate-600 mb-5">
                        {isLoggedIn
                            ? `The full resume, verified document wallet and direct messaging for ${profile.name} are available inside MaritimeLink.`
                            : `The full resume, verified document wallet and direct messaging for ${profile.name} are available to MaritimeLink members.`}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3 mb-6">
                        <LockedCard icon={FileText} title="Full Resume" blurb="Licences, endorsements, education and full sea-service history." />
                        <LockedCard icon={Wallet} title="Document Wallet" blurb="Verified certificates with expiry tracking." />
                        <LockedCard icon={MessageSquare} title="Direct Messaging" blurb="Contact this professional directly." />
                    </div>

                    {viewerAction ? (
                        <button
                            type="button"
                            onClick={() => navigate(viewerAction.to, { state: viewerAction.state })}
                            className="bg-[#003366] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#002855] transition-colors"
                        >
                            {viewerAction.label}
                        </button>
                    ) : (
                        <>
                            {/* Signed-out visitors are usually recruiters arriving from search. */}
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/recruiter/login"
                                    className="bg-[#003366] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#002855] transition-colors"
                                >
                                    Sign in as recruiter
                                </Link>
                                <Link
                                    to="/signin"
                                    className="border-2 border-[#003366] text-[#003366] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#003366] hover:text-white transition-colors"
                                >
                                    Sign in as professional
                                </Link>
                            </div>
                            <p className="text-sm text-slate-500 mt-3">
                                New to MaritimeLink?{' '}
                                <Link to="/signup" className="font-semibold text-[#003366] hover:underline">
                                    Create an account
                                </Link>
                            </p>
                        </>
                    )}
                </div>

                <p className="text-xs text-slate-500 text-center pb-4">
                    This is a public profile summary published by the professional on MaritimeLink.
                </p>
            </main>
        </div>
    );
}

function PublicHeader() {
    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="MaritimeLink" className="h-10 w-auto" />
                    <div>
                        <p className="text-lg font-semibold text-slate-900">MaritimeLink</p>
                        <p className="text-xs text-slate-500">Maritime careers network</p>
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        to="/signin"
                        className="text-sm font-medium text-[#003366] hover:underline px-3 py-2"
                    >
                        Sign in
                    </Link>
                    <Link
                        to="/signup"
                        className="text-sm font-bold bg-[#003366] text-white px-4 py-2 rounded-xl hover:bg-[#002855] transition-colors"
                    >
                        Join
                    </Link>
                </div>
            </div>
        </header>
    );
}
