import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Clock, MapPin, Check, Star, Briefcase, FileText, Wallet, CheckCircle2, Timer, Share2, Globe, Crown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import authService from '../../../../services/authService';
import resumeService from '../../../../services/resumeService';
import ShareProfileModal from '../../../../components/profile/ShareProfileModal';
import publicProfileService from '../../../../services/publicProfileService';
import { isPremiumTier } from '../../../../utils/isPremiumTier';
import VerificationBadge from '../../../../components/common/VerificationBadge';
import { isIdentityVerified } from '../../../../utils/kycStatus';
import { resolveProfilePhotoUrl } from '../../../../utils/profilePhoto';
import { buildSeaServiceExperience, formatTotalSeaTimeLabel } from '../../../../utils/seaServiceExperience';

/**
 * Read-only "how recruiters and training providers see you" view of the professional's
 * own profile, plus the availability status control (available for job vs. currently
 * employed / on contract) that recruiters rely on when shortlisting candidates.
 */
const CareerSummary = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [professional, setProfessional] = useState(null);
    const [resume, setResume] = useState(null);
    const [availableForWork, setAvailableForWork] = useState(false);
    const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [publicProfile, setPublicProfile] = useState({ enabled: false, slug: '' });
    const [isUpdatingPublicProfile, setIsUpdatingPublicProfile] = useState(false);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setIsLoading(true);
            const [accountResult, resumeResult, publicResult] = await Promise.allSettled([
                authService.getMyAccount(),
                resumeService.getResume(),
                publicProfileService.getMySettings(),
            ]);

            if (!mounted) return;

            if (accountResult.status === 'fulfilled') {
                const pro = accountResult.value?.data?.professional || null;
                setProfessional(pro);
                setAvailableForWork(Boolean(pro?.availableForWork));
            } else {
                console.error('Failed to load account for career summary:', accountResult.reason);
            }

            if (resumeResult.status === 'fulfilled') {
                setResume(resumeResult.value || null);
            } else {
                console.error('Failed to load resume for career summary:', resumeResult.reason);
            }

            if (publicResult.status === 'fulfilled') {
                const data = publicResult.value?.data || {};
                setPublicProfile({
                    enabled: Boolean(data.publicProfileEnabled),
                    slug: data.slug || '',
                });
            } else {
                console.error('Failed to load public profile settings:', publicResult.reason);
            }

            setIsLoading(false);
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const candidate = useMemo(() => {
        const seaService = Array.isArray(resume?.seaService) ? resume.seaService : [];
        const seaExperience = buildSeaServiceExperience(seaService);

        const skills = Array.isArray(resume?.skills)
            ? resume.skills.map((s) => ({ name: s.skillName || s.name || 'Unnamed skill', rating: Number(s.rating) || 0 }))
            : [];

        const name =
            professional?.fullname ||
            [professional?.firstName, professional?.lastName].filter(Boolean).join(' ') ||
            [resume?.firstName, resume?.lastName].filter(Boolean).join(' ') ||
            'Your name';

        const rank = professional?.profession || professional?.subcategory || resume?.subcategory || resume?.category || 'N/A';

        return {
            name,
            rank,
            image: resolveProfilePhotoUrl({
                profile: { profilePhotoUrl: professional?.profilePhotoUrl || resume?.profilePhotoUrl },
            }),
            location: resume?.country || 'N/A',
            vesselTypes: seaExperience.uniqueVesselTypes,
            seaTime: formatTotalSeaTimeLabel(seaService),
            verified: isIdentityVerified(professional),
            experience: seaExperience.experienceLines,
            skills,
        };
    }, [professional, resume]);

    const handleSetAvailability = async (nextValue) => {
        if (nextValue === availableForWork || isUpdatingAvailability) return;

        const previousValue = availableForWork;
        setAvailableForWork(nextValue);
        setIsUpdatingAvailability(true);
        try {
            await authService.updateAvailability(nextValue);
            toast.success(
                nextValue
                    ? "You're now shown as available for job to recruiters."
                    : "You're now shown as currently employed / on contract."
            );
        } catch (error) {
            setAvailableForWork(previousValue);
            toast.error(error?.message || 'Failed to update availability status. Please try again.');
        } finally {
            setIsUpdatingAvailability(false);
        }
    };

    const handleTogglePublicProfile = async (nextValue) => {
        if (nextValue === publicProfile.enabled || isUpdatingPublicProfile) return;

        const previous = publicProfile;
        setPublicProfile((prev) => ({ ...prev, enabled: nextValue }));
        setIsUpdatingPublicProfile(true);
        try {
            const res = await publicProfileService.setEnabled(nextValue);
            const data = res?.data || {};
            setPublicProfile({
                enabled: Boolean(data.publicProfileEnabled),
                slug: data.slug || previous.slug,
            });
            toast.success(
                nextValue
                    ? 'Your public profile is live and can be found on search engines.'
                    : 'Your public profile is now hidden.'
            );
        } catch (error) {
            setPublicProfile(previous);
            toast.error(error?.message || 'Failed to update your public profile. Please try again.');
        } finally {
            setIsUpdatingPublicProfile(false);
        }
    };

    const publicProfileUrl = publicProfile.slug
        ? `${window.location.origin}/in/${publicProfile.slug}`
        : '';

    /** Secure share links are Premium-only, matching the document wallet share flow. */
    const isPremium = isPremiumTier(
        professional?.tier || professional?.membershipTier || professional?.membership?.tier,
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <div className="w-10 h-10 border-4 border-[#003971] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium">Loading your profile summary...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#003971]">Profile Summary</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        This is how recruiters and training providers see your profile when they view your candidate summary.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">
                        <div className="flex items-start gap-6">
                            {candidate.image ? (
                                <img src={candidate.image} alt={candidate.name} className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-gray-100" />
                            ) : (
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-2 border-gray-100 bg-gray-50 flex items-center justify-center text-sm font-semibold text-gray-500">
                                    No image
                                </div>
                            )}

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h2>
                                <p className="text-lg text-gray-600 font-medium mb-3">{candidate.rank}</p>
                                <div className="space-y-2">
                                    {candidate.vesselTypes?.length > 0
                                        ? candidate.vesselTypes.map((vesselType) => (
                                            <div key={vesselType} className="flex items-center gap-2 text-gray-700">
                                                <Ship className="h-4 w-4 text-[#003971]" />
                                                <span className="font-medium">{vesselType}</span>
                                            </div>
                                        ))
                                        : null}
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="h-4 w-4 text-[#003971]" />
                                        <span className="font-medium">{candidate.seaTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin className="h-4 w-4 text-[#003971]" />
                                        <span className="font-medium">{candidate.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shown either way here so the professional can see their own status. */}
                        <VerificationBadge verified={candidate.verified} showWhenUnverified />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => {
                                if (!isPremium) {
                                    navigate('/personal/profile/manage-subscription');
                                    toast('Secure share links are a Premium feature.', { icon: '⭐' });
                                    return;
                                }
                                setIsShareModalOpen(true);
                            }}
                            className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#002855] transition-colors"
                        >
                            <Share2 className="h-5 w-5" />
                            Share Profile
                            {!isPremium && <Crown className="h-4 w-4 text-amber-300" />}
                        </button>
                        <button
                            onClick={() => navigate('/personal/resume')}
                            className="border-2 border-[#003971] text-[#003971] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#003971] hover:text-white transition-colors"
                        >
                            <FileText className="h-5 w-5" />
                            View Full Resume
                        </button>
                        <button
                            onClick={() => navigate('/personal/documents')}
                            className="border-2 border-[#003971] text-[#003971] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#003971] hover:text-white transition-colors"
                        >
                            <Wallet className="h-5 w-5" />
                            View Document Wallet
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-5 w-5 text-[#003971]" />
                        <h3 className="text-lg font-bold text-[#003971]">Availability Status</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-5">
                        Let recruiters know if you&apos;re open to new opportunities. This is shown on your profile whenever a recruiter or training provider views your candidate summary.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            disabled={isUpdatingAvailability}
                            onClick={() => handleSetAvailability(true)}
                            className={`text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3 disabled:cursor-wait disabled:opacity-70 ${
                                availableForWork
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${availableForWork ? 'text-green-600' : 'text-gray-300'}`} />
                            <div>
                                <p className={`font-bold text-sm ${availableForWork ? 'text-green-700' : 'text-gray-800'}`}>Available for Job</p>
                                <p className="text-xs text-gray-500 mt-0.5">You&apos;re actively looking and open to new offers.</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            disabled={isUpdatingAvailability}
                            onClick={() => handleSetAvailability(false)}
                            className={`text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3 disabled:cursor-wait disabled:opacity-70 ${
                                !availableForWork
                                    ? 'border-[#003971] bg-[#003971]/5'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <Briefcase className={`h-5 w-5 mt-0.5 flex-shrink-0 ${!availableForWork ? 'text-[#003971]' : 'text-gray-300'}`} />
                            <div>
                                <p className={`font-bold text-sm ${!availableForWork ? 'text-[#003971]' : 'text-gray-800'}`}>Currently Employed / On Contract</p>
                                <p className="text-xs text-gray-500 mt-0.5">You&apos;re not actively looking right now.</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5 text-[#003971]" />
                        <h3 className="text-lg font-bold text-[#003971]">Public Profile</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-5">
                        Publish a public summary of your career that anyone can find on Google, without signing in.
                        Your resume, document wallet and messaging always stay private to MaritimeLink members.
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border-2 border-gray-200">
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900">
                                {publicProfile.enabled ? 'Your profile is public' : 'Your profile is private'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {publicProfile.enabled
                                    ? 'Visible to anyone and eligible to appear in search engine results.'
                                    : 'Only you, and members you share with, can see your profile.'}
                            </p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={publicProfile.enabled}
                            aria-label="Public profile"
                            disabled={isUpdatingPublicProfile}
                            onClick={() => handleTogglePublicProfile(!publicProfile.enabled)}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-60 disabled:cursor-wait ${
                                publicProfile.enabled ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                    publicProfile.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    {publicProfile.enabled && publicProfileUrl && (
                        <div className="mt-4">
                            <label htmlFor="public-profile-url" className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                                Your public profile URL
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <input
                                    id="public-profile-url"
                                    type="text"
                                    readOnly
                                    value={publicProfileUrl}
                                    onFocus={(e) => e.target.select()}
                                    className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(publicProfileUrl);
                                            toast.success('Public profile link copied.');
                                        } catch {
                                            toast.error('Could not copy — please copy the link manually.');
                                        }
                                    }}
                                    className="bg-[#003971] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#002855] transition-colors"
                                >
                                    Copy
                                </button>
                                <a
                                    href={publicProfileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="border-2 border-[#003971] text-[#003971] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#003971] hover:text-white transition-colors"
                                >
                                    View
                                </a>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Search engines can take a few days to index a newly published profile.
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <Briefcase className="h-5 w-5 text-[#003971]" />
                        <h3 className="text-lg font-bold text-[#003971]">Experience Summary</h3>
                    </div>
                    <div className="space-y-3">
                        {candidate.experience.length > 0 ? candidate.experience.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl">
                                <div className="h-2 w-2 rounded-full bg-[#003971] mt-2 flex-shrink-0" />
                                <p className="text-gray-700 font-medium">{item}</p>
                            </div>
                        )) : <div className="bg-gray-50 p-3.5 rounded-xl text-gray-600 text-sm">No experience summary available yet — complete your resume to populate this.</div>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <Star className="h-5 w-5 text-[#003971]" />
                        <h3 className="text-lg font-bold text-[#003971]">Key Skills &amp; Competencies</h3>
                    </div>
                    <div className="space-y-4">
                        {candidate.skills.length > 0 ? candidate.skills.map((skill, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-gray-900 font-medium">{skill.name}</span>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 ${i < skill.rating ? 'fill-[#003971] text-[#003971]' : 'fill-gray-200 text-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                        )) : <div className="bg-gray-50 p-3.5 rounded-xl text-gray-600 text-sm">No key skills available yet — add skills in your resume.</div>}
                    </div>
                </div>
            </div>

            <ShareProfileModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
        </div>
    );
};

export default CareerSummary;
