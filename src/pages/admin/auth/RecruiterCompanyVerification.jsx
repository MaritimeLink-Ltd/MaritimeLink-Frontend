import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../../services/authService';

const COMPANY_VERIFICATION_STORAGE_KEY = 'companyVerificationDecision';

function mapLookupToDisplay(lookupPayload) {
    const root = lookupPayload && typeof lookupPayload === 'object' ? lookupPayload : {};
    const d = root.company && typeof root.company === 'object' ? root.company : root;

    return {
        logo: d.logo || d.logoUrl || d.companyLogo || '',
        name: d.organizationName || d.name || d.companyName || '',
        website: d.company_website || d.website || d.url || '',
        address: [d.address_street, d.address_location].filter(Boolean).join(', '),
        city: d.address_city || '',
        state: d.country_region || '',
        postcode: d.zip_code || '',
        country: d.country_name || d.country_code || '',
        linkedin: d.linkedin || '',
        source: d.source || root.source || '',
        sources: d.sources || root.sources || [],
        raw: d,
        apiResponse: root,
    };
}

function getLookupPayload(response) {
    if (!response || typeof response !== 'object') return null;
    return response.data || response;
}

function normalizeUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function normalizeDomain(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    try {
        const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        return new URL(withProtocol).hostname.replace(/^www\./, '');
    } catch {
        return raw
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0]
            .split('?')[0];
    }
}

function faviconUrl(value) {
    const domain = normalizeDomain(value);
    return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';
}

function normalizeLinkedInSlug(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    const cleaned = raw.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '');
    const parts = cleaned.split('?')[0].split('/').filter(Boolean);
    const companyIndex = parts.indexOf('company');
    if (companyIndex >= 0 && parts[companyIndex + 1]) return parts[companyIndex + 1];
    return parts[parts.length - 1] || cleaned;
}

function fieldValue(value) {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    return value || '';
}

function verificationState(type, entered, fetched) {
    if (!entered || !fetched) return 'unknown';
    if (type === 'website') return normalizeDomain(entered) === normalizeDomain(fetched) ? 'match' : 'mismatch';
    if (type === 'linkedin') return normalizeLinkedInSlug(entered) === normalizeLinkedInSlug(fetched) ? 'match' : 'mismatch';
    return 'unknown';
}

function VerificationBadge({ state }) {
    if (state === 'match') {
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                Matches entered
            </span>
        );
    }
    if (state === 'mismatch') {
        return (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                Different from entered
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
            Not entered
        </span>
    );
}

function RecruiterCompanyVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    const formData = location.state?.formData;
    const [lookupPreview, setLookupPreview] = useState(location.state?.lookupPreview || null);
    const verification = location.state?.verification;
    const fromState = lookupPreview || location.state?.companyData;

    const companyData = fromState || {
        logo: lookupPreview?.logo || '',
        name: formData?.companyName || lookupPreview?.name || '',
        website: formData?.website || lookupPreview?.website || '',
    };
    const hasPublicLookup = Boolean(lookupPreview?.apiResponse || lookupPreview?.raw);

    const recruiterId = localStorage.getItem('recruiterId');

    const buildEnteredPayload = () => ({
        recruiterId,
        organizationName: formData?.companyName?.trim() || companyData.name || '',
        address: formData?.address?.trim() || '',
        companyCity: formData?.city?.trim() || '',
        companyState: formData?.stateProvince?.trim() || '',
        companyZip: formData?.postcode?.trim() || '',
        companyCountry: formData?.country?.trim() || '',
        website: normalizeUrl(formData?.website),
        companyLinkedIn: normalizeUrl(formData?.linkedIn),
    });

    const buildLookupPayload = () => ({
        recruiterId,
        organizationName: lookupPreview?.name || companyData.name || formData?.companyName || '',
        address: lookupPreview?.address || formData?.address || '',
        companyCity: lookupPreview?.city || formData?.city || '',
        companyState: lookupPreview?.state || formData?.stateProvince || '',
        companyZip: lookupPreview?.postcode || formData?.postcode || '',
        companyCountry: lookupPreview?.country || formData?.country || '',
        website: normalizeUrl(lookupPreview?.website || formData?.website),
        companyLinkedIn: normalizeUrl(lookupPreview?.linkedin || formData?.linkedIn),
        companyLogo: lookupPreview?.logo || companyData.logo || '',
    });

    const showLookupCompare =
        lookupPreview?.name &&
        formData?.companyName &&
        lookupPreview.name.trim().toLowerCase() !== formData.companyName.trim().toLowerCase();
    const apiCompany = lookupPreview?.raw || lookupPreview?.apiResponse?.company || {};
    const enteredWebsite = formData?.website || '';
    const fetchedWebsite = lookupPreview?.website || apiCompany.company_website || '';
    const displayLogo =
        lookupPreview?.logo ||
        apiCompany.logo ||
        companyData.logo ||
        faviconUrl(fetchedWebsite || enteredWebsite);
    const enteredLinkedIn = formData?.linkedIn || '';
    const fetchedLinkedIn = lookupPreview?.linkedin || apiCompany.linkedin || '';
    const detailRows = [
        ['Website', fetchedWebsite, verificationState('website', enteredWebsite, fetchedWebsite), enteredWebsite],
        ['Address', [lookupPreview?.address, lookupPreview?.city, lookupPreview?.state, lookupPreview?.postcode, lookupPreview?.country].filter(Boolean).join(', ')],
        ['Registration #', apiCompany.registration_number],
        ['Status', apiCompany.status],
        ['Legal form', apiCompany.company_legal_form],
        ['Industry', Array.isArray(apiCompany.industry) ? apiCompany.industry.map((item) => item?.value).filter(Boolean).join(', ') : ''],
        ['Email', apiCompany.company_email],
        ['Phone', apiCompany.company_phone],
        ['LinkedIn', fetchedLinkedIn, verificationState('linkedin', enteredLinkedIn, fetchedLinkedIn), enteredLinkedIn],
    ].filter(([, value]) => fieldValue(value));
    const sourceLinks = Array.isArray(lookupPreview?.sources) ? lookupPreview.sources.slice(0, 3) : [];

    useEffect(() => {
        const lookupCompany = async () => {
            if (lookupPreview || !formData?.companyName) return;

            setLookupLoading(true);
            setLookupError('');

            try {
                const response = await authService.lookupCompanyDetails({
                    organizationName: formData.companyName,
                    url: formData.website,
                    address: formData.address,
                    companyCity: formData.city,
                    companyState: formData.stateProvince,
                    companyZip: formData.postcode,
                    companyCountry: formData.country,
                    companyLinkedIn: formData.linkedIn,
                });
                const payload = getLookupPayload(response);
                const mapped = mapLookupToDisplay(payload);
                setLookupPreview(mapped);
            } catch (err) {
                console.error('Company verification lookup failed:', err);
                setLookupError('We could not fetch public company details right now. You can continue with your entered details.');
            } finally {
                setLookupLoading(false);
            }
        };

        lookupCompany();
    }, [formData, lookupPreview]);

    const saveDecision = ({ organizationVerified, useManualDetails }) => {
        const decision = {
            organizationVerified,
            useManualDetails,
            riskLevel: organizationVerified ? 'LOW' : 'HIGH',
            source: organizationVerified ? (verification?.source || lookupPreview?.source || 'GEMINI_GOOGLE_SEARCH') : 'USER_DECLINED_LOOKUP',
            selectedCompany: organizationVerified ? companyData : null,
            enteredCompany: formData || null,
            lookupApiResponse: lookupPreview?.apiResponse || lookupPreview?.raw || lookupPreview || null,
            decidedAt: new Date().toISOString(),
        };

        localStorage.setItem(COMPANY_VERIFICATION_STORAGE_KEY, JSON.stringify(decision));
        return decision;
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            if (!recruiterId) {
                throw new Error('Session expired. Please restart registration.');
            }
            if (!hasPublicLookup) {
                throw new Error(
                    'Public company verification is not available right now. Please use your entered details.',
                );
            }
            const decision = saveDecision({
                organizationVerified: true,
                useManualDetails: false,
            });

            await authService.setRecruiterCompanyDetails({
                ...buildLookupPayload(),
                organizationVerified: true,
                organizationRiskLevel: 'LOW',
                organizationVerificationSource: decision.source,
                organizationVerificationDecision: 'CONFIRMED_PUBLIC_LOOKUP',
                organizationVerificationData: decision.lookupApiResponse,
            });

            navigate('/agent/compliance-declaration', {
                state: {
                    companyData,
                    lookupPreview,
                    verification: {
                        ...verification,
                        ...decision,
                    },
                },
            });
        } catch (err) {
            console.error('Company confirmation error:', err);
            setLookupError(err.data?.message || err.message || 'Could not save company confirmation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        setLoading(true);
        try {
            if (!recruiterId) {
                throw new Error('Session expired. Please restart registration.');
            }
            const decision = saveDecision({
                organizationVerified: false,
                useManualDetails: true,
            });

            await authService.setRecruiterCompanyDetails({
                ...buildEnteredPayload(),
                organizationVerified: false,
                organizationRiskLevel: 'HIGH',
                organizationVerificationSource: decision.source,
                organizationVerificationDecision: 'DECLINED_PUBLIC_LOOKUP',
                organizationVerificationData: {
                    enteredCompany: formData || null,
                    declinedLookup: decision.lookupApiResponse,
                },
            });

            navigate('/agent/compliance-declaration', {
                state: {
                    useManualDetails: true,
                    companyData: formData || companyData,
                    lookupPreview,
                    verification: {
                        ...verification,
                        ...decision,
                    },
                },
            });
        } catch (err) {
            console.error('Company decline error:', err);
            setLookupError(err.data?.message || err.message || 'Could not save company decision. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    <div className="mb-4 sm:mb-6 -ml-2">
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink Logo"
                            className="w-20 sm:w-24 h-auto"
                        />
                    </div>

                    <p className="text-sm text-gray-700 mb-1">Welcome to MaritimeLink</p>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Confirm your organization</h1>
                    <p className="text-sm text-gray-600 mb-6">
                        We use public web sources to help verify company details. Please confirm this is the organization you represent.
                    </p>

                    {lookupLoading && (
                        <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-sm font-semibold text-[#003971]">Fetching public company details...</p>
                            <p className="text-sm text-gray-600 mt-1">We are checking the organization name against public web sources.</p>
                        </div>
                    )}

                    {lookupError && (
                        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">{lookupError}</p>
                        </div>
                    )}

                    {showLookupCompare && (
                        <div className="mb-4 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <p>
                                <span className="font-semibold text-gray-800">You entered:</span>{' '}
                                {formData.companyName}
                            </p>
                            <p className="mt-1">
                                <span className="font-semibold text-gray-800">Public lookup suggested:</span>{' '}
                                {lookupPreview.name}
                            </p>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                        {displayLogo ? (
                            <div className="mb-4 flex flex-col items-center">
                                <img
                                    src={displayLogo}
                                    alt={`${companyData.name || 'Company'} logo`}
                                    className="w-24 h-24 object-contain rounded-xl bg-white border border-gray-100 p-2"
                                />
                                <p className="mt-2 text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                                    Fetched logo
                                </p>
                            </div>
                        ) : (
                            <div className="mb-4 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-3xl font-bold text-[#003971]">
                                    {(companyData.name || 'C').charAt(0)}
                                </div>
                                <p className="mt-2 text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                                    No logo returned
                                </p>
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">{companyData.name}</h2>

                        <div className="mt-5 space-y-3">
                            {detailRows.length > 0 ? (
                                detailRows.map(([label, value, matchState, enteredValue]) => (
                                    <div key={label} className="rounded-xl bg-white border border-gray-100 px-4 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
                                            {(label === 'Website' || label === 'LinkedIn') && (
                                                <VerificationBadge state={matchState} />
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-800 break-words">{fieldValue(value)}</p>
                                        {(label === 'Website' || label === 'LinkedIn') && enteredValue && matchState === 'mismatch' && (
                                            <p className="mt-2 text-xs text-gray-500 break-words">
                                                You entered: {enteredValue}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center">No public company details were returned.</p>
                            )}
                        </div>

                        {sourceLinks.length > 0 && (
                            <div className="mt-4 rounded-xl bg-white border border-gray-100 px-4 py-3">
                                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">Public sources</p>
                                <div className="mt-2 space-y-1">
                                    {sourceLinks.map((source, index) => (
                                        <a
                                            key={`${source.uri || source.url || index}`}
                                            href={source.uri || source.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block text-xs text-[#003971] hover:underline break-words"
                                        >
                                            {source.title || source.uri || source.url}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {companyData.source && (
                            <p className="mt-4 text-[11px] font-semibold text-[#003971] uppercase tracking-wide text-center">
                                Verified using public search
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || lookupLoading || !hasPublicLookup}
                        className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] mb-4"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Continuing...
                            </>
                        ) : (
                            'Yes, this is my organization'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleDecline}
                        disabled={loading}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                        No — this is not my organization; I will use my entered details
                    </button>
                </div>
            </div>

            <div className="hidden lg:flex lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16 items-start justify-center bg-gray-50">
                <img
                    src="/images/signup-image.webp"
                    alt="Maritime Professional"
                    className="w-[735px] max-h-full object-cover rounded-[15px]"
                />
            </div>
        </div>
    );
}

export default RecruiterCompanyVerification;
